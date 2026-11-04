import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Helper to format DB row to Frontend Employee interface
function formatEmployee(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    name: row.name,
    photo: row.photo,
    dob: row.dob ? row.dob.toISOString().split('T')[0] : '',
    gender: row.gender,
    maritalStatus: row.marital_status,
    bloodGroup: row.blood_group,
    phone: row.phone,
    email: row.email,
    address: row.address,
    emergencyContact: row.emergency_contact || { name: '', relation: '', phone: '' },
    departmentId: row.department_id,
    designationId: row.designation_id,
    employmentType: row.employment_type,
    joiningDate: row.joining_date ? row.joining_date.toISOString().split('T')[0] : '',
    onboardingStatus: row.onboarding_status,
    kycStatus: row.kyc_status,
    kycMethod: row.kyc_method,
    deployedSiteId: row.deployed_site_id,
    deployedClientId: row.deployed_client_id,
    branchId: row.branch_id,
    status: row.status,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    ifsc: row.ifsc,
    pfNumber: row.pf_number,
    departmentName: row.dept_name,
    designationName: row.desig_name,
    siteName: row.site_name,
    clientName: row.client_name,
  };
}

// GET all employees
router.get('/', async (req, res) => {
  try {
    const { departmentId, status, onboardingStatus, search } = req.query;
    let sql = `
      SELECT e.*, 
             d.name as dept_name, 
             des.name as desig_name,
             s.name as site_name,
             c.name as client_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN sites s ON e.deployed_site_id = s.id
      LEFT JOIN clients c ON e.deployed_client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId && departmentId !== 'all') {
      params.push(departmentId);
      sql += ` AND e.department_id = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND e.status = $${params.length}`;
    }

    if (onboardingStatus && onboardingStatus !== 'all') {
      params.push(onboardingStatus);
      sql += ` AND e.onboarding_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (e.name ILIKE $${params.length} OR e.employee_code ILIKE $${params.length} OR e.phone ILIKE $${params.length})`;
    }

    sql += ' ORDER BY e.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(formatEmployee));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single employee
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT e.*, d.name as dept_name, des.name as desig_name, s.name as site_name, c.name as client_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN sites s ON e.deployed_site_id = s.id
       LEFT JOIN clients c ON e.deployed_client_id = c.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(formatEmployee(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to validate and sanitize foreign keys
async function sanitizeForeignKeys(b) {
  let { departmentId, designationId, branchId, deployedSiteId, deployedClientId } = b;

  if (departmentId) {
    const res = await query('SELECT id FROM departments WHERE id = $1', [departmentId]);
    if (res.rows.length === 0) departmentId = null;
  }
  if (designationId) {
    const res = await query('SELECT id FROM designations WHERE id = $1', [designationId]);
    if (res.rows.length === 0) designationId = null;
  }
  if (branchId) {
    const res = await query('SELECT id FROM branches WHERE id = $1', [branchId]);
    if (res.rows.length === 0) branchId = null;
  }
  if (deployedSiteId) {
    const res = await query('SELECT id FROM sites WHERE id = $1', [deployedSiteId]);
    if (res.rows.length === 0) deployedSiteId = null;
  }
  if (deployedClientId) {
    const res = await query('SELECT id FROM clients WHERE id = $1', [deployedClientId]);
    if (res.rows.length === 0) deployedClientId = null;
  }

  return { departmentId, designationId, branchId, deployedSiteId, deployedClientId };
}

// POST onboard new employee
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    // Auto-generate ID and employee code if not provided or if code conflicts
    const id = b.id || `EMP${Date.now().toString().slice(-6)}`;
    
    let employeeCode = b.employeeCode;
    if (employeeCode) {
      const codeCheck = await query('SELECT id FROM employees WHERE employee_code = $1', [employeeCode]);
      if (codeCheck.rows.length > 0) {
        const countRes = await query('SELECT COUNT(*) FROM employees');
        const nextNum = parseInt(countRes.rows[0].count, 10) + 10001 + Math.floor(10 + Math.random() * 90);
        employeeCode = `SS-${nextNum}`;
      }
    } else {
      const countRes = await query('SELECT COUNT(*) FROM employees');
      const nextNum = parseInt(countRes.rows[0].count, 10) + 10001;
      employeeCode = `SS-${nextNum}`;
    }

    const sanitized = await sanitizeForeignKeys(b);

    const { rows } = await query(
      `INSERT INTO employees (
        id, employee_code, name, photo, dob, gender, marital_status, blood_group,
        phone, email, address, emergency_contact, department_id, designation_id,
        employment_type, joining_date, onboarding_status, kyc_status, kyc_method,
        deployed_site_id, deployed_client_id, branch_id, status, bank_name,
        account_number, ifsc, pf_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        id,
        employeeCode,
        b.name,
        b.photo || null,
        b.dob || null,
        b.gender || 'Male',
        b.maritalStatus || 'Single',
        b.bloodGroup || 'B+',
        b.phone,
        b.email || `${employeeCode.toLowerCase()}@silverstarindia.net`,
        b.address || '',
        JSON.stringify(b.emergencyContact || {}),
        sanitized.departmentId,
        sanitized.designationId,
        b.employmentType || 'Permanent',
        b.joiningDate || new Date().toISOString().split('T')[0],
        b.onboardingStatus || 'Approved',
        b.kycStatus || 'Verified',
        b.kycMethod || 'Aadhaar Secure QR',
        sanitized.deployedSiteId,
        sanitized.deployedClientId,
        sanitized.branchId || 'BR001',
        b.status || 'Active',
        b.bankName || '',
        b.accountNumber || '',
        b.ifsc || '',
        b.pfNumber || null,
      ]
    );

    res.status(201).json(formatEmployee(rows[0]));
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const sanitized = await sanitizeForeignKeys(b);

    const { rows } = await query(
      `UPDATE employees SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        address = COALESCE($4, address),
        department_id = COALESCE($5, department_id),
        designation_id = COALESCE($6, designation_id),
        status = COALESCE($7, status),
        onboarding_status = COALESCE($8, onboarding_status),
        kyc_status = COALESCE($9, kyc_status),
        deployed_site_id = COALESCE($10, deployed_site_id),
        deployed_client_id = COALESCE($11, deployed_client_id),
        bank_name = COALESCE($12, bank_name),
        account_number = COALESCE($13, account_number),
        ifsc = COALESCE($14, ifsc),
        pf_number = COALESCE($15, pf_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        b.name,
        b.phone,
        b.email,
        b.address,
        sanitized.departmentId !== undefined ? sanitized.departmentId : b.departmentId,
        sanitized.designationId !== undefined ? sanitized.designationId : b.designationId,
        b.status,
        b.onboardingStatus,
        b.kycStatus,
        sanitized.deployedSiteId !== undefined ? sanitized.deployedSiteId : b.deployedSiteId,
        sanitized.deployedClientId !== undefined ? sanitized.deployedClientId : b.deployedClientId,
        b.bankName,
        b.accountNumber,
        b.ifsc,
        b.pfNumber,
        req.params.id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(formatEmployee(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

