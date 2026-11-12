import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all deployments
router.get('/', async (req, res) => {
  try {
    const { siteId, clientId, status } = req.query;
    let sql = `
      SELECT dep.*, 
             e.name as employee_name, e.employee_code, e.phone as employee_phone,
             s.name as site_name,
             c.name as client_name,
             sh.name as shift_name
      FROM deployments dep
      JOIN employees e ON dep.employee_id = e.id
      JOIN sites s ON dep.site_id = s.id
      JOIN clients c ON dep.client_id = c.id
      LEFT JOIN shifts sh ON dep.shift_id = sh.id
      WHERE 1=1
    `;
    const params = [];
    if (siteId) {
      params.push(siteId);
      sql += ` AND dep.site_id = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      sql += ` AND dep.client_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND dep.status = $${params.length}`;
    }
    sql += ' ORDER BY dep.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      siteId: r.site_id,
      siteName: r.site_name,
      clientId: r.client_id,
      clientName: r.client_name,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      employeePhone: r.employee_phone,
      shiftId: r.shift_id,
      shiftName: r.shift_name,
      startDate: r.start_date ? r.start_date.toISOString().split('T')[0] : '',
      endDate: r.end_date ? r.end_date.toISOString().split('T')[0] : null,
      status: r.status,
      deployedBy: r.deployed_by,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new deployment
router.post('/', async (req, res) => {
  try {
    const { siteId, clientId, employeeId, shiftId, startDate, deployedBy } = req.body;
    if (!siteId || !clientId || !employeeId) {
      return res.status(400).json({ error: 'siteId, clientId, and employeeId are required' });
    }

    // Verify site, client, employee existence in DB
    const [siteCheck, clientCheck, empCheck] = await Promise.all([
      query('SELECT id FROM sites WHERE id = $1', [siteId]),
      query('SELECT id FROM clients WHERE id = $1', [clientId]),
      query('SELECT id FROM employees WHERE id = $1', [employeeId]),
    ]);

    if (siteCheck.rows.length === 0) {
      return res.status(400).json({ error: `Site ${siteId} does not exist in database` });
    }
    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ error: `Client ${clientId} does not exist in database` });
    }
    if (empCheck.rows.length === 0) {
      return res.status(400).json({ error: `Employee ${employeeId} does not exist in database` });
    }

    const id = `DEP${Date.now().toString().slice(-6)}`;

    // Insert deployment record
    const { rows } = await query(
      `INSERT INTO deployments (id, site_id, client_id, employee_id, shift_id, start_date, status, deployed_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', $7)
       RETURNING *`,
      [id, siteId, clientId, employeeId, shiftId || null, startDate || new Date().toISOString().split('T')[0], deployedBy || 'Admin']
    );

    // Update employee deployed site and client
    await query(
      `UPDATE employees SET deployed_site_id = $1, deployed_client_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [siteId, clientId, employeeId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE / Relieve deployment
router.delete('/:id', async (req, res) => {
  try {
    const depRes = await query('SELECT * FROM deployments WHERE id = $1', [req.params.id]);
    if (depRes.rows.length === 0) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    const dep = depRes.rows[0];

    // Mark deployment relieved
    await query('UPDATE deployments SET status = $1, end_date = CURRENT_DATE WHERE id = $2', ['Relieved', req.params.id]);

    // Clear employee deployment if still assigned to this site
    await query(
      `UPDATE employees SET deployed_site_id = NULL, deployed_client_id = NULL WHERE id = $1 AND deployed_site_id = $2`,
      [dep.employee_id, dep.site_id]
    );

    res.json({ success: true, message: 'Employee relieved from site' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bulk-excel: Upload staff details in Excel & assign to client and field officer
router.post('/bulk-excel', async (req, res) => {
  try {
    const { clientId, siteId, officerId, staff } = req.body;
    if (!clientId || !siteId || !Array.isArray(staff)) {
      return res.status(400).json({ error: 'clientId, siteId, and staff array are required' });
    }

    // Verify site and client
    const [siteCheck, clientCheck] = await Promise.all([
      query('SELECT id, name FROM sites WHERE id = $1', [siteId]),
      query('SELECT id, name FROM clients WHERE id = $1', [clientId]),
    ]);

    if (siteCheck.rows.length === 0) {
      return res.status(400).json({ error: `Site ${siteId} does not exist` });
    }
    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ error: `Client ${clientId} does not exist` });
    }

    // If Field Officer provided, assign officer to this site
    if (officerId) {
      // Resolve officer ID if employee code was passed
      const officerRes = await query('SELECT id, name, employee_code FROM employees WHERE id = $1 OR employee_code = $1', [officerId]);
      const validOfficerId = officerRes.rows.length > 0 ? officerRes.rows[0].id : officerId;

      await query('UPDATE sites SET supervisor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [validOfficerId, siteId]);

      const ciaId = `CIA_${siteId}_${validOfficerId}`.slice(0, 50);
      await query(`
        INSERT INTO client_inspection_assignments (id, officer_id, client_id, site_id, assigned_date, status, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, 'Pending', 'Field Inspection and physical roll-call of deployed guards/housekeepers')
        ON CONFLICT (officer_id, site_id, assigned_date)
        DO UPDATE SET client_id = EXCLUDED.client_id, updated_at = CURRENT_TIMESTAMP
      `, [ciaId, validOfficerId, clientId, siteId]);
    }

    // Update site sanctioned strength
    if (staff.length > 0) {
      await query('UPDATE sites SET sanctioned_strength = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [staff.length, siteId]);
    }

    let processedCount = 0;
    const insertedStaff = [];

    for (let i = 0; i < staff.length; i++) {
      const row = staff[i];
      const rawCode = (row.employeeCode || row.code || `SS-${Date.now().toString().slice(-4)}${i}`).trim();
      const name = (row.name || row.fullName || row.staffName || `Security Staff ${i + 1}`).trim();
      const phone = (row.phone || row.phoneNumber || row.mobile || '+91 9800000000').trim();
      const designationName = (row.designation || row.role || 'Security Guard').trim();
      const departmentName = (row.department || (designationName.toLowerCase().includes('house') ? 'Housekeeping' : 'Security')).trim();

      // Check if employee exists by code or ID
      const existing = await query('SELECT id FROM employees WHERE employee_code = $1 OR id = $1', [rawCode]);
      let employeeId;

      if (existing.rows.length > 0) {
        employeeId = existing.rows[0].id;
        await query(`
          UPDATE employees
          SET name = $1, phone = $2, deployed_site_id = $3, deployed_client_id = $4, status = 'Active', updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [name, phone, siteId, clientId, employeeId]);
      } else {
        employeeId = `EMP_${rawCode.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
        await query(`
          INSERT INTO employees (id, employee_code, name, phone, deployed_site_id, deployed_client_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'Active')
          ON CONFLICT (employee_code) DO UPDATE 
          SET deployed_site_id = EXCLUDED.deployed_site_id, deployed_client_id = EXCLUDED.deployed_client_id, updated_at = CURRENT_TIMESTAMP
        `, [employeeId, rawCode, name, phone, siteId, clientId]);
      }

      // Upsert into deployments
      const depId = `DEP_${siteId}_${employeeId}`.slice(0, 50);
      await query(`
        INSERT INTO deployments (id, site_id, client_id, employee_id, start_date, status, deployed_by)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, 'Active', 'Ops Excel Import')
        ON CONFLICT (id) DO UPDATE SET status = 'Active', updated_at = CURRENT_TIMESTAMP
      `, [depId, siteId, clientId, employeeId]);

      processedCount++;
      insertedStaff.push({
        id: employeeId,
        employeeCode: rawCode,
        name,
        phone,
        designation: designationName,
        department: departmentName,
        status: 'Active',
      });
    }

    res.json({
      success: true,
      count: processedCount,
      siteId,
      siteName: siteCheck.rows[0]?.name,
      clientId,
      clientName: clientCheck.rows[0]?.name,
      officerId,
      staff: insertedStaff,
      message: `Successfully uploaded ${processedCount} staff members and deployed to ${clientCheck.rows[0]?.name} (${siteCheck.rows[0]?.name}). Assigned to field officer.`,
    });
  } catch (err) {
    console.error('Error in /bulk-excel:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /assign-officer: Assign Field Officer to a Client Site
router.post('/assign-officer', async (req, res) => {
  try {
    const { officerId, clientId, siteId, shift, notes } = req.body;
    if (!officerId || !clientId || !siteId) {
      return res.status(400).json({ error: 'officerId, clientId, and siteId are required' });
    }

    // Resolve officer
    const officerRes = await query('SELECT id, name, employee_code FROM employees WHERE id = $1 OR employee_code = $1', [officerId]);
    const validOfficerId = officerRes.rows.length > 0 ? officerRes.rows[0].id : officerId;
    const officerName = officerRes.rows[0]?.name || 'Field Officer';

    await query('UPDATE sites SET supervisor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [validOfficerId, siteId]);

    const ciaId = `CIA_${siteId}_${validOfficerId}`.slice(0, 50);
    await query(`
      INSERT INTO client_inspection_assignments (id, officer_id, client_id, site_id, assigned_date, shift, notes, status)
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, 'Pending')
      ON CONFLICT (officer_id, site_id, assigned_date) 
      DO UPDATE SET notes = EXCLUDED.notes, shift = EXCLUDED.shift, updated_at = CURRENT_TIMESTAMP
    `, [ciaId, validOfficerId, clientId, siteId, shift || 'Day Shift (06:00 - 14:00)', notes || 'Field inspection & roll call']);

    res.json({
      success: true,
      message: `Successfully assigned ${officerName} to client site.`,
      officerId: validOfficerId,
      siteId,
      clientId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

