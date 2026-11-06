import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Haversine formula to calculate distance in meters between two lat/lng points
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// GET attendance with date filters
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, employeeId, siteId, clientId } = req.query;
    let sql = `
      SELECT a.*, 
             e.name as employee_name, e.employee_code, e.photo as employee_photo,
             d.name as department_name, des.name as designation_name,
             s.name as site_name, s.latitude as site_lat, s.longitude as site_lng, s.geofence_radius,
             c.id as client_id, c.name as client_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN sites s ON a.site_id = s.id
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      sql += ` AND a.date = $${params.length}`;
    } else if (startDate && endDate) {
      params.push(startDate);
      sql += ` AND a.date >= $${params.length}`;
      params.push(endDate);
      sql += ` AND a.date <= $${params.length}`;
    }

    if (employeeId) {
      params.push(employeeId);
      sql += ` AND (a.employee_id = $${params.length} OR e.employee_code ILIKE $${params.length})`;
    }

    if (siteId) {
      params.push(siteId);
      sql += ` AND a.site_id = $${params.length}`;
    }

    if (clientId) {
      params.push(clientId);
      sql += ` AND (s.client_id = $${params.length} OR e.deployed_client_id = $${params.length})`;
    }

    sql += ' ORDER BY a.date DESC, a.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      employeePhoto: r.employee_photo,
      departmentName: r.department_name,
      designationName: r.designation_name,
      siteId: r.site_id,
      siteName: r.site_name,
      clientName: r.client_name,
      date: r.date ? r.date.toISOString().split('T')[0] : '',
      punchIn: r.punch_in ? r.punch_in.slice(0, 5) : null,
      punchOut: r.punch_out ? r.punch_out.slice(0, 5) : null,
      status: r.status,
      gpsVerified: r.gps_verified,
      punchType: r.punch_type,
      geofenceStatus: r.geofence_status,
      punchInLatitude: r.punch_in_latitude,
      punchInLongitude: r.punch_in_longitude,
      selfieUrl: r.selfie_url,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET today's attendance status for single employee
router.get('/today/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    // Resolve employee id
    const empRes = await query(
      'SELECT id, name, employee_code, deployed_site_id FROM employees WHERE id = $1 OR employee_code ILIKE $1',
      [rawId]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emp = empRes.rows[0];
    const { rows } = await query(
      `SELECT a.*, s.name as site_name, s.latitude as site_lat, s.longitude as site_lng, s.geofence_radius
       FROM attendance a
       LEFT JOIN sites s ON a.site_id = s.id
       WHERE a.employee_id = $1 AND a.date = $2`,
      [emp.id, today]
    );

    if (rows.length === 0) {
      return res.json({
        hasPunchedIn: false,
        hasPunchedOut: false,
        punchIn: null,
        punchOut: null,
        date: today,
        record: null,
      });
    }

    const rec = rows[0];
    res.json({
      hasPunchedIn: !!rec.punch_in,
      hasPunchedOut: !!rec.punch_out,
      punchIn: rec.punch_in ? rec.punch_in.slice(0, 5) : null,
      punchOut: rec.punch_out ? rec.punch_out.slice(0, 5) : null,
      date: today,
      status: rec.status,
      gpsVerified: rec.gps_verified,
      siteName: rec.site_name,
      record: rec,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Punch In / Punch Out with GPS Geofencing verification
router.post('/punch', async (req, res) => {
  try {
    const { employeeId, employeeCode, siteId, latitude, longitude, punchType, accuracy, selfieUrl } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"

    // 1. Resolve employee id
    let targetEmpId = employeeId;
    if (!targetEmpId && employeeCode) {
      const empRes = await query('SELECT id FROM employees WHERE employee_code ILIKE $1', [employeeCode]);
      if (empRes.rows.length > 0) targetEmpId = empRes.rows[0].id;
    } else if (targetEmpId) {
      const empRes = await query('SELECT id FROM employees WHERE id = $1 OR employee_code ILIKE $1', [targetEmpId]);
      if (empRes.rows.length > 0) targetEmpId = empRes.rows[0].id;
    }

    if (!targetEmpId) {
      return res.status(400).json({ error: 'Valid employeeId or employeeCode is required for punch event' });
    }

    // 2. Resolve target site
    let targetSiteId = siteId;
    if (!targetSiteId) {
      const empSiteRes = await query('SELECT deployed_site_id FROM employees WHERE id = $1', [targetEmpId]);
      if (empSiteRes.rows.length > 0) targetSiteId = empSiteRes.rows[0].deployed_site_id;
    }

    // 3. Calculate distance and verify geofence
    let gpsVerified = false;
    let distanceMeters = null;
    let siteName = 'Client Assigned Site';
    let geofenceRadius = 150;

    if (targetSiteId && latitude && longitude) {
      const siteRes = await query('SELECT id, name, latitude, longitude, geofence_radius FROM sites WHERE id = $1', [targetSiteId]);
      if (siteRes.rows.length > 0) {
        const site = siteRes.rows[0];
        siteName = site.name;
        geofenceRadius = site.geofence_radius || 150;
        distanceMeters = Math.round(calculateDistanceMeters(Number(latitude), Number(longitude), Number(site.latitude), Number(site.longitude)));
        gpsVerified = distanceMeters <= geofenceRadius;
      }
    } else {
      // If no GPS hardware or manual simulation
      gpsVerified = true;
    }

    const geofenceStatus = gpsVerified ? 'INSIDE' : 'OUTSIDE';
    const actionType = punchType || 'IN';

    // 4. Check if attendance record exists for today
    const existRes = await query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [targetEmpId, today]
    );

    let result;
    if (existRes.rows.length === 0) {
      // First Punch In of the day
      const id = `ATT${Date.now().toString().slice(-6)}`;
      const { rows } = await query(
        `INSERT INTO attendance (id, employee_id, site_id, date, punch_in, status, gps_verified, punch_type, accuracy, geofence_status, punch_in_latitude, punch_in_longitude, selfie_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          id,
          targetEmpId,
          targetSiteId || null,
          today,
          nowTime,
          'Present',
          gpsVerified,
          'IN',
          accuracy || null,
          geofenceStatus,
          latitude || null,
          longitude || null,
          selfieUrl || null,
        ]
      );
      result = rows[0];
    } else {
      // Subsequent punch: If already punched in and punchType is OUT, update punch_out
      const existing = existRes.rows[0];
      if (actionType === 'OUT' || (existing.punch_in && !existing.punch_out)) {
        const { rows } = await query(
          `UPDATE attendance SET 
            punch_out = $1, 
            site_id = COALESCE($2, site_id),
            gps_verified = (gps_verified AND $3),
            punch_type = 'OUT',
            geofence_status = $4
           WHERE employee_id = $5 AND date = $6
           RETURNING *`,
          [nowTime, targetSiteId || null, gpsVerified, geofenceStatus, targetEmpId, today]
        );
        result = rows[0];
      } else {
        // Re-punch in
        const { rows } = await query(
          `UPDATE attendance SET 
            punch_in = $1, 
            site_id = COALESCE($2, site_id),
            gps_verified = $3,
            punch_type = 'IN',
            geofence_status = $4,
            punch_in_latitude = $5,
            punch_in_longitude = $6
           WHERE employee_id = $7 AND date = $8
           RETURNING *`,
          [nowTime, targetSiteId || null, gpsVerified, geofenceStatus, latitude || null, longitude || null, targetEmpId, today]
        );
        result = rows[0];
      }
    }

    res.json({
      success: true,
      action: actionType,
      time: nowTime.slice(0, 5),
      gpsVerified,
      distanceMeters,
      geofenceRadius,
      siteName,
      record: result,
    });
  } catch (err) {
    console.error('Punch endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
