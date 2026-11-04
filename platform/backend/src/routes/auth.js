import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, email, password, employeeCode } = req.body;
    const loginIdentifier = email || username || employeeCode;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    // Check user_accounts first
    const userRes = await query(
      `SELECT * FROM user_accounts 
       WHERE (LOWER(email) = LOWER($1) OR LOWER(id) = LOWER($1)) AND status = 'Active'`,
      [loginIdentifier]
    );

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      if (user.password_hash === password) {
        await query('UPDATE user_accounts SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        return res.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clientId: user.client_id,
            employeeId: user.employee_id,
          },
        });
      }
    }

    // Check if employee code login
    const empRes = await query(
      `SELECT * FROM employees WHERE LOWER(employee_code) = LOWER($1) AND status = 'Active'`,
      [loginIdentifier]
    );

    if (empRes.rows.length > 0) {
      const emp = empRes.rows[0];
      // Default employee password is "emp123" if not configured
      if (password === 'emp123') {
        return res.json({
          success: true,
          user: {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: 'Employee',
            employeeId: emp.id,
            employeeCode: emp.employee_code,
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials or inactive account' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// List all user accounts
router.get('/users', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, role, status, client_id, employee_id, last_login, created_at FROM user_accounts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, clientId, employeeId } = req.body;
    const id = `USR${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO user_accounts (id, name, email, password_hash, role, client_id, employee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, status, client_id, employee_id, created_at`,
      [id, name, email, password || 'silver123', role, clientId || null, employeeId || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

