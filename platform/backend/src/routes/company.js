import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

router.get('/company', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM company_profile LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM branches ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/designations', async (req, res) => {
  try {
    const { departmentId } = req.query;
    let sql = 'SELECT * FROM designations';
    const params = [];
    if (departmentId) {
      sql += ' WHERE department_id = $1';
      params.push(departmentId);
    }
    sql += ' ORDER BY name ASC';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shifts', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM shifts ORDER BY start_time ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
