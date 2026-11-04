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

export default router;

