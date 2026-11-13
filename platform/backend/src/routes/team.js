import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all team members
router.get('/', async (req, res) => {
  try {
    const { department, status } = req.query;
    let sql = 'SELECT * FROM team_members WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    } else if (!status) {
      sql += ` AND status = 'Active'`;
    }

    if (department && department !== 'all') {
      params.push(department);
      sql += ` AND department = $${params.length}`;
    }

    sql += ' ORDER BY display_order ASC, created_at ASC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      department: r.department,
      bio: r.bio,
      photoUrl: r.photo_url,
      email: r.email,
      phone: r.phone,
      displayOrder: r.display_order,
      status: r.status,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create team member (Super Admin)
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const id = b.id || `TM${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO team_members (
        id, name, role, department, bio, photo_url, email, phone, display_order, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id,
        b.name.trim(),
        b.role.trim(),
        b.department || 'Executive Management',
        b.bio || '',
        b.photoUrl || '',
        b.email || '',
        b.phone || '',
        Number(b.displayOrder) || 0,
        b.status || 'Active',
      ]
    );

    const r = rows[0];
    res.status(201).json({
      id: r.id,
      name: r.name,
      role: r.role,
      department: r.department,
      bio: r.bio,
      photoUrl: r.photo_url,
      email: r.email,
      phone: r.phone,
      displayOrder: r.display_order,
      status: r.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update team member (Super Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;

    const existing = await query('SELECT * FROM team_members WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const cur = existing.rows[0];
    const { rows } = await query(
      `UPDATE team_members SET
        name = $1,
        role = $2,
        department = $3,
        bio = $4,
        photo_url = $5,
        email = $6,
        phone = $7,
        display_order = $8,
        status = $9
      WHERE id = $10
      RETURNING *`,
      [
        b.name !== undefined ? b.name.trim() : cur.name,
        b.role !== undefined ? b.role.trim() : cur.role,
        b.department !== undefined ? b.department : cur.department,
        b.bio !== undefined ? b.bio : cur.bio,
        b.photoUrl !== undefined ? b.photoUrl : cur.photo_url,
        b.email !== undefined ? b.email : cur.email,
        b.phone !== undefined ? b.phone : cur.phone,
        b.displayOrder !== undefined ? Number(b.displayOrder) : cur.display_order,
        b.status !== undefined ? b.status : cur.status,
        id,
      ]
    );

    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      role: r.role,
      department: r.department,
      bio: r.bio,
      photoUrl: r.photo_url,
      email: r.email,
      phone: r.phone,
      displayOrder: r.display_order,
      status: r.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM team_members WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ success: true, message: `Team member "${result.rows[0].name}" removed`, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
