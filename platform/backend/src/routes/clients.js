import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Helper to format client
function formatClient(row) {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    address: row.address,
    contractStart: row.contract_start ? row.contract_start.toISOString().split('T')[0] : '',
    contractEnd: row.contract_end ? row.contract_end.toISOString().split('T')[0] : '',
    status: row.status,
    sites: row.sites || [],
    portalUsername: row.portal_username,
    monthlyBilling: parseFloat(row.monthly_billing || 0),
    servicesProvided: row.services_provided || [],
  };
}

// GET all clients
router.get('/clients', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT c.*, 
             COALESCE(
               ARRAY_AGG(s.id) FILTER (WHERE s.id IS NOT NULL),
               '{}'
             ) as sites
      FROM clients c
      LEFT JOIN sites s ON c.id = s.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows.map(formatClient));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new client
router.post('/clients', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `CLI${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO clients (
        id, name, contact_person, email, phone, address, contract_start, contract_end,
        status, portal_username, monthly_billing, services_provided
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        id,
        b.name,
        b.contactPerson,
        b.email,
        b.phone,
        b.address || '',
        b.contractStart || new Date().toISOString().split('T')[0],
        b.contractEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        b.status || 'Active',
        b.portalUsername || `${b.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_client`,
        b.monthlyBilling || 0,
        JSON.stringify(b.servicesProvided || []),
      ]
    );
    res.status(201).json(formatClient(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all sites
router.get('/sites', async (req, res) => {
  try {
    const { clientId } = req.query;
    let sql = `
      SELECT s.*, c.name as client_name, e.name as supervisor_name
      FROM sites s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN employees e ON s.supervisor_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (clientId) {
      params.push(clientId);
      sql += ` AND s.client_id = $${params.length}`;
    }
    sql += ' ORDER BY s.name ASC';
    const { rows } = await query(sql, params);
    
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      clientId: r.client_id,
      clientName: r.client_name,
      address: r.address,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      geofenceRadius: r.geofence_radius,
      sanctionedStrength: r.sanctioned_strength,
      status: r.status,
      supervisorId: r.supervisor_id,
      supervisorName: r.supervisor_name,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new site
router.post('/sites', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `SITE${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO sites (
        id, name, client_id, address, latitude, longitude, geofence_radius, sanctioned_strength, status, supervisor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id,
        b.name,
        b.clientId,
        b.address || '',
        b.latitude || 12.9716,
        b.longitude || 77.5946,
        b.geofenceRadius || 100,
        b.sanctionedStrength || 5,
        b.status || 'Active',
        b.supervisorId || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update site geofence
router.put('/sites/:id/geofence', async (req, res) => {
  try {
    const { latitude, longitude, geofenceRadius } = req.body;
    const { rows } = await query(
      `UPDATE sites SET
        latitude = COALESCE($1, latitude),
        longitude = COALESCE($2, longitude),
        geofence_radius = COALESCE($3, geofence_radius),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`,
      [latitude, longitude, geofenceRadius, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
