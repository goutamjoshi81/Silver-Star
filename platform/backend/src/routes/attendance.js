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
    const { date, startDate, endDate, employeeId, siteId } = req.query;
    let sql = `
      SELECT a.*, 
             e.name as employee_name, e.employee_code,
             s.name as site_name, s.latitude as site_lat, s.longitude as site_lng, s.geofence_radius
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN sites s ON a.site_id = s.id
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
      sql += ` AND a.employee_id = $${params.length}`;
    }

    if (siteId) {
      params.push(siteId);
      sql += ` AND a.site_id = $${params.length}`;
    }

    sql += ' ORDER BY a.date DESC, a.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      siteId: r.site_id,
      siteName: r.site_name,
      date: r.date ? r.date.toISOString().split('T')[0] : '',
      punchIn: r.punch_in ? r.punch_in.slice(0, 5) : null,
      punchOut: r.punch_out ? r.punch_out.slice(0, 5) : null,
      status: r.status,
      gpsVerified: r.gps_verified,
      punchInLatitude: r.punch_in_latitude,
      punchInLongitude: r.punch_in_longitude,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Punch In / Punch Out with GPS Geofencing verification
router.post('/punch', async (req, res) => {
  try {
    const { employeeId, siteId, latitude, longitude, punchType } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"

    // Check site geofence if coordinates are provided
    let gpsVerified = false;
    if (siteId && latitude && longitude) {
      const siteRes = await query('SELECT latitude, longitude, geofence_radius FROM sites WHERE id = $1', [siteId]);
      if (siteRes.rows.length > 0) {
        const site = siteRes.rows[0];
        const dist = calculateDistanceMeters(latitude, longitude, site.latitude, site.longitude);
        gpsVerified = dist <= site.geofence_radius;
      }
    } else {
      gpsVerified = true;
    }

    // Check if attendance record exists for today
    const existRes = await query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, today]
    );

    let result;
    if (existRes.rows.length === 0) {
      // Create new Punch In record
      const id = `ATT${Date.now().toString().slice(-6)}`;
      const { rows } = await query(
        `INSERT INTO attendance (id, employee_id, site_id, date, punch_in, status, gps_verified, punch_in_latitude, punch_in_longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [id, employeeId, siteId || null, today, nowTime, 'Present', gpsVerified, latitude || null, longitude || null]
      );
      result = rows[0];
    } else {
      // Update Punch Out
      const { rows } = await query(
        `UPDATE attendance SET 
          punch_out = $1, 
          site_id = COALESCE($2, site_id),
          gps_verified = (gps_verified AND $3)
         WHERE employee_id = $4 AND date = $5
         RETURNING *`,
        [nowTime, siteId || null, gpsVerified, employeeId, today]
      );
      result = rows[0];
    }

    res.json({
      success: true,
      gpsVerified,
      record: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

