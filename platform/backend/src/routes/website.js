import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// -------------------------------------------------------------
// 1. CLIENTELE SHOWCASE
// -------------------------------------------------------------

// GET all clientele logos
router.get('/clientele', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let sql = 'SELECT * FROM website_clientele WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (featured === 'true') {
      sql += ' AND is_featured = true';
    }

    sql += ' ORDER BY display_order ASC, created_at ASC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      logoUrl: r.logo_url,
      websiteUrl: r.website_url,
      isFeatured: r.is_featured,
      displayOrder: r.display_order,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add client logo
router.post('/clientele', async (req, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.logoUrl) {
      return res.status(400).json({ error: 'Name and logoUrl are required' });
    }
    const id = b.id || `CLI${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO website_clientele (id, name, category, logo_url, website_url, is_featured, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        b.name.trim(),
        b.category || 'Corporate',
        b.logoUrl.trim(),
        b.websiteUrl || null,
        b.isFeatured !== undefined ? !!b.isFeatured : true,
        Number(b.displayOrder) || 0,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE client logo
router.delete('/clientele/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM website_clientele WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client logo not found' });
    }
    res.json({ success: true, message: `Client logo "${result.rows[0].name}" removed`, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. CONTACT & QUOTE INQUIRIES
// -------------------------------------------------------------

// POST submit contact or quote inquiry from public website
router.post('/inquiries', async (req, res) => {
  try {
    const b = req.body;
    if (!b.name || (!b.email && !b.phone)) {
      return res.status(400).json({ error: 'Name, and phone or email are required' });
    }

    const id = b.id || `INQ${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO contact_inquiries (
        id, name, email, phone, service_id, service_name, company_name, city, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'New')
      RETURNING *`,
      [
        id,
        b.name.trim(),
        (b.email || '').trim(),
        (b.phone || '').trim(),
        b.serviceId || null,
        b.serviceName || 'General Facility Inquiry',
        b.companyName || '',
        b.city || 'Bangalore',
        b.message || 'Customer requested service quotation and initial assessment.',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! A Silver Star representative will contact you within 24 hours.',
      inquiry: rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET list all inquiries (for Super Admin)
router.get('/inquiries', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM contact_inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      serviceId: r.service_id,
      serviceName: r.service_name,
      companyName: r.company_name,
      city: r.city,
      message: r.message,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update inquiry status
router.put('/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const { rows } = await query(
      `UPDATE contact_inquiries
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
