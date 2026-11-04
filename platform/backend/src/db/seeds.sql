-- ============================================================
-- SILVER STAR FACILITY MANAGEMENT - FOUNDATIONAL MASTER DATA
-- ============================================================

-- Company Master Data
INSERT INTO company_profile (id, name, short_name, tagline, founder, founder_role, founder_phone1, founder_phone2, website, logo, email, phone, address, gstin, cin)
VALUES (
    'COMPANY_HQ',
    'Silver Star Facility Management Pvt. Ltd.',
    'Silver Star',
    'Your True Business Partners',
    'Ashok Majjige',
    'CEO & Founder',
    '+91 9620000494',
    '+91 9620008783',
    'https://silverstarindia.net/',
    'https://silverstarindia.net/wp-content/uploads/2024/08/sitelogo.png',
    'info@silverstarindia.net',
    '+91 80 4123 4567',
    'Electronic City Phase II, Bangalore - 560100',
    '29AABCS1429B1ZB',
    'U74999KA2014PTC075123'
) ON CONFLICT (id) DO NOTHING;

-- Branches
INSERT INTO branches (id, name, city, state, active) VALUES
('BR001', 'Bangalore HQ', 'Bangalore', 'Karnataka', true),
('BR002', 'New Delhi Office', 'New Delhi', 'Delhi', true)
ON CONFLICT (id) DO NOTHING;

-- Departments
INSERT INTO departments (id, name, code) VALUES
('DEP001', 'Housekeeping', 'HK'),
('DEP002', 'Security Services', 'SEC'),
('DEP003', 'Electro-Mechanical', 'EM'),
('DEP004', 'Horticulture', 'HOR'),
('DEP005', 'Administration', 'ADMIN'),
('DEP006', 'Guest House Management', 'GHM')
ON CONFLICT (id) DO NOTHING;

-- Designations
INSERT INTO designations (id, name, department_id) VALUES
('DES001', 'Security Guard', 'DEP002'),
('DES002', 'Security Supervisor', 'DEP002'),
('DES003', 'Housekeeping Attendant', 'DEP001'),
('DES004', 'Housekeeping Supervisor', 'DEP001'),
('DES005', 'HVAC Technician', 'DEP003'),
('DES006', 'Electrical Technician', 'DEP003'),
('DES007', 'Plumber', 'DEP003'),
('DES008', 'Admin Executive', 'DEP005')
ON CONFLICT (id) DO NOTHING;

-- Shifts
INSERT INTO shifts (id, name, start_time, end_time, grace_period_mins) VALUES
('SHF001', 'Morning Shift', '06:00:00', '14:00:00', 15),
('SHF002', 'Day Shift', '09:00:00', '18:00:00', 15),
('SHF003', 'Evening Shift', '14:00:00', '22:00:00', 15),
('SHF004', 'Night Shift', '22:00:00', '06:00:00', 15)
ON CONFLICT (id) DO NOTHING;

-- System User Accounts (RBAC)
INSERT INTO user_accounts (id, name, email, password_hash, role, status) VALUES
('USR001', 'Super Admin', 'admin@silverstarindia.net', 'admin123', 'Super Admin', 'Active'),
('USR002', 'HR Manager', 'hr@silverstarindia.net', 'hr123', 'HR Executive', 'Active'),
('USR003', 'Operations Manager', 'ops@silverstarindia.net', 'ops123', 'Operations Manager', 'Active')
ON CONFLICT (id) DO NOTHING;
