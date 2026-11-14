import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET all services
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let sql = 'SELECT * FROM services WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    } else if (!status) {
      sql += ` AND status = 'Active'`;
    }

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY display_order ASC, created_at ASC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      iconName: r.icon_name || 'Briefcase',
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
      displayOrder: r.display_order,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single service by id or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { rows } = await query(
      'SELECT * FROM services WHERE id = $1 OR slug = $1 LIMIT 1',
      [idOrSlug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      iconName: r.icon_name || 'Briefcase',
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
      displayOrder: r.display_order,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create service (Super Admin)
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.title || !b.shortDescription) {
      return res.status(400).json({ error: 'Title and short description are required' });
    }

    const id = b.id || `SRV${Date.now().toString().slice(-6)}`;
    const slug = b.slug ? slugify(b.slug) : slugify(b.title);
    const category = b.category || 'Facility Management';
    const features = Array.isArray(b.features) ? b.features : [];

    const { rows } = await query(
      `INSERT INTO services (
        id, title, slug, category, short_description, description,
        image_url, icon_name, features, display_order, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id,
        b.title.trim(),
        slug,
        category,
        b.shortDescription.trim(),
        (b.description || b.shortDescription).trim(),
        b.imageUrl || 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg',
        b.iconName || 'Briefcase',
        JSON.stringify(features),
        Number(b.displayOrder) || 0,
        b.status || 'Active',
      ]
    );

    const r = rows[0];
    res.status(201).json({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      iconName: r.icon_name,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
      displayOrder: r.display_order,
      status: r.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update service (Super Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;

    const existingRes = await query('SELECT * FROM services WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const current = existingRes.rows[0];
    const title = b.title !== undefined ? b.title.trim() : current.title;
    const slug = b.slug ? slugify(b.slug) : (b.title ? slugify(b.title) : current.slug);
    const category = b.category !== undefined ? b.category : current.category;
    const shortDesc = b.shortDescription !== undefined ? b.shortDescription.trim() : current.short_description;
    const desc = b.description !== undefined ? b.description.trim() : current.description;
    const imageUrl = b.imageUrl !== undefined ? b.imageUrl : current.image_url;
    const iconName = b.iconName !== undefined ? b.iconName : current.icon_name;
    const features = b.features !== undefined ? (Array.isArray(b.features) ? b.features : []) : current.features;
    const displayOrder = b.displayOrder !== undefined ? Number(b.displayOrder) : current.display_order;
    const status = b.status !== undefined ? b.status : current.status;

    const { rows } = await query(
      `UPDATE services SET
        title = $1,
        slug = $2,
        category = $3,
        short_description = $4,
        description = $5,
        image_url = $6,
        icon_name = $7,
        features = $8,
        display_order = $9,
        status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *`,
      [
        title,
        slug,
        category,
        shortDesc,
        desc,
        imageUrl,
        iconName,
        JSON.stringify(features),
        displayOrder,
        status,
        id,
      ]
    );

    const r = rows[0];
    res.json({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      iconName: r.icon_name,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
      displayOrder: r.display_order,
      status: r.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE service (Super Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING id, title', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ success: true, message: `Service "${result.rows[0].title}" deleted successfully`, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

