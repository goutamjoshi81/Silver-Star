import express from 'express';
import { query } from '../db/index.js';
import { toDateStr } from '../utils/date.js';

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
    contractStart: toDateStr(row.contract_start),
    contractEnd: toDateStr(row.contract_end),
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

// POST bulk import clients
router.post('/clients/bulk', async (req, res) => {
  try {
    const rawClients = Array.isArray(req.body) ? req.body : (req.body.clients || []);
    if (!rawClients || rawClients.length === 0) {
      return res.status(400).json({ error: 'No client records provided for bulk upload.' });
    }

    const inserted = [];
    const errors = [];

    for (let i = 0; i < rawClients.length; i++) {
      const b = rawClients[i];
      const name = b.name || b.companyName || b.clientName;
      if (!name || String(name).trim().length === 0) {
        errors.push({ row: i + 1, error: 'Client / Company Name is required.' });
        continue;
      }

      try {
        const id = b.id || `CLI${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
        const contactPerson = b.contactPerson || b.contact_person || 'Facility Representative';
        const email = b.email || `${String(name).toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}@client.silverstarindia.net`;
        const phone = b.phone || '+91 98765 00000';
        const address = b.address || '';
        const contractStart = b.contractStart || b.contract_start || new Date().toISOString().split('T')[0];
        const contractEnd = b.contractEnd || b.contract_end || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
        const status = ['Active', 'Pending', 'Expired', 'Terminated'].includes(b.status) ? b.status : 'Active';
        const portalUsername = b.portalUsername || `${String(name).toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
        const monthlyBilling = parseFloat(String(b.monthlyBilling || b.monthly_billing || 0).replace(/[^0-9.]/g, '')) || 0;
        
        let servicesProvided = b.servicesProvided || b.services_provided || ['Security Services'];
        if (typeof servicesProvided === 'string') {
          servicesProvided = servicesProvided.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
        }

        const { rows } = await query(
          `INSERT INTO clients (
            id, name, contact_person, email, phone, address, contract_start, contract_end,
            status, portal_username, monthly_billing, services_provided
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            contact_person = EXCLUDED.contact_person,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            contract_start = EXCLUDED.contract_start,
            contract_end = EXCLUDED.contract_end,
            status = EXCLUDED.status,
            monthly_billing = EXCLUDED.monthly_billing,
            services_provided = EXCLUDED.services_provided,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *`,
          [
            id,
            name,
            contactPerson,
            email,
            phone,
            address,
            contractStart,
            contractEnd,
            status,
            portalUsername,
            monthlyBilling,
            JSON.stringify(servicesProvided),
          ]
        );
        inserted.push(formatClient(rows[0]));
      } catch (rowErr) {
        errors.push({ row: i + 1, name, error: rowErr.message });
      }
    }

    res.status(200).json({
      success: true,
      count: inserted.length,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all sites
router.get('/sites', async (req, res) => {
  try {
    const { clientId, siteType, isEmergency } = req.query;
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
    if (siteType) {
      params.push(siteType);
      sql += ` AND s.site_type ILIKE $${params.length}`;
    }
    if (isEmergency !== undefined) {
      params.push(isEmergency === 'true' || isEmergency === true);
      sql += ` AND s.is_emergency = $${params.length}`;
    }
    sql += ' ORDER BY s.is_emergency DESC, s.name ASC';
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
      siteType: r.site_type || 'Permanent',
      isEmergency: !!r.is_emergency,
      emergencyNotes: r.emergency_notes || '',
      validFrom: toDateStr(r.valid_from) || null,
      validUntil: toDateStr(r.valid_until) || null,
      supervisorId: r.supervisor_id,
      supervisorName: r.supervisor_name,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET deployed staff (Guards & Housekeepers) for a specific site for roll-call
router.get('/sites/:id/deployed-staff', async (req, res) => {
  try {
    const siteId = req.params.id;
    const { rows } = await query(
      `SELECT e.id, e.employee_code, e.name, e.photo, e.phone, e.blood_group,
              des.name as designation, d.name as department, dep.shift_id,
              s.name as shift_name, dep.status as deployment_status
       FROM deployments dep
       JOIN employees e ON dep.employee_id = e.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN shifts s ON dep.shift_id = s.id
       WHERE dep.site_id = $1 AND dep.status = 'Active' AND e.status = 'Active'
       ORDER BY des.name ASC, e.name ASC`,
      [siteId]
    );

    // If no active deployments in deployments table, fallback to employees with deployed_site_id
    if (rows.length === 0) {
      const fallback = await query(
        `SELECT e.id, e.employee_code, e.name, e.photo, e.phone, e.blood_group,
                des.name as designation, d.name as department, 'Active' as deployment_status
         FROM employees e
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE e.deployed_site_id = $1 AND e.status = 'Active'
         ORDER BY des.name ASC, e.name ASC`,
        [siteId]
      );
      return res.json(fallback.rows.map(r => ({
        id: r.id,
        employeeCode: r.employee_code,
        name: r.name,
        photo: r.photo || '',
        phone: r.phone,
        bloodGroup: r.blood_group || 'O+',
        designation: r.designation || 'Staff',
        department: r.department || 'Operations',
      })));
    }

    res.json(rows.map(r => ({
      id: r.id,
      employeeCode: r.employee_code,
      name: r.name,
      photo: r.photo || '',
      phone: r.phone,
      bloodGroup: r.blood_group || 'O+',
      designation: r.designation || 'Staff',
      department: r.department || 'Operations',
      shiftId: r.shift_id,
      shiftName: r.shift_name,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new site (Supports Permanent, Temporary, and Emergency Geofences)
router.post('/sites', async (req, res) => {
  try {
    const b = req.body;
    const isEmerg = b.isEmergency === true || b.siteType === 'Emergency';
    const prefix = isEmerg ? 'SITE_EMERG_' : (b.siteType === 'Temporary' ? 'SITE_TEMP_' : 'SITE');
    const id = b.id || `${prefix}${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO sites (
        id, name, client_id, address, latitude, longitude, geofence_radius, sanctioned_strength, status, supervisor_id,
        site_type, is_emergency, emergency_notes, valid_from, valid_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        id,
        b.name,
        b.clientId,
        b.address || '',
        parseFloat(b.latitude) || 12.9716,
        parseFloat(b.longitude) || 77.5946,
        parseInt(b.geofenceRadius, 10) || 100,
        parseInt(b.sanctionedStrength, 10) || 5,
        b.status || 'Active',
        b.supervisorId || null,
        b.siteType || (isEmerg ? 'Emergency' : 'Permanent'),
        isEmerg,
        b.emergencyNotes || '',
        b.validFrom || new Date().toISOString().split('T')[0],
        b.validUntil || null,
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
    const { latitude, longitude, geofenceRadius, siteType, isEmergency, emergencyNotes, validUntil } = req.body;
    const { rows } = await query(
      `UPDATE sites SET
        latitude = COALESCE($1, latitude),
        longitude = COALESCE($2, longitude),
        geofence_radius = COALESCE($3, geofence_radius),
        site_type = COALESCE($4, site_type),
        is_emergency = COALESCE($5, is_emergency),
        emergency_notes = COALESCE($6, emergency_notes),
        valid_until = COALESCE($7, valid_until),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [latitude, longitude, geofenceRadius, siteType, isEmergency, emergencyNotes, validUntil, req.params.id]
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

