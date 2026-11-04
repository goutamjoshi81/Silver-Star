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

-- Foundational Clients
INSERT INTO clients (id, name, contact_person, email, phone, address, contract_start, contract_end, status, portal_username, monthly_billing, services_provided) VALUES
('CLI001', 'Infosys Tech Park', 'Raghavendra Rao (VP Facilities)', 'facilities@infosys.com', '+91 80 2852 0261', 'Hosur Road, Electronics City Phase 1, Bengaluru, Karnataka 560100', '2026-01-01', '2027-12-31', 'Active', 'infosys_client', 485000.00, '["Physical Security", "Corporate Housekeeping", "BMS Electro-Mechanical"]'::jsonb),
('CLI002', 'Embassy GolfLinks Business Park', 'Sunil Murthy (Estate Director)', 'admin@embassygroups.com', '+91 80 4000 1200', 'Intermediate Ring Rd, Domlur, Bengaluru, Karnataka 560071', '2026-02-01', '2027-01-31', 'Active', 'embassy_client', 620000.00, '["Armed Escorts", "Pest Control & Sanitization", "24x7 Control Room Monitoring"]'::jsonb),
('CLI003', 'Prestige Tech Cloud', 'Kishore Kumar (GM Operations)', 'ops@prestigetechcloud.com', '+91 80 2559 1080', 'Devenahalli, International Airport Road, Bengaluru, Karnataka 562157', '2026-03-01', '2027-02-28', 'Active', 'prestige_client', 350000.00, '["Electro-Mechanical Maintenance", "Facade Cleaning", "HVAC Operations"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Foundational Sites (Geofenced Client Work Locations)
INSERT INTO sites (id, name, client_id, address, latitude, longitude, geofence_radius, sanctioned_strength, status) VALUES
('SITE001', 'Infosys - Electronic City Campus Phase 1', 'CLI001', 'Gate 1, Infosys Avenue, Electronics City, Bengaluru 560100', 12.845214, 77.660168, 150, 24, 'Active'),
('SITE002', 'Infosys - Electronic City Campus Phase 2', 'CLI001', 'Gate 4, Infosys Avenue, Electronics City, Bengaluru 560100', 12.849023, 77.665042, 120, 16, 'Active'),
('SITE003', 'Embassy GolfLinks - Tower A & B', 'CLI002', 'Tower A Main Lobby, EGL, Intermediate Ring Rd, Bengaluru 560071', 12.948512, 77.647521, 200, 30, 'Active'),
('SITE004', 'Prestige Tech Cloud - Data Center', 'CLI003', 'Block C Data Annex, Airport Road, Bengaluru 562157', 13.201245, 77.708912, 150, 18, 'Active')
ON CONFLICT (id) DO NOTHING;

-- Contract Billings
INSERT INTO contract_billings (id, client_id, contract_number, start_date, end_date, billing_frequency, total_value, monthly_amount, status, last_invoice_date, last_invoice_status) VALUES
('BIL001', 'CLI001', 'SS-CON-2026-001', '2026-01-01', '2027-12-31', 'Monthly', 5820000.00, 485000.00, 'Active', '2026-10-31', 'Paid'),
('BIL002', 'CLI002', 'SS-CON-2026-002', '2026-02-01', '2027-01-31', 'Monthly', 7440000.00, 620000.00, 'Active', '2026-10-31', 'Paid')
ON CONFLICT (id) DO NOTHING;


