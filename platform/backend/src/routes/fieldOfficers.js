import express from 'express';
import { query } from '../db/index.js';
import { toDateStr } from '../utils/date.js';

const router = express.Router();

// GET all field officers / supervisors
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT e.id, 
             e.employee_code as "employeeCode", 
             e.name, 
             e.phone, 
             e.email, 
             e.blood_group as "bloodGroup", 
             e.gender, 
             e.status, 
             e.kyc_status as "kycStatus",
             e.joining_date as "joiningDate",
             COALESCE(d.name, 'Field Officer') as designation,
             COALESCE(dept.name, 'Security Services') as department,
             COUNT(DISTINCT cia.id) FILTER (WHERE cia.status != 'Cancelled') as "activeAssignmentsCount",
             COUNT(DISTINCT s.id) as "supervisedSitesCount"
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id
      LEFT JOIN departments dept ON e.department_id = dept.id
      LEFT JOIN client_inspection_assignments cia ON cia.officer_id = e.id AND cia.status != 'Cancelled'
      LEFT JOIN sites s ON s.supervisor_id = e.id
      WHERE d.name ILIKE '%Supervisor%' 
         OR d.name ILIKE '%Field%' 
         OR d.name ILIKE '%Officer%'
         OR dept.name ILIKE '%Security%'
         OR dept.name ILIKE '%Operation%'
         OR e.id IN (SELECT DISTINCT supervisor_id FROM sites WHERE supervisor_id IS NOT NULL)
         OR e.id IN (SELECT DISTINCT officer_id FROM client_inspection_assignments)
      GROUP BY e.id, e.employee_code, e.name, e.phone, e.email, e.blood_group, e.gender, e.status, e.kyc_status, e.joining_date, d.name, dept.name
      ORDER BY e.created_at DESC;
    `;

    const { rows } = await query(sql);
    res.json(rows.map(r => ({
      ...r,
      activeAssignmentsCount: parseInt(r.activeAssignmentsCount || 0, 10),
      supervisedSitesCount: parseInt(r.supervisedSitesCount || 0, 10),
      joiningDate: toDateStr(r.joiningDate),
    })));
  } catch (err) {
    console.error('Error fetching field officers:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST register a new field officer
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      employeeCode,
      bloodGroup,
      gender,
      address,
      emergencyContact,
      status = 'Active',
      designationId = 'DES002', // Security Supervisor or Field Officer
      departmentId = 'DEP002',  // Security Services
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required for Field Officer' });
    }

    const id = `EMP${Date.now().toString().slice(-6)}`;
    const code = (employeeCode && employeeCode.trim()) || `SS-FO-${Date.now().toString().slice(-4)}`;

    // Insert employee
    const insertSql = `
      INSERT INTO employees (
        id, employee_code, name, phone, email, blood_group, gender, 
        address, emergency_contact, designation_id, department_id, 
        status, kyc_status, onboarding_status, joining_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Verified', 'Completed', CURRENT_DATE)
      RETURNING *;
    `;

    const empRes = await query(insertSql, [
      id,
      code,
      name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      bloodGroup || 'O+',
      gender || 'Male',
      address || 'Bengaluru HQ',
      JSON.stringify(emergencyContact || {}),
      designationId,
      departmentId,
      status,
    ]);

    const newEmp = empRes.rows[0];

    // Create user login account if email provided or using employeeCode
    const userLoginName = (code || name.replace(/\s+/g, '').toLowerCase()).toLowerCase();
    const userEmail = email ? email.trim() : `${userLoginName}@silverstarindia.net`;
    const userId = `USR${Date.now().toString().slice(-6)}`;

    try {
      await query(`
        INSERT INTO user_accounts (id, name, email, password_hash, role, status)
        VALUES ($1, $2, $3, '1234', 'Operations Manager', 'Active')
        ON CONFLICT (email) DO NOTHING;
      `, [userId, name.trim(), userEmail]);
    } catch (authErr) {
      console.warn('Could not auto-create user_accounts entry for field officer:', authErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Field Officer ${name} created successfully`,
      officer: {
        id: newEmp.id,
        employeeCode: newEmp.employee_code,
        name: newEmp.name,
        phone: newEmp.phone,
        email: newEmp.email,
        bloodGroup: newEmp.blood_group,
        designation: 'Security Supervisor / Field Officer',
        status: newEmp.status,
        kycStatus: newEmp.kyc_status,
      },
    });
  } catch (err) {
    console.error('Error creating field officer:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all appointments (field officer assignments to clients & sites)
router.get('/appointments', async (req, res) => {
  try {
    const { officerId, clientId, siteId, status } = req.query;

    let sql = `
      SELECT cia.id, 
             cia.officer_id as "officerId", 
             cia.client_id as "clientId", 
             cia.site_id as "siteId",
             cia.assigned_date as "assignedDate", 
             cia.shift, 
             cia.status, 
             cia.notes,
             COALESCE(cia.visit_frequency, 'Daily') as "visitFrequency",
             cia.created_at as "createdAt", 
             cia.updated_at as "updatedAt",
             e.name as "officerName", 
             e.employee_code as "officerCode", 
             e.phone as "officerPhone",
             c.name as "clientName",
             s.name as "siteName", 
             s.address as "siteAddress", 
             s.sanctioned_strength as "sanctionedStrength"
      FROM client_inspection_assignments cia
      JOIN employees e ON cia.officer_id = e.id
      JOIN clients c ON cia.client_id = c.id
      LEFT JOIN sites s ON cia.site_id = s.id
      WHERE 1=1
    `;

    const params = [];
    if (officerId) {
      params.push(officerId);
      sql += ` AND cia.officer_id = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      sql += ` AND cia.client_id = $${params.length}`;
    }
    if (siteId) {
      params.push(siteId);
      sql += ` AND cia.site_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND cia.status = $${params.length}`;
    } else {
      sql += ` AND cia.status != 'Cancelled'`;
    }

    sql += ' ORDER BY cia.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      ...r,
      assignedDate: toDateStr(r.assignedDate),
    })));
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST appoint a field officer to a site and client
router.post('/appoint', async (req, res) => {
  try {
    const {
      officerId,
      clientId,
      siteId,
      visitFrequency = 'Daily',
      shift = 'Day Shift (06:00 - 14:00)',
      notes = 'Standard frontline roll-call audit and security compliance inspection',
      status = 'Active',
    } = req.body;

    if (!officerId || !clientId || !siteId) {
      return res.status(400).json({ error: 'officerId, clientId, and siteId are required' });
    }

    // Verify officer, client, site existence
    const [officerCheck, clientCheck, siteCheck] = await Promise.all([
      query('SELECT id, name, employee_code, phone FROM employees WHERE id = $1 OR employee_code = $1', [officerId]),
      query('SELECT id, name FROM clients WHERE id = $1', [clientId]),
      query('SELECT id, name FROM sites WHERE id = $1', [siteId]),
    ]);

    if (officerCheck.rows.length === 0) {
      return res.status(400).json({ error: `Field Officer ${officerId} does not exist` });
    }
    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ error: `Client ${clientId} does not exist` });
    }
    if (siteCheck.rows.length === 0) {
      return res.status(400).json({ error: `Site ${siteId} does not exist` });
    }

    const resolvedOfficerId = officerCheck.rows[0].id;
    const officerName = officerCheck.rows[0].name;
    const siteName = siteCheck.rows[0].name;
    const clientName = clientCheck.rows[0].name;

    // 1. Update site's supervisor_id
    await query('UPDATE sites SET supervisor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [resolvedOfficerId, siteId]);

    // 2. Insert or update appointment in client_inspection_assignments
    const appointmentId = `CIA_${siteId}_${resolvedOfficerId}`.slice(0, 50);

    const safeStatus = ['Active', 'Assigned', 'Pending'].includes(status) ? status : 'Active';

    const insertSql = `
      INSERT INTO client_inspection_assignments (
        id, officer_id, client_id, site_id, assigned_date, shift, visit_frequency, status, notes
      )
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8)
      ON CONFLICT (officer_id, site_id, assigned_date)
      DO UPDATE SET 
        client_id = EXCLUDED.client_id,
        shift = EXCLUDED.shift,
        visit_frequency = EXCLUDED.visit_frequency,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const { rows } = await query(insertSql, [
      appointmentId,
      resolvedOfficerId,
      clientId,
      siteId,
      shift,
      visitFrequency,
      safeStatus,
      notes,
    ]);

    res.status(201).json({
      success: true,
      message: `Successfully appointed ${officerName} to ${siteName} (${clientName})`,
      appointment: {
        id: rows[0].id,
        officerId: resolvedOfficerId,
        officerName,
        clientId,
        clientName,
        siteId,
        siteName,
        visitFrequency,
        shift,
        status: safeStatus,
        notes,
      },
    });
  } catch (err) {
    console.error('Error appointing field officer:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update an appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shift, visitFrequency, status, notes } = req.body;

    const existing = await query('SELECT * FROM client_inspection_assignments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { rows } = await query(`
      UPDATE client_inspection_assignments
      SET shift = COALESCE($1, shift),
          visit_frequency = COALESCE($2, visit_frequency),
          status = COALESCE($3, status),
          notes = COALESCE($4, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `, [shift, visitFrequency, status, notes, id]);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: rows[0],
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE relieve / unassign an appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM client_inspection_assignments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appt = existing.rows[0];

    // Mark as cancelled or remove
    await query(`
      UPDATE client_inspection_assignments 
      SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id]);

    // If site supervisor is this officer, clear supervisor_id
    if (appt.site_id && appt.officer_id) {
      await query(`
        UPDATE sites 
        SET supervisor_id = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1 AND supervisor_id = $2
      `, [appt.site_id, appt.officer_id]);
    }

    res.json({
      success: true,
      message: 'Field Officer relieved from site appointment successfully',
    });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
