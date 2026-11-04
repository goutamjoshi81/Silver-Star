// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CENTRALIZED MOCK DATA
// ALL DEMO DATA LIVES HERE. Replace with API calls in Phase 2.
// ============================================================

export interface Company {
  name: string;
  shortName: string;
  tagline: string;
  founder: string;
  founderRole: string;
  founderPhone1: string;
  founderPhone2: string;
  website: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  cin: string;
}

export const COMPANY: Company = {
  name: "Silver Star Facility Management Pvt. Ltd.",
  shortName: "Silver Star",
  tagline: "Your True Business Partners",
  founder: "Ashok Majjige",
  founderRole: "CEO & Founder",
  founderPhone1: "+91 9620000494",
  founderPhone2: "+91 9620008783",
  website: "https://silverstarindia.net/",
  logo: "https://silverstarindia.net/wp-content/uploads/2024/08/sitelogo.png",
  email: "info@silverstarindia.net",
  phone: "+91 80 4123 4567",
  address: "Electronic City Phase II, Bangalore - 560100",
  gstin: "29AABCS1429B1ZB",
  cin: "U74999KA2014PTC075123",
};

export interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
}

export const BRANCHES: Branch[] = [
  { id: "BR001", name: "Bangalore HQ", city: "Bangalore", state: "Karnataka", active: true },
  { id: "BR002", name: "New Delhi Office", city: "New Delhi", state: "Delhi", active: true },
];

export interface Department {
  id: string;
  name: string;
  code: string;
}

export const DEPARTMENTS: Department[] = [
  { id: "DEP001", name: "Housekeeping", code: "HK" },
  { id: "DEP002", name: "Security Services", code: "SEC" },
  { id: "DEP003", name: "Electro-Mechanical", code: "EM" },
  { id: "DEP004", name: "Horticulture", code: "HOR" },
  { id: "DEP005", name: "Administration", code: "ADMIN" },
  { id: "DEP006", name: "Guest House Management", code: "GHM" },
];

export interface Designation {
  id: string;
  name: string;
  departmentId: string;
}

export const DESIGNATIONS: Designation[] = [
  { id: "DES001", name: "Security Guard", departmentId: "DEP002" },
  { id: "DES002", name: "Security Supervisor", departmentId: "DEP002" },
  { id: "DES003", name: "Housekeeping Attendant", departmentId: "DEP001" },
  { id: "DES004", name: "Housekeeping Supervisor", departmentId: "DEP001" },
  { id: "DES005", name: "HVAC Technician", departmentId: "DEP003" },
  { id: "DES006", name: "Electrical Technician", departmentId: "DEP003" },
  { id: "DES007", name: "Plumber", departmentId: "DEP003" },
  { id: "DES008", name: "Admin Executive", departmentId: "DEP005" },
];

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractStart: string;
  contractEnd: string;
  status: "Active" | "Pending" | "Expired" | "Terminated";
  sites: string[];
  portalUsername: string;
  monthlyBilling?: number;
  servicesProvided?: string[];
}

export const CLIENTS: Client[] = [
  {
    id: "CLI001",
    name: "InfoSys Tech Park",
    contactPerson: "Rajesh Sharma",
    email: "rajesh.sharma@infosys.com",
    phone: "+91 80 2234 5678",
    address: "Electronics City, Bangalore",
    contractStart: "2024-01-01",
    contractEnd: "2025-12-31",
    status: "Active",
    sites: ["SITE001", "SITE002"],
    portalUsername: "infosys_client",
    monthlyBilling: 380000,
    servicesProvided: ["Security Services", "Housekeeping", "Electro-Mechanical"],
  },
  {
    id: "CLI002",
    name: "MedPlus Pharma Campus",
    contactPerson: "Priya Menon",
    email: "priya.menon@medplus.com",
    phone: "+91 80 3344 5566",
    address: "Whitefield, Bangalore",
    contractStart: "2024-03-01",
    contractEnd: "2026-02-28",
    status: "Active",
    sites: ["SITE003"],
    portalUsername: "medplus_client",
    monthlyBilling: 210000,
    servicesProvided: ["Housekeeping", "Waste Management"],
  },
  {
    id: "CLI003",
    name: "DLF Corporate Tower",
    contactPerson: "Arun Kumar",
    email: "arun.kumar@dlf.com",
    phone: "+91 11 4455 6677",
    address: "Sector 25, Gurugram",
    contractStart: "2023-06-01",
    contractEnd: "2025-05-31",
    status: "Active",
    sites: ["SITE004"],
    portalUsername: "dlf_client",
    monthlyBilling: 195000,
    servicesProvided: ["Security Services", "HVAC AMC"],
  },
];

export interface Site {
  id: string;
  name: string;
  clientId: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // in meters
  sanctionedStrength: number;
  status: "Active" | "Inactive";
  supervisorId: string;
}

export const SITES: Site[] = [
  {
    id: "SITE001",
    name: "InfoSys - Block A",
    clientId: "CLI001",
    address: "Electronics City Phase 1, Bangalore",
    latitude: 12.8456,
    longitude: 77.6603,
    geofenceRadius: 100,
    sanctionedStrength: 12,
    status: "Active",
    supervisorId: "EMP003",
  },
  {
    id: "SITE002",
    name: "InfoSys - Block B",
    clientId: "CLI001",
    address: "Electronics City Phase 2, Bangalore",
    latitude: 12.8421,
    longitude: 77.6611,
    geofenceRadius: 75,
    sanctionedStrength: 8,
    status: "Active",
    supervisorId: "EMP003",
  },
  {
    id: "SITE003",
    name: "MedPlus Main Campus",
    clientId: "CLI002",
    address: "Whitefield, Bangalore",
    latitude: 12.9698,
    longitude: 77.7499,
    geofenceRadius: 150,
    sanctionedStrength: 10,
    status: "Active",
    supervisorId: "EMP007",
  },
  {
    id: "SITE004",
    name: "DLF Tower - Zone 1",
    clientId: "CLI003",
    address: "Sector 25, Gurugram",
    latitude: 28.4595,
    longitude: 77.0266,
    geofenceRadius: 100,
    sanctionedStrength: 6,
    status: "Active",
    supervisorId: "EMP007",
  },
];

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  photo: string | null;
  dob: string;
  gender: "Male" | "Female" | "Other";
  maritalStatus: "Single" | "Married" | "Divorced";
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;
  departmentId: string;
  designationId: string;
  employmentType: "Permanent" | "Contract" | "Probation";
  joiningDate: string;
  onboardingStatus: "Approved" | "Pending" | "Rejected";
  kycStatus: "Verified" | "Pending" | "Rejected";
  kycMethod: "Aadhaar Secure QR" | "DigiLocker" | "Manual Physical" | null;
  deployedSiteId: string | null;
  deployedClientId: string | null;
  branchId: string;
  status: "Active" | "Inactive" | "On Leave";
  bankName: string;
  accountNumber: string;
  ifsc: string;
  pfNumber: string | null;
}

export const EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    employeeCode: "SS-10001",
    name: "Ramesh Kumar",
    photo: null,
    dob: "1990-05-15",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    email: "ramesh.k@silverstarindia.net",
    address: "12, MG Road, Bangalore - 560001",
    emergencyContact: { name: "Sunita Kumar", relation: "Wife", phone: "+91 98765 00001" },
    departmentId: "DEP002",
    designationId: "DES002",
    employmentType: "Permanent",
    joiningDate: "2022-03-01",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "Aadhaar Secure QR",
    deployedSiteId: "SITE001",
    deployedClientId: "CLI001",
    branchId: "BR001",
    status: "Active",
    bankName: "State Bank of India",
    accountNumber: "XXXX XXXX 4521",
    ifsc: "SBIN0001234",
    pfNumber: "KN/BN/0123456",
  },
  {
    id: "EMP002",
    employeeCode: "SS-10002",
    name: "Kavitha Rao",
    photo: null,
    dob: "1995-08-22",
    gender: "Female",
    maritalStatus: "Single",
    bloodGroup: "O+",
    phone: "+91 97654 32109",
    email: "kavitha.r@silverstarindia.net",
    address: "45, Brigade Road, Bangalore - 560025",
    emergencyContact: { name: "Mohan Rao", relation: "Father", phone: "+91 97654 00002" },
    departmentId: "DEP001",
    designationId: "DES003",
    employmentType: "Permanent",
    joiningDate: "2022-06-15",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "Aadhaar Secure QR",
    deployedSiteId: "SITE001",
    deployedClientId: "CLI001",
    branchId: "BR001",
    status: "Active",
    bankName: "HDFC Bank",
    accountNumber: "XXXX XXXX 7832",
    ifsc: "HDFC0002345",
    pfNumber: "KN/BN/0123457",
  },
  {
    id: "EMP003",
    employeeCode: "SS-10003",
    name: "Suresh Nair",
    photo: null,
    dob: "1985-11-10",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "A+",
    phone: "+91 96543 21098",
    email: "suresh.n@silverstarindia.net",
    address: "78, Indiranagar, Bangalore - 560038",
    emergencyContact: { name: "Latha Nair", relation: "Wife", phone: "+91 96543 00003" },
    departmentId: "DEP002",
    designationId: "DES002",
    employmentType: "Permanent",
    joiningDate: "2020-01-10",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "DigiLocker",
    deployedSiteId: "SITE002",
    deployedClientId: "CLI001",
    branchId: "BR001",
    status: "Active",
    bankName: "ICICI Bank",
    accountNumber: "XXXX XXXX 3341",
    ifsc: "ICIC0003456",
    pfNumber: "KN/BN/0123458",
  },
  {
    id: "EMP004",
    employeeCode: "SS-10004",
    name: "Meera Pillai",
    photo: null,
    dob: "1993-03-28",
    gender: "Female",
    maritalStatus: "Married",
    bloodGroup: "AB+",
    phone: "+91 95432 10987",
    email: "meera.p@silverstarindia.net",
    address: "23, Koramangala, Bangalore - 560034",
    emergencyContact: { name: "Vijay Pillai", relation: "Husband", phone: "+91 95432 00004" },
    departmentId: "DEP001",
    designationId: "DES004",
    employmentType: "Permanent",
    joiningDate: "2021-09-01",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "Aadhaar Secure QR",
    deployedSiteId: "SITE003",
    deployedClientId: "CLI002",
    branchId: "BR001",
    status: "Active",
    bankName: "Axis Bank",
    accountNumber: "XXXX XXXX 9812",
    ifsc: "UTIB0004567",
    pfNumber: "KN/BN/0123459",
  },
  {
    id: "EMP005",
    employeeCode: "SS-10005",
    name: "Anil Sharma",
    photo: null,
    dob: "1992-07-14",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "B-",
    phone: "+91 94321 09876",
    email: "anil.s@silverstarindia.net",
    address: "56, Jayanagar, Bangalore - 560041",
    emergencyContact: { name: "Ravi Sharma", relation: "Father", phone: "+91 94321 00005" },
    departmentId: "DEP003",
    designationId: "DES005",
    employmentType: "Contract",
    joiningDate: "2023-02-15",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "Aadhaar Secure QR",
    deployedSiteId: "SITE001",
    deployedClientId: "CLI001",
    branchId: "BR001",
    status: "Active",
    bankName: "Bank of Baroda",
    accountNumber: "XXXX XXXX 5523",
    ifsc: "BARB0005678",
    pfNumber: "KN/BN/0123460",
  },
  {
    id: "EMP006",
    employeeCode: "SS-10006",
    name: "Deepa Krishnan",
    photo: null,
    dob: "1997-12-05",
    gender: "Female",
    maritalStatus: "Single",
    bloodGroup: "O-",
    phone: "+91 93210 98765",
    email: "deepa.k@silverstarindia.net",
    address: "89, HSR Layout, Bangalore - 560102",
    emergencyContact: { name: "Rajan Krishnan", relation: "Father", phone: "+91 93210 00006" },
    departmentId: "DEP001",
    designationId: "DES003",
    employmentType: "Permanent",
    joiningDate: "2024-01-20",
    onboardingStatus: "Pending",
    kycStatus: "Pending",
    kycMethod: null,
    deployedSiteId: null,
    deployedClientId: null,
    branchId: "BR001",
    status: "Active",
    bankName: "Canara Bank",
    accountNumber: "XXXX XXXX 7741",
    ifsc: "CNRB0006789",
    pfNumber: null,
  },
  {
    id: "EMP007",
    employeeCode: "SS-10007",
    name: "Mohammad Irfan",
    photo: null,
    dob: "1988-04-19",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "A-",
    phone: "+91 92109 87654",
    email: "m.irfan@silverstarindia.net",
    address: "12, Shivajinagar, Bangalore - 560001",
    emergencyContact: { name: "Farzana Irfan", relation: "Wife", phone: "+91 92109 00007" },
    departmentId: "DEP002",
    designationId: "DES002",
    employmentType: "Permanent",
    joiningDate: "2019-08-01",
    onboardingStatus: "Approved",
    kycStatus: "Verified",
    kycMethod: "DigiLocker",
    deployedSiteId: "SITE004",
    deployedClientId: "CLI003",
    branchId: "BR002",
    status: "Active",
    bankName: "Punjab National Bank",
    accountNumber: "XXXX XXXX 2231",
    ifsc: "PUNB0007890",
    pfNumber: "DL/DL/0234561",
  },
];

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMins: number;
}

export const SHIFTS: Shift[] = [
  { id: "SHF001", name: "Morning Shift", startTime: "06:00", endTime: "14:00", gracePeriodMins: 15 },
  { id: "SHF002", name: "Day Shift", startTime: "09:00", endTime: "18:00", gracePeriodMins: 15 },
  { id: "SHF003", name: "Evening Shift", startTime: "14:00", endTime: "22:00", gracePeriodMins: 15 },
  { id: "SHF004", name: "Night Shift", startTime: "22:00", endTime: "06:00", gracePeriodMins: 15 },
];

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  siteId: string;
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  status: "Present" | "Absent" | "Late" | "Half Day";
  gpsVerified: boolean;
}

export const ATTENDANCE_TODAY: AttendanceRecord[] = [
  { id: "ATT001", employeeId: "EMP001", siteId: "SITE001", date: "2026-11-02", punchIn: "08:52", punchOut: null, status: "Present", gpsVerified: true },
  { id: "ATT002", employeeId: "EMP002", siteId: "SITE001", date: "2026-11-02", punchIn: "09:01", punchOut: null, status: "Present", gpsVerified: true },
  { id: "ATT003", employeeId: "EMP003", siteId: "SITE002", date: "2026-11-02", punchIn: "08:45", punchOut: null, status: "Present", gpsVerified: true },
  { id: "ATT004", employeeId: "EMP004", siteId: "SITE003", date: "2026-11-02", punchIn: null, punchOut: null, status: "Absent", gpsVerified: false },
  { id: "ATT005", employeeId: "EMP005", siteId: "SITE001", date: "2026-11-02", punchIn: "09:22", punchOut: null, status: "Late", gpsVerified: true },
  { id: "ATT006", employeeId: "EMP007", siteId: "SITE004", date: "2026-11-02", punchIn: "08:58", punchOut: null, status: "Present", gpsVerified: true },
];

export const ATTENDANCE_HISTORY: AttendanceRecord[] = [
  ...ATTENDANCE_TODAY,
  { id: "ATT101", employeeId: "EMP001", siteId: "SITE001", date: "2026-11-01", punchIn: "08:50", punchOut: "17:10", status: "Present", gpsVerified: true },
  { id: "ATT102", employeeId: "EMP001", siteId: "SITE001", date: "2026-10-31", punchIn: "08:55", punchOut: "17:05", status: "Present", gpsVerified: true },
  { id: "ATT103", employeeId: "EMP001", siteId: "SITE001", date: "2026-10-30", punchIn: "08:48", punchOut: "17:02", status: "Present", gpsVerified: true },
  { id: "ATT104", employeeId: "EMP001", siteId: "SITE001", date: "2026-10-29", punchIn: "09:18", punchOut: "17:00", status: "Late", gpsVerified: true },
  { id: "ATT105", employeeId: "EMP002", siteId: "SITE001", date: "2026-11-01", punchIn: "08:59", punchOut: "17:03", status: "Present", gpsVerified: true },
  { id: "ATT106", employeeId: "EMP003", siteId: "SITE002", date: "2026-11-01", punchIn: "08:40", punchOut: "17:15", status: "Present", gpsVerified: true },
  { id: "ATT107", employeeId: "EMP004", siteId: "SITE003", date: "2026-11-01", punchIn: "09:05", punchOut: "17:01", status: "Present", gpsVerified: true },
];

export const DASHBOARD_KPIS = {
  totalActiveEmployees: 7,
  newRegistrationsMTD: 2,
  kycPending: 1,
  employeesDeployed: 6,
  employeesNotDeployed: 1,
  presentToday: 5,
  absentToday: 1,
  activeClientContracts: 3,
  activeWorkLocations: 4,
  pendingComplaints: 2,
  pendingApprovals: 3,
  monthlyManpowerCost: 485000,
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error" | "info" | "success";
  time: string;
  read: boolean;
}

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "NOT001", title: "KYC Pending", message: "Deepa Krishnan's KYC verification is pending for 3 days.", type: "warning", time: "2h ago", read: false },
  { id: "NOT002", title: "Staff Shortage", message: "MedPlus Main Campus is 2 staff below sanctioned strength today.", type: "error", time: "4h ago", read: false },
  { id: "NOT003", title: "Contract Renewal", message: "DLF Corporate Tower contract expires in 30 days.", type: "info", time: "1d ago", read: true },
  { id: "NOT004", title: "New Registration", message: "New employee registration submitted by HR for review.", type: "info", time: "2d ago", read: true },
];

export interface Incident {
  id: string;
  title: string;
  siteId: string;
  category: "Security" | "Maintenance" | "Housekeeping" | "Safety";
  priority: "High" | "Medium" | "Low";
  reportedBy: string;
  reportedAt: string;
  status: "Open" | "In Progress" | "Resolved";
  description: string;
}

export const INCIDENTS: Incident[] = [
  { id: "INC001", title: "Unauthorized Entry Attempt", siteId: "SITE001", category: "Security", priority: "High", reportedBy: "EMP001", reportedAt: "2026-11-01 14:30", status: "Open", description: "Unidentified individual attempted entry at Gate 2." },
  { id: "INC002", title: "Equipment Malfunction", siteId: "SITE003", category: "Maintenance", priority: "Medium", reportedBy: "EMP004", reportedAt: "2026-11-01 10:15", status: "In Progress", description: "HVAC unit in Block B showing error codes." },
];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "HR Executive" | "Operations Manager" | "Corporate Client" | "Supervisor";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export const USER_ACCOUNTS: UserAccount[] = [
  { id: "USR001", name: "Admin User", email: "admin@silverstarindia.net", role: "Super Admin", status: "Active", lastLogin: "2026-11-02 09:00" },
  { id: "USR002", name: "HR Manager", email: "hr@silverstarindia.net", role: "HR Executive", status: "Active", lastLogin: "2026-11-02 08:45" },
  { id: "USR003", name: "Ops Manager", email: "ops@silverstarindia.net", role: "Operations Manager", status: "Active", lastLogin: "2026-11-02 08:30" },
  { id: "USR004", name: "InfoSys Client", email: "rajesh.sharma@infosys.com", role: "Corporate Client", status: "Active", lastLogin: "2026-11-01 17:00" },
];

export interface DailyWorkReport {
  id: string;
  siteId: string;
  date: string;
  submittedBy: string;
  status: "Approved" | "Pending" | "Rejected";
  summary: string;
  consumables: string;
}

export const DAILY_WORK_REPORTS: DailyWorkReport[] = [
  { id: "DWR001", siteId: "SITE001", date: "2026-11-01", submittedBy: "EMP003", status: "Approved", summary: "All areas cleaned. CCTV operational. No incidents.", consumables: "Phenyl 2L, Detergent 500g" },
  { id: "DWR002", siteId: "SITE002", date: "2026-11-01", submittedBy: "EMP003", status: "Pending", summary: "Morning shift completed. Afternoon pending.", consumables: "Phenyl 1L" },
];

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: "Aadhaar Card" | "PAN Card" | "Police Verification" | "Bank Passbook" | "Medical Fitness";
  fileName: string;
  uploadDate: string;
  status: "Approved" | "Pending" | "Rejected";
  fileUrl: string;
}

export const EMPLOYEE_DOCUMENTS: EmployeeDocument[] = [
  { id: "DOC001", employeeId: "EMP001", documentType: "Aadhaar Card", fileName: "aadhaar_ramesh.pdf", uploadDate: "2022-03-01", status: "Approved", fileUrl: "#" },
  { id: "DOC002", employeeId: "EMP001", documentType: "Police Verification", fileName: "police_cert_ramesh.pdf", uploadDate: "2022-03-05", status: "Approved", fileUrl: "#" },
  { id: "DOC003", employeeId: "EMP002", documentType: "Aadhaar Card", fileName: "aadhaar_kavitha.pdf", uploadDate: "2022-06-15", status: "Approved", fileUrl: "#" },
  { id: "DOC004", employeeId: "EMP006", documentType: "Aadhaar Card", fileName: "deepa_aadhaar_scan.jpg", uploadDate: "2024-01-20", status: "Pending", fileUrl: "#" },
  { id: "DOC005", employeeId: "EMP006", documentType: "PAN Card", fileName: "deepa_pan.pdf", uploadDate: "2024-01-20", status: "Pending", fileUrl: "#" },
];

export interface ContractBilling {
  id: string;
  clientId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  billingFrequency: "Monthly" | "Quarterly";
  totalValue: number;
  monthlyAmount: number;
  status: "Active" | "Expiring Soon" | "Expired";
  lastInvoiceDate: string;
  lastInvoiceStatus: "Paid" | "Pending" | "Overdue";
}

export const CONTRACT_BILLINGS: ContractBilling[] = [
  {
    id: "CON001",
    clientId: "CLI001",
    contractNumber: "SS-INF-2024-01",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    billingFrequency: "Monthly",
    totalValue: 9120000,
    monthlyAmount: 380000,
    status: "Active",
    lastInvoiceDate: "2026-10-31",
    lastInvoiceStatus: "Paid",
  },
  {
    id: "CON002",
    clientId: "CLI002",
    contractNumber: "SS-MED-2024-03",
    startDate: "2024-03-01",
    endDate: "2026-02-28",
    billingFrequency: "Monthly",
    totalValue: 5040000,
    monthlyAmount: 210000,
    status: "Active",
    lastInvoiceDate: "2026-10-31",
    lastInvoiceStatus: "Pending",
  },
  {
    id: "CON003",
    clientId: "CLI003",
    contractNumber: "SS-DLF-2023-06",
    startDate: "2023-06-01",
    endDate: "2025-05-31",
    billingFrequency: "Monthly",
    totalValue: 4680000,
    monthlyAmount: 195000,
    status: "Expiring Soon",
    lastInvoiceDate: "2026-10-31",
    lastInvoiceStatus: "Paid",
  },
];

// Login credentials for demo
export const DEMO_CREDENTIALS = {
  superAdmin: { username: "admin", password: "admin123", role: "Super Admin" },
  hr: { username: "hr", password: "hr123", role: "HR Executive" },
  operations: { username: "ops", password: "ops123", role: "Operations Manager" },
  client: { username: "infosys_client", password: "client123", role: "Corporate Client", clientId: "CLI001" },
  employee: { employeeCode: "SS-10001", password: "emp123", employeeId: "EMP001" },
};
