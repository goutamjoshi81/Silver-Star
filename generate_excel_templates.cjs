const fs = require('fs');
const path = require('path');
const XLSX = require('./platform/packages/mock-data/node_modules/xlsx');

function createClientTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template
  const headers = [
    'Company Name *',
    'Contact Person *',
    'Email Address *',
    'Phone Number *',
    'Facility Address',
    'Monthly Billing (INR) *',
    'Services Provided',
    'Contract Start Date',
    'Contract End Date',
    'Account Status'
  ];

  const sampleData = [
    [
      'Infosys Campus Electronic City',
      'Rajesh Kumar',
      'operations@infosys-ecity.com',
      '+91 98860 12345',
      'Electronic City Phase 1, Bangalore - 560100',
      450000,
      'Security Services; Housekeeping',
      '2026-01-01',
      '2027-12-31',
      'Active'
    ],
    [
      'Wipro Sarjapur Facility',
      'Priya Sharma',
      'admin@wipro-campus.com',
      '+91 99001 54321',
      'Doddakannelli, Sarjapur Road, Bangalore - 560035',
      320000,
      'Security Services; Electro-Mechanical',
      '2026-02-15',
      '2027-02-14',
      'Active'
    ],
    [
      'Prestige Tech Cloud',
      'Anil Deshmukh',
      'facility@prestigegroup.com',
      '+91 98450 98765',
      'Hebbal Outer Ring Road, Bangalore - 560045',
      280000,
      'Housekeeping; Horticulture',
      '2026-03-01',
      '2027-02-28',
      'Active'
    ]
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 34 }, // Company Name
    { wch: 22 }, // Contact Person
    { wch: 32 }, // Email Address
    { wch: 20 }, // Phone Number
    { wch: 45 }, // Facility Address
    { wch: 24 }, // Monthly Billing
    { wch: 36 }, // Services Provided
    { wch: 20 }, // Contract Start
    { wch: 20 }, // Contract End
    { wch: 16 }  // Account Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Client Upload Template');

  // Sheet 2: Guidelines
  const guideHeaders = ['Field Name', 'Mandatory / Optional', 'Allowed Values / Constraints', 'Description & Guidance'];
  const guideRows = [
    ['Company Name *', 'Mandatory', 'Any valid company / entity name (2-255 chars)', 'Official legal name of client organization.'],
    ['Contact Person *', 'Mandatory', 'Full name of corporate contact', 'Designated facility manager or corporate representative.'],
    ['Email Address *', 'Mandatory', 'Valid email format (user@domain.com)', 'Official communication & automated GST invoice recipient.'],
    ['Phone Number *', 'Mandatory', 'Valid 10-digit or international format with +91', 'Primary emergency and operational contact phone.'],
    ['Facility Address', 'Optional', 'Street, Area, City, State, PIN', 'Physical premises or corporate headquarters location.'],
    ['Monthly Billing (INR) *', 'Mandatory', 'Numeric value > 0 (e.g. 250000)', 'Contractual monthly service fee in Indian Rupees.'],
    ['Services Provided', 'Optional', 'Separated by semicolon (;)', 'e.g. Security Services; Housekeeping; Electro-Mechanical'],
    ['Contract Start Date', 'Optional', 'YYYY-MM-DD (e.g. 2026-01-01)', 'Commencement date of facility agreement (defaults to today).'],
    ['Contract End Date', 'Optional', 'YYYY-MM-DD (e.g. 2027-01-01)', 'Contract expiration / renewal date (defaults to 1 year).'],
    ['Account Status', 'Optional', 'Active | Pending | Expired | Terminated', 'Current operational status of client account (default: Active).']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [{ wch: 26 }, { wch: 24 }, { wch: 42 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Guidelines & Validation Rules');

  return wb;
}

function createEmployeeTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template
  const headers = [
    'Employee Code',
    'Full Name *',
    'Phone Number *',
    'Official Email',
    'Department *',
    'Designation *',
    'Employment Type',
    'Gender',
    'Date of Birth',
    'Blood Group',
    'Residential Address',
    'Joining Date',
    'Bank Name',
    'Account Number',
    'IFSC Code',
    'PF UAN Number',
    'Employment Status'
  ];

  const sampleData = [
    [
      'SS-10020',
      'Suresh Gowda',
      '+91 98765 11001',
      'suresh.gowda@silverstarindia.net',
      'Security Services',
      'Security Guard',
      'Permanent',
      'Male',
      '1992-05-14',
      'O+',
      '#42, 2nd Main, BTM 2nd Stage, Bangalore - 560076',
      '2025-06-01',
      'State Bank of India',
      '30291827364',
      'SBIN0004051',
      '100928374615',
      'Active'
    ],
    [
      'SS-10021',
      'Manjula R',
      '+91 98765 11002',
      'manjula.r@silverstarindia.net',
      'Housekeeping',
      'Housekeeping Attendant',
      'Permanent',
      'Female',
      '1995-08-22',
      'B+',
      '#15, 4th Cross, Bommanahalli, Bangalore - 560068',
      '2025-07-15',
      'HDFC Bank',
      '501004928371',
      'HDFC0000128',
      '100928374616',
      'Active'
    ],
    [
      'SS-10022',
      'Karthik Nair',
      '+91 98765 11003',
      'karthik.nair@silverstarindia.net',
      'Electro-Mechanical',
      'Electrical Technician',
      'Permanent',
      'Male',
      '1990-11-03',
      'AB+',
      '#88, 1st Cross, Koramangala 4th Block, Bangalore - 560034',
      '2025-08-01',
      'ICICI Bank',
      '000201584920',
      'ICIC0000002',
      '100928374617',
      'Active'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 18 }, // Code
    { wch: 24 }, // Name
    { wch: 20 }, // Phone
    { wch: 34 }, // Email
    { wch: 24 }, // Department
    { wch: 26 }, // Designation
    { wch: 18 }, // Type
    { wch: 12 }, // Gender
    { wch: 16 }, // DOB
    { wch: 14 }, // Blood Group
    { wch: 45 }, // Address
    { wch: 16 }, // Joining Date
    { wch: 24 }, // Bank Name
    { wch: 22 }, // Account No
    { wch: 16 }, // IFSC
    { wch: 18 }, // UAN
    { wch: 18 }  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Employee Upload Template');

  // Sheet 2: Master Data Reference
  const guideHeaders = ['Department Code', 'Department Name', 'Approved Designations'];
  const guideRows = [
    ['DEP001', 'Housekeeping', 'Housekeeping Attendant, Housekeeping Supervisor, Floor Specialist'],
    ['DEP002', 'Security Services', 'Security Guard, Security Supervisor, Armed Guard, Patrol Officer'],
    ['DEP003', 'Electro-Mechanical', 'HVAC Technician, Electrical Technician, Plumber, BMS Operator'],
    ['DEP004', 'Horticulture', 'Gardener / Horticulturist, Landscaping Supervisor'],
    ['DEP005', 'Administration', 'Admin Executive, Facility Coordinator, Store Incharge'],
    ['DEP006', 'Guest House Management', 'Guest House Caretaker, Front Desk Assistant, Chef']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 26 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Departments & Roles Guide');

  return wb;
}

// Write to disk
const clientWb = createClientTemplate();
const employeeWb = createEmployeeTemplate();

const targetDirs = [
  path.join(__dirname, 'platform', 'packages', 'mock-data', 'templates'),
  path.join(__dirname, 'platform', 'apps', 'operations-panel', 'public', 'templates'),
  path.join(__dirname, 'platform', 'apps', 'super-admin', 'public', 'templates'),
  path.join(__dirname, 'platform', 'apps', 'hr-panel', 'public', 'templates')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  XLSX.writeFile(clientWb, path.join(dir, 'Client_Bulk_Upload_Template.xlsx'));
  XLSX.writeFile(employeeWb, path.join(dir, 'Employee_Bulk_Upload_Template.xlsx'));
  console.log('Wrote templates to:', dir);
}

console.log('Successfully generated all Excel templates!');
