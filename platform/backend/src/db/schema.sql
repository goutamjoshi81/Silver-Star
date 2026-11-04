-- ============================================================
-- SILVER STAR FACILITY MANAGEMENT - POSTGRESQL PRODUCTION SCHEMA
-- Database: silverstardb | Port: 5432
-- ============================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Company Profile
CREATE TABLE IF NOT EXISTS company_profile (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'COMPANY_HQ',
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    tagline VARCHAR(255),
    founder VARCHAR(100),
    founder_role VARCHAR(100),
    founder_phone1 VARCHAR(30),
    founder_phone2 VARCHAR(30),
    website VARCHAR(255),
    logo VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    gstin VARCHAR(50),
    cin VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Designations
CREATE TABLE IF NOT EXISTS designations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Accounts (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS user_accounts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'HR Executive', 'Operations Manager', 'Corporate Client', 'Supervisor', 'Employee')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    client_id VARCHAR(50),
    employee_id VARCHAR(50),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Clients
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    contract_start DATE,
    contract_end DATE,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Expired', 'Terminated')),
    portal_username VARCHAR(100) UNIQUE,
    monthly_billing NUMERIC(12, 2) DEFAULT 0.00,
    services_provided JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sites (Work locations with Geofencing)
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE CASCADE,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geofence_radius INTEGER NOT NULL DEFAULT 100, -- radius in meters
    sanctioned_strength INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    supervisor_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Employees (Master Data)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    photo TEXT,
    dob DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    marital_status VARCHAR(20) CHECK (marital_status IN ('Single', 'Married', 'Divorced')),
    blood_group VARCHAR(10),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    designation_id VARCHAR(50) REFERENCES designations(id) ON DELETE SET NULL,
    employment_type VARCHAR(50) DEFAULT 'Permanent' CHECK (employment_type IN ('Permanent', 'Contract', 'Probation')),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    onboarding_status VARCHAR(30) DEFAULT 'Pending' CHECK (onboarding_status IN ('Approved', 'Pending', 'Rejected')),
    kyc_status VARCHAR(30) DEFAULT 'Pending' CHECK (kyc_status IN ('Verified', 'Pending', 'Rejected')),
    kyc_method VARCHAR(50) CHECK (kyc_method IN ('Aadhaar Secure QR', 'DigiLocker', 'Manual Physical', NULL)),
    deployed_site_id VARCHAR(50) REFERENCES sites(id) ON DELETE SET NULL,
    deployed_client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    ifsc VARCHAR(50),
    pf_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_mins INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Deployments (Staff assigned to Client Sites)
CREATE TABLE IF NOT EXISTS deployments (
    id VARCHAR(50) PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id VARCHAR(50) REFERENCES shifts(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Relieved', 'Transferred')),
    deployed_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Attendance Records (GPS & Geofence Verified)
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    site_id VARCHAR(50) REFERENCES sites(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    punch_in TIME,
    punch_out TIME,
    status VARCHAR(30) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day')),
    gps_verified BOOLEAN DEFAULT FALSE,
    punch_in_latitude DOUBLE PRECISION,
    punch_in_longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_emp_date UNIQUE (employee_id, date)
);

-- 12. Employee Documents (Categorized by Employee)
CREATE TABLE IF NOT EXISTS employee_documents (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
    file_url TEXT NOT NULL,
    reviewed_by VARCHAR(50),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Contract Billings & Agreements
CREATE TABLE IF NOT EXISTS contract_billings (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    billing_frequency VARCHAR(30) DEFAULT 'Monthly' CHECK (billing_frequency IN ('Monthly', 'Quarterly', 'Annual')),
    total_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    monthly_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'Expiring Soon', 'Expired')),
    last_invoice_date DATE,
    last_invoice_status VARCHAR(30) DEFAULT 'Pending' CHECK (last_invoice_status IN ('Paid', 'Pending', 'Overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. GST Invoices (Tax Invoices with Upload capability)
CREATE TABLE IF NOT EXISTS gst_invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_id VARCHAR(50) REFERENCES contract_billings(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    subtotal NUMERIC(14, 2) NOT NULL,
    cgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    cgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    sgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue', 'Cancelled')),
    gst_bill_file_url TEXT,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Daily Work Reports (Operations & Supervisor logs)
CREATE TABLE IF NOT EXISTS daily_work_reports (
    id VARCHAR(50) PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    submitted_by VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
    summary TEXT NOT NULL,
    consumables TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Incidents & Complaints
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    site_id VARCHAR(50) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('Security', 'Maintenance', 'Housekeeping', 'Safety')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    reported_by VARCHAR(50),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('warning', 'error', 'info', 'success')),
    target_role VARCHAR(50),
    user_id VARCHAR(50) REFERENCES user_accounts(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_deployed_site ON employees(deployed_site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_emp ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_sites_client ON sites(client_id);
CREATE INDEX IF NOT EXISTS idx_deployments_site ON deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_deployments_client ON deployments(client_id);
CREATE INDEX IF NOT EXISTS idx_docs_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_dwr_site_date ON daily_work_reports(site_id, date);
CREATE INDEX IF NOT EXISTS idx_gst_invoices_client ON gst_invoices(client_id);
