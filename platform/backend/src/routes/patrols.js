import express from 'express';
import { query } from '../db/index.js';

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
  } catch (err) {
    console.error('Patrol log submission error:', err);
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
