import express from 'express';
import { query } from '../db/index.js';
import { toDateStr } from '../utils/date.js';

const router = express.Router();

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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

// GET all patrol logs with optional filters
router.get('/', async (req, res) => {
  try {
    const { siteId, officerId, date, status } = req.query;
    let sql = `
      SELECT p.*, s.name as site_name, s.geofence_radius, c.name as client_name, e.name as officer_name, e.employee_code as officer_code
      FROM patrol_logs p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN clients c ON s.client_id = c.id
      JOIN employees e ON p.officer_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (siteId) {
      params.push(siteId);
      sql += ` AND p.site_id = $${params.length}`;
    }
    if (officerId) {
      params.push(officerId);
      sql += ` AND p.officer_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      sql += ` AND DATE(p.created_at) = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND p.status ILIKE $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC LIMIT 150';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      officerId: r.officer_id,
      officerName: r.officer_name,
      officerCode: r.officer_code,
      siteId: r.site_id,
      siteName: r.site_name,
      clientName: r.client_name,
      checkpointName: r.checkpoint_name,
      patrolShift: r.patrol_shift,
      status: r.status,
      latitude: r.latitude,
      longitude: r.longitude,
      isGeofenceVerified: r.is_geofence_verified,
      distanceMeters: r.distance_meters,
      photoUrl: r.photo_url,
      notes: r.notes,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new patrol inspection entry with photo & GPS
router.post('/', async (req, res) => {
  try {
    const {
      officerId,
      siteId,
      checkpointName,
      patrolShift,
      status,
      latitude,
      longitude,
      photoUrl,
      notes,
    } = req.body;

    if (!officerId || !checkpointName || !photoUrl) {
      return res.status(400).json({ error: 'officerId, checkpointName, and photoUrl are required for patrol log' });
    }

    // Check geofence
    let isGeofenceVerified = false;
    let distanceMeters = null;
    let siteName = 'Client Patrol Area';

    if (siteId && latitude && longitude) {
      const siteRes = await query('SELECT id, name, latitude, longitude, geofence_radius FROM sites WHERE id = $1', [siteId]);
      if (siteRes.rows.length > 0) {
        const s = siteRes.rows[0];
        siteName = s.name;
        const radius = s.geofence_radius || 150;
        distanceMeters = Math.round(calculateDistanceMeters(Number(latitude), Number(longitude), Number(s.latitude), Number(s.longitude)));
        isGeofenceVerified = distanceMeters <= radius;
      }
    } else {
      isGeofenceVerified = true;
    }

    const id = `PATROL_${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO patrol_logs (
        id, officer_id, site_id, checkpoint_name, patrol_shift, status, latitude, longitude,
        is_geofence_verified, distance_meters, photo_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        id,
        officerId,
        siteId || null,
        checkpointName,
        patrolShift || 'Night Patrol',
        status || 'All Normal & Secure',
        latitude || null,
        longitude || null,
        isGeofenceVerified,
        distanceMeters,
        photoUrl,
        notes || '',
      ]
    );

    res.status(201).json({
      success: true,
      id,
      siteName,
      isGeofenceVerified,
      distanceMeters,
      patrolLog: rows[0],
    });

    // If there is an active patrol assignment for this officer and checkpoint/site, mark as Completed
    try {
      await query(`
        UPDATE patrol_assignments
        SET status = 'Completed', updated_at = CURRENT_TIMESTAMP
        WHERE officer_id = $1 AND (checkpoint_name ILIKE $2 OR location_name ILIKE $3) AND status != 'Completed'
      `, [officerId, `%${checkpointName}%`, `%${siteName}%`]);
    } catch (ignoreErr) {}
  } catch (err) {
    console.error('Patrol log submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /assignments: Get all night patrol assignments (with optional officerId, status, date filter)
router.get('/assignments', async (req, res) => {
  try {
    const { officerId, date, status } = req.query;
    let sql = `
      SELECT pa.*, e.name as officer_name, e.employee_code as officer_code, e.phone as officer_phone,
             c.name as client_name, s.name as site_name
      FROM patrol_assignments pa
      JOIN employees e ON pa.officer_id = e.id
      LEFT JOIN clients c ON pa.client_id = c.id
      LEFT JOIN sites s ON pa.site_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (officerId) {
      params.push(officerId);
      sql += ` AND (pa.officer_id = $${params.length} OR e.employee_code = $${params.length})`;
    }
    if (status) {
      params.push(status);
      sql += ` AND pa.status = $${params.length}`;
    }
    if (date) {
      params.push(date);
      sql += ` AND pa.assigned_date = $${params.length}`;
    }

    sql += ' ORDER BY pa.created_at DESC LIMIT 150';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      officerId: r.officer_id,
      officerName: r.officer_name,
      officerCode: r.officer_code,
      officerPhone: r.officer_phone,
      clientId: r.client_id,
      clientName: r.client_name,
      siteId: r.site_id,
      siteName: r.site_name,
      locationType: r.location_type,
      locationName: r.location_name,
      address: r.address,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      geofenceRadius: Number(r.geofence_radius || 150),
      checkpointName: r.checkpoint_name,
      shift: r.shift,
      assignedDate: toDateStr(r.assigned_date),
      instructions: r.instructions,
      status: r.status,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /assignments: Ops assigns a new night patrol to a field officer
router.post('/assignments', async (req, res) => {
  try {
    const {
      officerId,
      clientId,
      siteId,
      locationType, // 'client' | 'custom'
      locationName,
      address,
      latitude,
      longitude,
      geofenceRadius,
      checkpointName,
      shift,
      instructions,
    } = req.body;

    if (!officerId || !locationName || !checkpointName) {
      return res.status(400).json({ error: 'officerId, locationName, and checkpointName are required' });
    }

    // Resolve officer
    const officerRes = await query('SELECT id, name, employee_code FROM employees WHERE id = $1 OR employee_code = $1', [officerId]);
    const validOfficerId = officerRes.rows.length > 0 ? officerRes.rows[0].id : officerId;
    const officerName = officerRes.rows[0]?.name || 'Field Officer';

    let finalLat = Number(latitude);
    let finalLng = Number(longitude);
    let finalAddress = address;

    if (siteId && (!finalLat || !finalLng || isNaN(finalLat))) {
      const siteRes = await query('SELECT latitude, longitude, address, name FROM sites WHERE id = $1', [siteId]);
      if (siteRes.rows.length > 0) {
        finalLat = Number(siteRes.rows[0].latitude);
        finalLng = Number(siteRes.rows[0].longitude);
        finalAddress = finalAddress || siteRes.rows[0].address;
      }
    }

    if (isNaN(finalLat)) finalLat = 12.8456;
    if (isNaN(finalLng)) finalLng = 77.6603;

    const id = `PASG_${Date.now().toString().slice(-8)}`;
    const { rows } = await query(`
      INSERT INTO patrol_assignments (
        id, officer_id, client_id, site_id, location_type, location_name, address,
        latitude, longitude, geofence_radius, checkpoint_name, shift, instructions, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending')
      RETURNING *
    `, [
      id, validOfficerId, clientId || null, siteId || null, locationType || 'client',
      locationName, finalAddress || locationName, finalLat, finalLng,
      Number(geofenceRadius) || 150, checkpointName, shift || 'Night Shift (22:00 - 06:00)', instructions || ''
    ]);

    res.status(201).json({
      success: true,
      message: `Night patrol successfully assigned to ${officerName} at ${locationName}.`,
      assignment: {
        ...rows[0],
        officerName,
      },
    });
  } catch (err) {
    console.error('Error creating patrol assignment:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /assignments/:id/status: Update assignment status
router.put('/assignments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await query(`
      UPDATE patrol_assignments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ success: true, assignment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recommended standard checkpoints for security night patrols
router.get('/checkpoints', (req, res) => {
  res.json([
    { id: 'CP_MAIN_GATE', name: 'Main Security Gate & Barrier Check', category: 'Access Control' },
    { id: 'CP_PERIMETER_NORTH', name: 'North Boundary Wall & Fence Wire', category: 'Perimeter' },
    { id: 'CP_PERIMETER_SOUTH', name: 'South Boundary Wall & Drain Outlet', category: 'Perimeter' },
    { id: 'CP_TRANSFORMER', name: 'Electrical Substation & DG Set Yard', category: 'Critical Utilities' },
    { id: 'CP_LOADING_DOCK', name: 'Warehouse Bay & Loading Dock Doors', category: 'Logistics' },
    { id: 'CP_FIRE_PANEL', name: 'Central Fire Alarm Control Panel (FACP)', category: 'Safety' },
    { id: 'CP_BASEMENT_PARKING', name: 'Basement Level B1/B2 Vehicle Parking', category: 'Internal' },
    { id: 'CP_SERVER_ROOM', name: 'Data Center / Server Room External Lock', category: 'High Security' },
    { id: 'CP_ROOFTOP_ACCESS', name: 'Rooftop & Water Tank Access Door', category: 'Overhead' },
  ]);
});

export default router;

