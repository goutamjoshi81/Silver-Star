import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET daily work reports with date filter
router.get('/daily', async (req, res) => {
  try {
    const { date, startDate, endDate, siteId, status } = req.query;
    let sql = `
      SELECT r.*, s.name as site_name, c.name as client_name, e.name as submitted_by_name
      FROM daily_work_reports r
      JOIN sites s ON r.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN employees e ON r.submitted_by = e.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      sql += ` AND r.date = $${params.length}`;
    } else if (startDate && endDate) {
      params.push(startDate);
      sql += ` AND r.date >= $${params.length}`;
      params.push(endDate);
      sql += ` AND r.date <= $${params.length}`;
    }

    if (siteId) {
      params.push(siteId);
      sql += ` AND r.site_id = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND r.status = $${params.length}`;
    }

    sql += ' ORDER BY r.date DESC, r.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      siteId: r.site_id,
      siteName: r.site_name,
      clientName: r.client_name,
      date: r.date ? r.date.toISOString().split('T')[0] : '',
      submittedBy: r.submitted_by,
      submittedByName: r.submitted_by_name,
      status: r.status,
      summary: r.summary,
      consumables: r.consumables,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new daily work report
router.post('/daily', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `DWR${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO daily_work_reports (id, site_id, date, submitted_by, status, summary, consumables)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        b.siteId,
        b.date || new Date().toISOString().split('T')[0],
        b.submittedBy || null,
        b.status || 'Pending',
        b.summary,
        b.consumables || '',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET incidents
router.get('/incidents', async (req, res) => {
  try {
    const { siteId, status, priority, category } = req.query;
    let sql = `
      SELECT i.*, s.name as site_name, c.name as client_name
      FROM incidents i
      JOIN sites s ON i.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (siteId) {
      params.push(siteId);
      sql += ` AND i.site_id = $${params.length}`;
    }
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }
    if (priority && priority !== 'all') {
      params.push(priority);
      sql += ` AND i.priority = $${params.length}`;
    }
    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND i.category = $${params.length}`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      siteId: r.site_id,
      siteName: r.site_name,
      clientName: r.client_name,
      category: r.category,
      priority: r.priority,
      reportedBy: r.reported_by,
      reportedAt: r.reported_at ? r.reported_at.toISOString().replace('T', ' ').slice(0, 16) : '',
      status: r.status,
      description: r.description,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST incident
router.post('/incidents', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `INC${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO incidents (id, title, site_id, category, priority, reported_by, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        b.title,
        b.siteId,
        b.category || 'Security',
        b.priority || 'Medium',
        b.reportedBy || 'Staff',
        b.status || 'Open',
        b.description,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

