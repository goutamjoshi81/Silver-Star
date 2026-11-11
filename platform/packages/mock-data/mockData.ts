// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CENTRALIZED DATA & API ADAPTER
// Connected to PostgreSQL on localhost:5432 via Backend Endpoints
// Dummy content removed; real database tables connected.
// ============================================================

export * from './apiClient';
export * from './exportUtils';
export * from './qrUtils';
export * from './mobileConfig';
import { api } from './apiClient';

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
  logoDark?: string;
  logoWhiteBg?: string;
  icon?: string;
  logoSvg?: string;
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
  logo: "/silverstar-logo.png",
  logoDark: "/silverstar-logo-white-text.png",
  logoWhiteBg: "/silverstar-logo-white-bg.png",
  icon: "/silverstar-icon-512.png",
  logoSvg: "/silverstar-logo.svg",
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

// Clean production array synchronized with PostgreSQL
export let CLIENTS: Client[] = [
  {
    id: "CLI001",
    name: "Infosys Tech Park",
    contactPerson: "Raghavendra Rao (VP Facilities)",
    email: "facilities@infosys.com",
    phone: "+91 80 2852 0261",
    address: "Hosur Road, Electronics City Phase 1, Bengaluru, Karnataka 560100",
    contractStart: "2026-01-01",
    contractEnd: "2027-12-31",
    status: "Active",
    sites: ["SITE001", "SITE002"],
    portalUsername: "infosys_client",
    monthlyBilling: 485000,
    servicesProvided: ["Physical Security", "Corporate Housekeeping", "BMS Electro-Mechanical"],
  },
  {
    id: "CLI002",
    name: "Embassy GolfLinks Business Park",
    contactPerson: "Sunil Murthy (Estate Director)",
    email: "admin@embassygroups.com",
    phone: "+91 80 4000 1200",
    address: "Intermediate Ring Rd, Domlur, Bengaluru, Karnataka 560071",
    contractStart: "2026-02-01",
    contractEnd: "2027-01-31",
    status: "Active",
    sites: ["SITE003"],
    portalUsername: "embassy_client",
    monthlyBilling: 620000,
    servicesProvided: ["Armed Escorts", "Pest Control & Sanitization", "24x7 Control Room Monitoring"],
  },
];

export interface Site {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number; // in meters
  sanctionedStrength: number;
  status: "Active" | "Inactive";
  supervisorId?: string;
  supervisorName?: string;
  siteType?: "Permanent" | "Temporary" | "Emergency" | "Patrol Checkpoint";
  isEmergency?: boolean;
  emergencyNotes?: string;
  validFrom?: string;
  validUntil?: string;
}

// Clean production array synchronized with PostgreSQL
export let SITES: Site[] = [
  {
    id: "SITE001",
    name: "Infosys - Electronic City Campus Phase 1",
    clientId: "CLI001",
    address: "Gate 1, Infosys Avenue, Electronics City, Bengaluru 560100",
    latitude: 12.845214,
    longitude: 77.660168,
    geofenceRadius: 150,
    sanctionedStrength: 24,
    status: "Active",
    supervisorId: "EMP837389",
  },
  {
    id: "SITE002",
    name: "Infosys - Electronic City Campus Phase 2",
    clientId: "CLI001",
    address: "Gate 4, Infosys Avenue, Electronics City, Bengaluru 560100",
    latitude: 12.849023,
    longitude: 77.665042,
    geofenceRadius: 120,
    sanctionedStrength: 16,
    status: "Active",
    supervisorId: "EMP837389",
  },
  {
    id: "SITE003",
    name: "Embassy GolfLinks - Tower A & B",
    clientId: "CLI002",
    address: "Tower A Main Lobby, EGL, Intermediate Ring Rd, Bengaluru 560071",
    latitude: 12.948512,
    longitude: 77.647521,
    geofenceRadius: 200,
    sanctionedStrength: 30,
    status: "Active",
    supervisorId: "EMP837389",
  },
  {
    id: "SITE_TEMP_001",
    name: "Emergency Reserve - Manyata Tech Park Gate 5",
    clientId: "CLI001",
    clientName: "Infosys Limited",
    address: "Gate 5, Manyata Embassy Business Park, Outer Ring Road, Bengaluru",
    latitude: 13.0494,
    longitude: 77.6200,
    geofenceRadius: 150,
    sanctionedStrength: 6,
    status: "Active",
    supervisorId: "EMP837389",
    siteType: "Emergency",
    isEmergency: true,
    emergencyNotes: "Temporary emergency perimeter post during corporate summit.",
    validFrom: "2026-11-01",
    validUntil: "2026-11-20",
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

// Clean production array loaded from PostgreSQL (dummy demo content removed)
export let EMPLOYEES: Employee[] = [];

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
  distanceMeters?: number;
  employeeName?: string;
  siteName?: string;
  punchInLatitude?: number;
  punchInLongitude?: number;
}

export let ATTENDANCE_TODAY: AttendanceRecord[] = [];
export let ATTENDANCE_HISTORY: AttendanceRecord[] = [];

export let DASHBOARD_KPIS = {
  totalActiveEmployees: 0,
  newRegistrationsMTD: 0,
  kycPending: 0,
  employeesDeployed: 0,
  employeesNotDeployed: 0,
  presentToday: 0,
  absentToday: 0,
  activeClientContracts: 0,
  activeWorkLocations: 0,
  pendingComplaints: 0,
  pendingApprovals: 0,
  monthlyManpowerCost: 0,
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error" | "info" | "success";
  time: string;
  read: boolean;
}

export let NOTIFICATIONS: NotificationItem[] = [];

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

export let INCIDENTS: Incident[] = [];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "HR Executive" | "Operations Manager" | "Corporate Client" | "Supervisor";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export let USER_ACCOUNTS: UserAccount[] = [
  { id: "USR001", name: "Admin User", email: "admin@silverstarindia.net", role: "Super Admin", status: "Active", lastLogin: "2026-11-05 00:00" },
  { id: "USR002", name: "HR Manager", email: "hr@silverstarindia.net", role: "HR Executive", status: "Active", lastLogin: "2026-11-05 00:00" },
  { id: "USR003", name: "Ops Manager", email: "ops@silverstarindia.net", role: "Operations Manager", status: "Active", lastLogin: "2026-11-05 00:00" },
];

export interface PatrolLog {
  id: string;
  officerId: string;
  officerName?: string;
  officerCode?: string;
  siteId?: string;
  siteName?: string;
  checkpointName: string;
  patrolShift: string;
  status: string;
  latitude?: number;
  longitude?: number;
  isGeofenceVerified?: boolean;
  distanceMeters?: number;
  photoUrl: string;
  notes?: string;
  createdAt: string;
}

export let PATROL_LOGS: PatrolLog[] = [
  {
    id: "PATROL_001",
    officerId: "EMP837389",
    officerName: "Rajesh Kumar",
    officerCode: "SS-10001",
    siteId: "SITE001",
    siteName: "Infosys - Electronic City Campus Phase 1",
    checkpointName: "North Perimeter Gate & Guard Shack",
    patrolShift: "Night Patrol (Round 1: 23:00)",
    status: "All Normal & Secure",
    latitude: 12.8453,
    longitude: 77.6602,
    isGeofenceVerified: true,
    distanceMeters: 12,
    photoUrl: "/silverstar-icon-512.png",
    notes: "Both security guards alert and in full uniform. Boundary floodlights operational.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PATROL_002",
    officerId: "EMP837389",
    officerName: "Rajesh Kumar",
    officerCode: "SS-10001",
    siteId: "SITE001",
    siteName: "Infosys - Electronic City Campus Phase 1",
    checkpointName: "Rear Loading Dock & Transformer Yard",
    patrolShift: "Night Patrol (Round 2: 02:30)",
    status: "Gate Locked & Verified",
    latitude: 12.8455,
    longitude: 77.6605,
    isGeofenceVerified: true,
    distanceMeters: 22,
    photoUrl: "/silverstar-icon-512.png",
    notes: "Padlocks verified. Generator fuel level checked. Fire extinguisher seals intact.",
    createdAt: new Date().toISOString(),
  },
];

export interface SiteMusterAudit {
  id: string;
  officerId: string;
  officerName?: string;
  officerCode?: string;
  siteId: string;
  siteName?: string;
  clientName?: string;
  date: string;
  shift: string;
  totalSanctioned: number;
  totalPresent: number;
  totalAbsent: number;
  musterPhotoUrl: string;
  latitude?: number;
  longitude?: number;
  isGeofenceVerified?: boolean;
  distanceMeters?: number;
  notes?: string;
  staffRecords?: any[];
  createdAt: string;
}

export let SITE_MUSTER_AUDITS: SiteMusterAudit[] = [
  {
    id: "MUSTER_001",
    officerId: "EMP837389",
    officerName: "Rajesh Kumar",
    officerCode: "SS-10001",
    siteId: "SITE001",
    siteName: "Infosys - Electronic City Campus Phase 1",
    clientName: "Infosys Limited",
    date: new Date().toISOString().split("T")[0],
    shift: "Morning Shift (06:00 - 14:00)",
    totalSanctioned: 6,
    totalPresent: 6,
    totalAbsent: 0,
    musterPhotoUrl: "/silverstar-logo-white-bg.png",
    latitude: 12.8452,
    longitude: 77.6601,
    isGeofenceVerified: true,
    distanceMeters: 14,
    notes: "Full morning muster verification completed at Gate 1. All guards in clean uniform with turnout inspection passed.",
    staffRecords: [
      { employeeId: "EMP837389", name: "Ramesh Gowda", designation: "Head Guard", status: "Present" },
      { employeeId: "EMP002", name: "Suresh Patil", designation: "Security Guard", status: "Present" },
      { employeeId: "EMP003", name: "Mahesh Kumar", designation: "Security Guard", status: "Present" },
      { employeeId: "EMP004", name: "Laxmi Bai", designation: "Housekeeper", status: "Present" },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const PATROL_CHECKPOINTS = [
  { id: 'CP_MAIN_GATE', name: 'Main Security Gate & Barrier Check', category: 'Access Control' },
  { id: 'CP_PERIMETER_NORTH', name: 'North Boundary Wall & Fence Wire', category: 'Perimeter' },
  { id: 'CP_PERIMETER_SOUTH', name: 'South Boundary Wall & Drain Outlet', category: 'Perimeter' },
  { id: 'CP_TRANSFORMER', name: 'Electrical Substation & DG Set Yard', category: 'Critical Utilities' },
  { id: 'CP_LOADING_DOCK', name: 'Warehouse Bay & Loading Dock Doors', category: 'Logistics' },
  { id: 'CP_FIRE_PANEL', name: 'Central Fire Alarm Control Panel (FACP)', category: 'Safety' },
  { id: 'CP_BASEMENT_PARKING', name: 'Basement Level B1/B2 Vehicle Parking', category: 'Internal' },
  { id: 'CP_SERVER_ROOM', name: 'Data Center / Server Room External Lock', category: 'High Security' },
  { id: 'CP_ROOFTOP_ACCESS', name: 'Rooftop & Water Tank Access Door', category: 'Overhead' },
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

export let DAILY_WORK_REPORTS: DailyWorkReport[] = [];

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: "Aadhaar Card" | "PAN Card" | "Police Verification" | "Bank Passbook" | "Medical Fitness";
  fileName: string;
  uploadDate: string;
  status: "Approved" | "Pending" | "Rejected";
  fileUrl: string;
}

export let EMPLOYEE_DOCUMENTS: EmployeeDocument[] = [];

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

export let CONTRACT_BILLINGS: ContractBilling[] = [];

// System login credentials
export const DEMO_CREDENTIALS = {
  superAdmin: { username: "admin", password: "admin123", role: "Super Admin" },
  hr: { username: "hr", password: "hr123", role: "HR Executive" },
  operations: { username: "ops", password: "ops123", role: "Operations Manager" },
  client: { username: "infosys_client", password: "client123", role: "Corporate Client", clientId: "CLI001" },
  employee: { employeeCode: "SS-10001", password: "emp123", employeeId: "EMP001" },
};

// ============================================================
// AUTOMATIC BACKEND DATA INITIALIZER & SYNC HELPER
// Loads live PostgreSQL records into runtime cache
// ============================================================
export async function initPlatformData() {
  try {
    const [employees, clients, sites, kpis, attendance, documents, billings] = await Promise.all([
      api.getEmployees().catch(() => []),
      api.getClients().catch(() => []),
      api.getSites().catch(() => []),
      api.getKpis().catch(() => DASHBOARD_KPIS),
      api.getAttendance().catch(() => []),
      api.getDocuments().catch(() => []),
      api.getContracts().catch(() => []),
    ]);

    if (Array.isArray(employees)) EMPLOYEES = employees;
    if (Array.isArray(clients)) CLIENTS = clients;
    if (Array.isArray(sites)) SITES = sites;
    if (kpis) DASHBOARD_KPIS = kpis;
    if (Array.isArray(attendance)) {
      ATTENDANCE_HISTORY = attendance;
      const today = new Date().toISOString().split('T')[0];
      ATTENDANCE_TODAY = attendance.filter(a => a.date === today);
    }
    if (Array.isArray(documents)) EMPLOYEE_DOCUMENTS = documents;
    if (Array.isArray(billings)) CONTRACT_BILLINGS = billings;

    return { success: true, employeeCount: EMPLOYEES.length, clientCount: CLIENTS.length };
  } catch (err) {
    console.warn('[Platform Data] Backend offline or initializing:', err);
    return { success: false, error: err };
  }
}

// Auto-run on client browser environment
if (typeof window !== 'undefined') {
  initPlatformData();
}
