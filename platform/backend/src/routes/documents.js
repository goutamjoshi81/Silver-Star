import express from 'express';
import { query } from '../db/index.js';
import { toDateStr } from '../utils/date.js';

const router = express.Router();

// GET all documents categorized by employee
router.get('/', async (req, res) => {
  try {
    const { status, employeeId, documentType } = req.query;
    let sql = `
      SELECT doc.*, 
             e.name as employee_name, 
             e.employee_code, 
             e.phone as employee_phone,
             d.name as department_name
      FROM employee_documents doc
      JOIN employees e ON doc.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND doc.status = $${params.length}`;
    }

    if (employeeId) {
      params.push(employeeId);
      sql += ` AND doc.employee_id = $${params.length}`;
    }

    if (documentType) {
      params.push(documentType);
      sql += ` AND doc.document_type = $${params.length}`;
    }

    sql += ' ORDER BY e.name ASC, doc.upload_date DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      employeePhone: r.employee_phone,
      departmentName: r.department_name,
      documentType: r.document_type,
      fileName: r.file_name,
      uploadDate: toDateStr(r.upload_date),
      status: r.status,
      fileUrl: r.file_url,
      reviewedBy: r.reviewed_by,
      rejectionReason: r.rejection_reason,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload/create document record
router.post('/', async (req, res) => {
  try {
    const { employeeId, documentType, fileName, fileUrl } = req.body;
    const id = `DOC${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const { rows } = await query(
      `INSERT INTO employee_documents (id, employee_id, document_type, file_name, upload_date, status, file_url)
       VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
       RETURNING *`,
      [id, employeeId, documentType, fileName, today, fileUrl || '#']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH review status (Approve / Reject)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, reviewedBy, rejectionReason } = req.body;
    const { rows } = await query(
      `UPDATE employee_documents SET
        status = $1,
        reviewed_by = COALESCE($2, reviewed_by),
        rejection_reason = COALESCE($3, rejection_reason)
       WHERE id = $4
       RETURNING *`,
      [status, reviewedBy || 'HR Manager', rejectionReason || null, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

