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
      `SELECT u.id, u.name, u.email, u.role, u.status, u.client_id, u.employee_id, u.last_login, u.created_at,
              c.name as client_name,
              e.name as employee_name, e.employee_code
       FROM user_accounts u
       LEFT JOIN clients c ON u.client_id = c.id
       LEFT JOIN employees e ON u.employee_id = e.id
       ORDER BY u.created_at DESC`
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

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Check if email already registered
    const existing = await query('SELECT id FROM user_accounts WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `A user account with email "${email.trim()}" already exists.` });
    }

    // Validate role
    const validRoles = ['Super Admin', 'HR Executive', 'Operations Manager', 'Corporate Client', 'Supervisor', 'Employee'];
    const assignedRole = validRoles.includes(role) ? role : 'Operations Manager';

    // Verify clientId or employeeId if provided
    let validClientId = null;
    if (clientId) {
      const cCheck = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
      if (cCheck.rows.length > 0) validClientId = clientId;
    }

    let validEmployeeId = null;
    if (employeeId) {
      const eCheck = await query('SELECT id FROM employees WHERE id = $1', [employeeId]);
      if (eCheck.rows.length > 0) validEmployeeId = employeeId;
    }

    const id = `USR${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO user_accounts (id, name, email, password_hash, role, client_id, employee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, status, client_id, employee_id, created_at`,
      [id, name.trim(), email.trim(), password || 'silver123', assignedRole, validClientId, validEmployeeId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating user account:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user account (role, status, password)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, status, password, clientId, employeeId } = req.body;
    const { id } = req.params;

    const userCheck = await query('SELECT * FROM user_accounts WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { rows } = await query(
      `UPDATE user_accounts SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         status = COALESCE($3, status),
         password_hash = COALESCE($4, password_hash),
         client_id = COALESCE($5, client_id),
         employee_id = COALESCE($6, employee_id)
       WHERE id = $7
       RETURNING id, name, email, role, status, client_id, employee_id, last_login, created_at`,
      [name, role, status, password, clientId, employeeId, id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user account
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'USR001') {
      return res.status(403).json({ error: 'Primary Super Admin account cannot be deleted.' });
    }

    const result = await query('DELETE FROM user_accounts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({ success: true, message: `User ${id} removed successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

