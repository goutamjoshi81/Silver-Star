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

// POST Field Officer Site Roll-Call / Muster Audit
router.post('/field-muster', async (req, res) => {
  try {
    const {
      officerId,
      siteId,
      shift,
      latitude,
      longitude,
      musterPhotoUrl,
      staffStatuses,
      notes
    } = req.body;

    if (!officerId || !siteId) {
      return res.status(400).json({ error: 'officerId and siteId are required for muster audit' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    // 1. Verify Geofence distance
    let isGeofenceVerified = false;
    let distanceMeters = null;
    let siteName = 'Client Site';
    let geofenceRadius = 150;

    if (siteId && latitude && longitude) {
      const siteRes = await query('SELECT id, name, latitude, longitude, geofence_radius FROM sites WHERE id = $1', [siteId]);
      if (siteRes.rows.length > 0) {
        const site = siteRes.rows[0];
        siteName = site.name;
        geofenceRadius = site.geofence_radius || 150;
        distanceMeters = Math.round(calculateDistanceMeters(Number(latitude), Number(longitude), Number(site.latitude), Number(site.longitude)));
        isGeofenceVerified = distanceMeters <= geofenceRadius;
      }
    } else {
      isGeofenceVerified = true;
    }

    // 2. Compute headcounts
    const staffList = Array.isArray(staffStatuses) ? staffStatuses : [];
    const totalSanctioned = staffList.length;
    const totalPresent = staffList.filter(s => s.status === 'Present' || s.status === 'Late' || s.status === 'Reliever').length;
    const totalAbsent = staffList.filter(s => s.status === 'Absent').length;

    // 3. Create site_muster_audits record
    const auditId = `MUSTER_${Date.now().toString().slice(-6)}`;
    const { rows: auditRows } = await query(
      `INSERT INTO site_muster_audits (
        id, officer_id, site_id, date, shift, total_sanctioned, total_present, total_absent,
        muster_photo_url, latitude, longitude, is_geofence_verified, distance_meters, notes, staff_records
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        auditId,
        officerId,
        siteId,
        today,
        shift || 'Day Shift',
        totalSanctioned,
        totalPresent,
        totalAbsent,
        musterPhotoUrl || '/silverstar-icon-512.png',
        latitude || null,
        longitude || null,
        isGeofenceVerified,
        distanceMeters,
        notes || '',
        JSON.stringify(staffList),
      ]
    );

    // 4. Upsert individual attendance records for deployed guards / staff
    for (const member of staffList) {
      if (!member.employeeId) continue;
      const memberStatus = member.status || 'Present';
      const attId = `ATT${Date.now().toString().slice(-6)}_${member.employeeId.slice(-4)}`;
      await query(
        `INSERT INTO attendance (
          id, employee_id, site_id, date, punch_in, status, gps_verified, punch_type,
          geofence_status, punch_in_latitude, punch_in_longitude, selfie_url,
          marked_by_officer_id, audit_id, muster_photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'IN', $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (employee_id, date) DO UPDATE SET
          site_id = EXCLUDED.site_id,
          status = EXCLUDED.status,
          gps_verified = EXCLUDED.gps_verified,
          marked_by_officer_id = EXCLUDED.marked_by_officer_id,
          audit_id = EXCLUDED.audit_id,
          muster_photo_url = EXCLUDED.muster_photo_url`,
        [
          attId,
          member.employeeId,
          siteId,
          today,
          memberStatus === 'Absent' ? null : nowTime,
          memberStatus,
          isGeofenceVerified,
          isGeofenceVerified ? 'INSIDE' : 'OUTSIDE',
          latitude || null,
          longitude || null,
          musterPhotoUrl || null,
          officerId,
          auditId,
          musterPhotoUrl || null,
        ]
      );
    }

    res.status(201).json({
      success: true,
      auditId,
      siteName,
      date: today,
      time: nowTime.slice(0, 5),
      totalSanctioned,
      totalPresent,
      totalAbsent,
      isGeofenceVerified,
      distanceMeters,
      audit: auditRows[0],
    });
  } catch (err) {
    console.error('Field muster audit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all Field Officer Site Muster Audits
router.get('/field-muster', async (req, res) => {
  try {
    const { siteId, date, officerId } = req.query;
    let sql = `
      SELECT sma.*, s.name as site_name, c.name as client_name, e.name as officer_name, e.employee_code as officer_code
      FROM site_muster_audits sma
      JOIN sites s ON sma.site_id = s.id
      LEFT JOIN clients c ON s.client_id = c.id
      JOIN employees e ON sma.officer_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (siteId) {
      params.push(siteId);
      sql += ` AND sma.site_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      sql += ` AND sma.date = $${params.length}`;
    }
    if (officerId) {
      params.push(officerId);
      sql += ` AND sma.officer_id = $${params.length}`;
    }
    sql += ' ORDER BY sma.created_at DESC LIMIT 100';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      officerId: r.officer_id,
      officerName: r.officer_name,
      officerCode: r.officer_code,
      siteId: r.site_id,
      siteName: r.site_name,
      clientName: r.client_name,
      date: r.date ? r.date.toISOString().split('T')[0] : '',
      shift: r.shift,
      totalSanctioned: r.total_sanctioned,
      totalPresent: r.total_present,
      totalAbsent: r.total_absent,
      musterPhotoUrl: r.muster_photo_url,
      latitude: r.latitude,
      longitude: r.longitude,
      isGeofenceVerified: r.is_geofence_verified,
      distanceMeters: r.distance_meters,
      notes: r.notes,
      staffRecords: r.staff_records,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /officer-duties/:officerId: Returns ONLY the assigned client sites & night patrols for this specific officer
router.get('/officer-duties/:officerId', async (req, res) => {
  try {
    const { officerId } = req.params;

    // Resolve target employee
    let targetId = officerId;
    let officerName = 'Field Officer';
    let officerCode = 'SS-10001';

    const empRes = await query(
      'SELECT id, name, employee_code FROM employees WHERE id = $1 OR employee_code = $1',
      [officerId]
    );

    if (empRes.rows.length > 0) {
      targetId = empRes.rows[0].id;
      officerName = empRes.rows[0].name;
      officerCode = empRes.rows[0].employee_code;
    }

    // 1. Fetch Assigned Client Sites
    const sitesSql = `
      SELECT DISTINCT s.*, c.name as client_name, c.contact_person, c.phone as client_phone
      FROM sites s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN client_inspection_assignments cia ON s.id = cia.site_id AND cia.officer_id = $1
      WHERE s.supervisor_id = $1 OR cia.officer_id = $1
      ORDER BY s.name ASC
    `;
    const sitesRes = await query(sitesSql, [targetId]);

    const assignedClients = [];
    for (const s of sitesRes.rows) {
      // Get deployed staff (guards/housekeepers) for this site
      const staffRes = await query(`
        SELECT e.id as "employeeId", e.employee_code as "employeeCode", e.name, e.photo, e.phone,
               COALESCE(des.name, 'Security Staff') as designation, 
               COALESCE(d.name, 'Security') as department, 'Present' as status
        FROM deployments dep
        JOIN employees e ON dep.employee_id = e.id
        LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE dep.site_id = $1 AND dep.status = 'Active' AND e.status = 'Active'
        ORDER BY des.name ASC, e.name ASC
      `, [s.id]);

      let staffList = staffRes.rows;
      if (staffList.length === 0) {
        const fallbackStaff = await query(`
          SELECT e.id as "employeeId", e.employee_code as "employeeCode", e.name, e.photo, e.phone,
                 COALESCE(des.name, 'Security Staff') as designation, 
                 COALESCE(d.name, 'Operations') as department, 'Present' as status
          FROM employees e
          LEFT JOIN designations des ON e.designation_id = des.id
          LEFT JOIN departments d ON e.department_id = d.id
          WHERE e.deployed_site_id = $1 AND e.status = 'Active'
          ORDER BY des.name ASC, e.name ASC
        `, [s.id]);
        staffList = fallbackStaff.rows;
      }

      // Check if audit done today
      const todayAudit = await query(
        'SELECT * FROM site_muster_audits WHERE site_id = $1 AND date = CURRENT_DATE ORDER BY created_at DESC LIMIT 1',
        [s.id]
      );

      assignedClients.push({
        id: s.id,
        siteId: s.id,
        name: s.name,
        siteName: s.name,
        clientId: s.client_id,
        clientName: s.client_name,
        address: s.address,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        geofenceRadius: Number(s.geofence_radius || 150),
        isEmergency: Boolean(s.is_emergency),
        siteType: s.site_type || 'Permanent',
        sanctionedStrength: Number(s.sanctioned_strength || staffList.length),
        deployedStaff: staffList,
        todayAuditCompleted: todayAudit.rows.length > 0,
        todayAudit: todayAudit.rows[0] || null,
      });
    }

    // 2. Fetch Assigned Night Patrols
    const patrolsSql = `
      SELECT pa.*, c.name as client_name, s.name as site_name
      FROM patrol_assignments pa
      LEFT JOIN clients c ON pa.client_id = c.id
      LEFT JOIN sites s ON pa.site_id = s.id
      WHERE (pa.officer_id = $1 OR pa.officer_id = $2) AND pa.status != 'Cancelled'
      ORDER BY pa.created_at DESC
    `;
    const patrolsRes = await query(patrolsSql, [targetId, officerCode]);

    const assignedPatrols = [];
    for (const r of patrolsRes.rows) {
      // Check if patrol was submitted for this assignment today
      const checkLog = await query(
        `SELECT * FROM patrol_logs 
         WHERE (officer_id = $1 OR officer_id = $2) 
           AND (checkpoint_name ILIKE $3 OR site_id = $4)
           AND DATE(created_at) = CURRENT_DATE 
         LIMIT 1`,
        [targetId, officerCode, `%${r.checkpoint_name}%`, r.site_id]
      );

      assignedPatrols.push({
        id: r.id,
        assignmentId: r.id,
        locationType: r.location_type,
        locationName: r.location_name,
        siteId: r.site_id,
        siteName: r.site_name,
        clientId: r.client_id,
        clientName: r.client_name,
        address: r.address,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        geofenceRadius: Number(r.geofence_radius || 150),
        checkpointName: r.checkpoint_name,
        shift: r.shift,
        instructions: r.instructions,
        status: checkLog.rows.length > 0 ? 'Completed' : r.status,
        assignedDate: r.assigned_date ? r.assigned_date.toISOString().split('T')[0] : '',
        completedLog: checkLog.rows[0] || null,
      });
    }

    res.json({
      officerId: targetId,
      officerName,
      officerCode,
      assignedClients,
      assignedPatrols,
      totalDutiesCount: assignedClients.length + assignedPatrols.length,
    });
  } catch (err) {
    console.error('Error fetching officer duties:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
