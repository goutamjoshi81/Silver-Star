import express from 'express';
import { query } from '../db/index.js';
import { toDateStr } from '../utils/date.js';

const router = express.Router();

// Helper to format DB row to Frontend Employee interface
function formatEmployee(row) {
  const isFieldOfficer = Boolean(
    (row.desig_name && (row.desig_name.toLowerCase().includes('field') || row.desig_name.toLowerCase().includes('supervisor') || row.desig_name.toLowerCase().includes('officer'))) ||
    (row.app_role && (row.app_role.toLowerCase().includes('operation') || row.app_role.toLowerCase().includes('supervisor') || row.app_role.toLowerCase().includes('field')))
  );

  return {
    id: row.id,
    employeeCode: row.employee_code,
    name: row.name,
    photo: row.photo,
    dob: toDateStr(row.dob),
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
    joiningDate: toDateStr(row.joining_date),
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
    hasAppAccess: Boolean(row.user_account_id && row.app_status === 'Active'),
    isFieldOfficer,
    appAccess: row.user_account_id ? {
      userId: row.user_account_id,
      role: row.app_role,
      status: row.app_status,
      email: row.app_email,
      username: row.app_username,
    } : null,
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
             c.name as client_name,
             u.id as user_account_id,
             u.role as app_role,
             u.status as app_status,
             u.email as app_email,
             u.name as app_username
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations des ON e.designation_id = des.id
      LEFT JOIN sites s ON e.deployed_site_id = s.id
      LEFT JOIN clients c ON e.deployed_client_id = c.id
      LEFT JOIN user_accounts u ON (u.employee_id = e.id OR LOWER(u.email) = LOWER(e.email))
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

// GET single employee by ID or Employee Code (Public & Authenticated)
router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;

    // Special case for Founder & CEO credential
    if (rawId === 'SS-FOUNDER-01' || rawId.toLowerCase() === 'founder') {
      return res.json({
        id: 'EMP-FOUNDER',
        employeeCode: 'SS-FOUNDER-01',
        name: 'Ashok Majjige',
        photo: '/silverstar-icon-512.png',
        dob: '1978-04-12',
        gender: 'Male',
        maritalStatus: 'Married',
        bloodGroup: 'O+',
        phone: '+91 9620000494',
        email: 'info@silverstarindia.net',
        address: 'Electronic City Phase II, Bangalore - 560100',
        emergencyContact: { name: 'Corporate Office', relation: 'HQ Desk', phone: '+91 80 4123 4567' },
        departmentId: 'DEP005',
        designationId: 'DES-EXEC',
        employmentType: 'Permanent',
        joiningDate: '2014-06-01',
        onboardingStatus: 'Approved',
        kycStatus: 'Verified',
        kycMethod: 'Ministry of Corporate Affairs Verified (DIN/CIN)',
        deployedSiteId: null,
        deployedClientId: null,
        branchId: 'BR001',
        status: 'Active',
        bankName: 'State Bank of India',
        accountNumber: '389201948210',
        ifsc: 'SBIN0004123',
        pfNumber: 'KN/BNG/0075123/001',
        departmentName: 'Executive Directorate',
        designationName: 'CEO & Founder',
        siteName: 'Silver Star Corporate HQ',
        clientName: 'Silver Star Facility Management Pvt. Ltd.',
      });
    }

    const { rows } = await query(
      `SELECT e.*, d.name as dept_name, des.name as desig_name, s.name as site_name, c.name as client_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN sites s ON e.deployed_site_id = s.id
       LEFT JOIN clients c ON e.deployed_client_id = c.id
       WHERE e.id = $1 OR e.employee_code ILIKE $1`,
      [rawId]
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

// Helper to normalize enum fields for database constraints
function normalizeEmployeeFields(b) {
  let gender = 'Male';
  if (b.gender) {
    const g = String(b.gender).trim().toLowerCase();
    if (g === 'female' || g === 'f') gender = 'Female';
    else if (g === 'other' || g === 'o') gender = 'Other';
    else gender = 'Male';
  }

  let maritalStatus = 'Single';
  if (b.maritalStatus) {
    const m = String(b.maritalStatus).trim().toLowerCase();
    if (m.includes('marr')) maritalStatus = 'Married';
    else if (m.includes('divorc')) maritalStatus = 'Divorced';
    else maritalStatus = 'Single';
  }

  let employmentType = 'Permanent';
  if (b.employmentType) {
    const e = String(b.employmentType).trim().toLowerCase();
    if (e.includes('contract')) employmentType = 'Contract';
    else if (e.includes('probat')) employmentType = 'Probation';
    else employmentType = 'Permanent';
  }

  let onboardingStatus = 'Approved';
  if (b.onboardingStatus) {
    const o = String(b.onboardingStatus).trim().toLowerCase();
    if (o.includes('pend')) onboardingStatus = 'Pending';
    else if (o.includes('reject')) onboardingStatus = 'Rejected';
    else onboardingStatus = 'Approved';
  }

  let kycStatus = 'Verified';
  if (b.kycStatus) {
    const k = String(b.kycStatus).trim().toLowerCase();
    if (k.includes('pend')) kycStatus = 'Pending';
    else if (k.includes('reject')) kycStatus = 'Rejected';
    else kycStatus = 'Verified';
  }

  let kycMethod = 'Aadhaar Secure QR';
  if (b.kycMethod) {
    const km = String(b.kycMethod).trim().toLowerCase();
    if (km.includes('digi')) kycMethod = 'DigiLocker';
    else if (km.includes('phys') || km.includes('manual')) kycMethod = 'Manual Physical';
    else kycMethod = 'Aadhaar Secure QR';
  }

  let status = 'Active';
  if (b.status) {
    const s = String(b.status).trim().toLowerCase();
    if (s.includes('inact')) status = 'Inactive';
    else if (s.includes('leave')) status = 'On Leave';
    else status = 'Active';
  }

  // Sanitize Date
  const dob = (b.dob && String(b.dob).trim().length > 0) ? String(b.dob).split('T')[0] : null;
  const joiningDate = (b.joiningDate && String(b.joiningDate).trim().length > 0) 
    ? String(b.joiningDate).split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return { gender, maritalStatus, employmentType, onboardingStatus, kycStatus, kycMethod, status, dob, joiningDate };
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
    const norm = normalizeEmployeeFields(b);

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
        b.name || 'New Staff Member',
        b.photo || null,
        norm.dob,
        norm.gender,
        norm.maritalStatus,
        b.bloodGroup || 'B+',
        b.phone || '+91 99999 99999',
        b.email || `${employeeCode.toLowerCase()}@silverstarindia.net`,
        b.address || '',
        JSON.stringify(b.emergencyContact || {}),
        sanitized.departmentId,
        sanitized.designationId,
        norm.employmentType,
        norm.joiningDate,
        norm.onboardingStatus,
        norm.kycStatus,
        norm.kycMethod,
        sanitized.deployedSiteId,
        sanitized.deployedClientId,
        sanitized.branchId || 'BR001',
        norm.status,
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

// POST bulk upload employees
router.post('/bulk', async (req, res) => {
  try {
    const rawEmployees = Array.isArray(req.body) ? req.body : (req.body.employees || []);
    if (!rawEmployees || rawEmployees.length === 0) {
      return res.status(400).json({ error: 'No employee records provided for bulk upload.' });
    }

    // Pre-fetch departments and designations for flexible name-to-id resolution
    const deptRes = await query('SELECT id, name, code FROM departments');
    const desigRes = await query('SELECT id, name, department_id FROM designations');
    const departments = deptRes.rows;
    const designations = desigRes.rows;

    const inserted = [];
    const errors = [];

    // Current employee count for generating sequential codes
    const countRes = await query('SELECT COUNT(*) FROM employees');
    let runningCount = parseInt(countRes.rows[0].count, 10) + 10001;

    for (let i = 0; i < rawEmployees.length; i++) {
      const b = rawEmployees[i];
      const name = b.name || b.fullName || b.employeeName;

      if (!name || String(name).trim().length === 0) {
        errors.push({ row: i + 1, error: 'Full Name is required.' });
        continue;
      }

      try {
        const id = b.id || `EMP${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

        // Resolve Department
        let deptId = b.departmentId;
        const deptInput = String(b.department || b.dept || b.departmentId || '').trim().toLowerCase();
        if (deptInput) {
          const match = departments.find(d => 
            d.id.toLowerCase() === deptInput || 
            d.name.toLowerCase() === deptInput || 
            d.code.toLowerCase() === deptInput ||
            d.name.toLowerCase().includes(deptInput) ||
            deptInput.includes(d.name.toLowerCase())
          );
          if (match) deptId = match.id;
        }
        if (!deptId && departments.length > 0) {
          deptId = departments[0].id;
        }

        // Resolve Designation
        let desigId = b.designationId;
        const desigInput = String(b.designation || b.role || b.designationId || '').trim().toLowerCase();
        if (desigInput) {
          const match = designations.find(d => 
            d.id.toLowerCase() === desigInput || 
            d.name.toLowerCase() === desigInput ||
            d.name.toLowerCase().includes(desigInput) ||
            desigInput.includes(d.name.toLowerCase())
          );
          if (match) desigId = match.id;
        }
        if (!desigId && designations.length > 0) {
          const deptDesig = designations.find(d => d.department_id === deptId);
          desigId = deptDesig ? deptDesig.id : designations[0].id;
        }

        // Resolve Employee Code
        let employeeCode = b.employeeCode || b.empCode;
        if (employeeCode) {
          const codeCheck = await query('SELECT id FROM employees WHERE employee_code = $1', [employeeCode]);
          if (codeCheck.rows.length > 0) {
            runningCount++;
            employeeCode = `SS-${runningCount}`;
          }
        } else {
          runningCount++;
          employeeCode = `SS-${runningCount}`;
        }

        const sanitized = await sanitizeForeignKeys({
          departmentId: deptId,
          designationId: desigId,
          branchId: b.branchId || 'BR001',
          deployedSiteId: b.deployedSiteId || null,
          deployedClientId: b.deployedClientId || null,
        });

        const phone = b.phone || '+91 98765 00000';
        const email = b.email || `${employeeCode.toLowerCase()}@silverstarindia.net`;
        const employmentType = ['Permanent', 'Contract', 'Probation'].includes(b.employmentType) ? b.employmentType : 'Permanent';
        const gender = ['Male', 'Female', 'Other'].includes(b.gender) ? b.gender : 'Male';
        const status = ['Active', 'On Leave', 'Suspended', 'Terminated', 'Inactive'].includes(b.status) ? b.status : 'Active';

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
            name,
            b.photo || null,
            b.dob || null,
            gender,
            b.maritalStatus || 'Single',
            b.bloodGroup || 'B+',
            phone,
            email,
            b.address || '',
            JSON.stringify(b.emergencyContact || {}),
            sanitized.departmentId,
            sanitized.designationId,
            employmentType,
            b.joiningDate || new Date().toISOString().split('T')[0],
            b.onboardingStatus || 'Approved',
            b.kycStatus || 'Verified',
            b.kycMethod || 'Aadhaar Secure QR',
            sanitized.deployedSiteId,
            sanitized.deployedClientId,
            sanitized.branchId || 'BR001',
            status,
            b.bankName || '',
            b.accountNumber || '',
            b.ifsc || '',
            b.pfNumber || null,
          ]
        );

        inserted.push(formatEmployee(rows[0]));
      } catch (rowErr) {
        errors.push({ row: i + 1, name, error: rowErr.message });
      }
    }

    res.status(200).json({
      success: true,
      count: inserted.length,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Error bulk uploading employees:', err);
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

// GRANT Field Officer Application Access
router.post('/:id/grant-field-officer', async (req, res) => {
  try {
    const empId = req.params.id;
    const {
      username,
      email,
      password = 'Silverstar@123',
      role = 'Operations Manager',
      updateDesignation = true,
    } = req.body;

    const empRes = await query('SELECT * FROM employees WHERE id = $1 OR employee_code = $1', [empId]);
    if (empRes.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const emp = empRes.rows[0];

    // 1. Update employee password and kyc_status, and optionally designation
    let designationUpdateSql = '';
    const empParams = [password, emp.id];
    if (updateDesignation) {
      const desCheck = await query("SELECT id FROM designations WHERE id = 'DES009' OR name ILIKE '%Field Officer%' LIMIT 1");
      const targetDesId = desCheck.rows.length > 0 ? desCheck.rows[0].id : 'DES002';
      empParams.push(targetDesId);
      designationUpdateSql = `, designation_id = $${empParams.length}`;
    }

    await query(`
      UPDATE employees 
      SET password_hash = $1, 
          kyc_status = 'Verified'
          ${designationUpdateSql},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, empParams);

    // 2. Provision or update user_accounts record for mobile & ops panel login
    const loginEmail = (email && email.trim()) || emp.email || `${emp.employee_code.toLowerCase().replace(/[^a-z0-9]/g, '')}@silverstarindia.net`;
    const loginName = (username && username.trim()) || emp.name;

    const userCheck = await query('SELECT id FROM user_accounts WHERE employee_id = $1 OR LOWER(email) = LOWER($2)', [emp.id, loginEmail]);
    
    let accountId;
    if (userCheck.rows.length > 0) {
      accountId = userCheck.rows[0].id;
      await query(`
        UPDATE user_accounts
        SET password_hash = $1,
            role = $2,
            status = 'Active',
            name = $3,
            employee_id = $4
        WHERE id = $5
      `, [password, role, loginName, emp.id, accountId]);
    } else {
      accountId = `USR${Date.now().toString().slice(-6)}`;
      await query(`
        INSERT INTO user_accounts (id, name, email, password_hash, role, status, employee_id)
        VALUES ($1, $2, $3, $4, $5, 'Active', $6)
      `, [accountId, loginName, loginEmail, password, role, emp.id]);
    }

    res.json({
      success: true,
      message: `Field Officer application access successfully granted to ${emp.name}`,
      credentials: {
        employeeId: emp.id,
        employeeCode: emp.employee_code,
        name: emp.name,
        loginIdentifier: emp.employee_code,
        loginEmail,
        role,
        status: 'Active',
        defaultPassword: password,
      },
    });
  } catch (err) {
    console.error('Error granting field officer app access:', err);
    res.status(500).json({ error: err.message });
  }
});

// REVOKE Field Officer Application Access
router.post('/:id/revoke-field-officer', async (req, res) => {
  try {
    const empId = req.params.id;
    const empRes = await query('SELECT * FROM employees WHERE id = $1 OR employee_code = $1', [empId]);
    if (empRes.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const emp = empRes.rows[0];

    // Deactivate user_accounts for this employee
    await query("UPDATE user_accounts SET status = 'Inactive' WHERE employee_id = $1 OR LOWER(email) = LOWER($2)", [emp.id, emp.email || '']);

    // Clear supervisor assignments
    await query('UPDATE sites SET supervisor_id = NULL WHERE supervisor_id = $1', [emp.id]);
    await query("UPDATE client_inspection_assignments SET status = 'Cancelled' WHERE officer_id = $1", [emp.id]);

    res.json({
      success: true,
      message: `Field Officer application access revoked for ${emp.name}`,
    });
  } catch (err) {
    console.error('Error revoking field officer app access:', err);
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

