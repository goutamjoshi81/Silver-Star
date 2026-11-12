// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CENTRALIZED API CLIENT
// Connects frontend apps to backend PostgreSQL endpoints
// ============================================================

const getApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000/api';
  if ((window as any).__API_BASE_URL__) return (window as any).__API_BASE_URL__;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  // When running inside native Capacitor mobile wrapper, reach host LAN IP
  const isCapacitor =
    typeof window !== 'undefined' &&
    ((window as any).Capacitor || window.location.protocol === 'capacitor:');
  if (isCapacitor) {
    return 'http://192.168.1.36:5000/api';
  }
  // In web browsers, connect directly to whatever host the user browsed
  // e.g. localhost -> localhost:5000, 192.168.1.36 -> 192.168.1.36:5000
  const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  return `http://${host}:5000/api`;
};

let API_BASE_URL = getApiBase();

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      const errorMsg = errBody.error || `Request failed with status ${res.status}`;
      const httpError = new Error(errorMsg);
      (httpError as any).status = res.status;
      (httpError as any).isHttpError = true;
      throw httpError;
    }

    return await res.json();
  } catch (err: any) {
    // If the server answered with an HTTP error status (400, 401, 403, 404, 422),
    // the server is active and explicitly rejected the credentials.
    // Do NOT loop through fallbacks as it causes a hanging spinner.
    if (err?.isHttpError || (err?.status && err.status >= 400 && err.status < 500)) {
      throw err;
    }

    // If connection completely failed (offline, network error or wrong IP), test candidate endpoints
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname || 'localhost';
      const candidateList = [
        `http://${currentHost}:5000/api`,
        'http://localhost:5000/api',
        'http://127.0.0.1:5000/api',
        'http://192.168.1.36:5000/api',
        'http://10.0.2.2:5000/api',
      ];
      const candidates = Array.from(new Set(candidateList)).filter(b => b !== API_BASE_URL);

      for (const fallbackBase of candidates) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);

          const fallbackRes = await fetch(`${fallbackBase}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(options?.headers || {}),
            },
            signal: controller.signal,
            ...options,
          });
          clearTimeout(timeoutId);

          if (fallbackRes.ok) {
            API_BASE_URL = fallbackBase;
            return await fallbackRes.json();
          } else if (fallbackRes.status >= 400 && fallbackRes.status < 500) {
            // Server was reached on this candidate, but returned client/auth error
            API_BASE_URL = fallbackBase;
            const errBody = await fallbackRes.json().catch(() => ({ error: fallbackRes.statusText }));
            const candidateHttpError = new Error(errBody.error || `Request failed with status ${fallbackRes.status}`);
            (candidateHttpError as any).status = fallbackRes.status;
            (candidateHttpError as any).isHttpError = true;
            throw candidateHttpError;
          }
        } catch (candidateErr: any) {
          if (candidateErr?.isHttpError || (candidateErr?.status && candidateErr.status >= 400 && candidateErr.status < 500)) {
            throw candidateErr;
          }
        }
      }
    }
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database: string }>('/health'),

  // Master Data
  getCompany: () => request<any>('/company'),
  getBranches: () => request<any[]>('/branches'),
  getDepartments: () => request<any[]>('/departments'),
  getDesignations: (departmentId?: string) =>
    request<any[]>(`/designations${departmentId ? `?departmentId=${departmentId}` : ''}`),
  getShifts: () => request<any[]>('/shifts'),

  // Auth & Users
  login: (credentials: { username?: string; email?: string; password?: string; employeeCode?: string }) =>
    request<{ success: boolean; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getUsers: () => request<any[]>('/auth/users'),
  createUser: (data: any) => request<any>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request<any>(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request<any>(`/auth/users/${id}`, { method: 'DELETE' }),

  // Employees & Onboarding
  getEmployees: (params?: { departmentId?: string; status?: string; onboardingStatus?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/employees${q ? `?${q}` : ''}`);
  },
  getEmployee: (id: string) => request<any>(`/employees/${id}`),
  createEmployee: (employeeData: any) =>
    request<any>('/employees', { method: 'POST', body: JSON.stringify(employeeData) }),
  bulkCreateEmployees: (employees: any[]) =>
    request<{ success: boolean; count: number; inserted: any[]; errors?: any[] }>('/employees/bulk', {
      method: 'POST',
      body: JSON.stringify(employees),
    }),
  updateEmployee: (id: string, employeeData: any) =>
    request<any>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employeeData) }),
  deleteEmployee: (id: string) => request<any>(`/employees/${id}`, { method: 'DELETE' }),

  // Clients & Sites
  getClients: () => request<any[]>('/clients'),
  createClient: (clientData: any) =>
    request<any>('/clients', { method: 'POST', body: JSON.stringify(clientData) }),
  bulkCreateClients: (clients: any[]) =>
    request<{ success: boolean; count: number; inserted: any[]; errors?: any[] }>('/clients/bulk', {
      method: 'POST',
      body: JSON.stringify(clients),
    }),
  getSites: (clientId?: string, options?: { siteType?: string; isEmergency?: boolean }) => {
    const p: any = {};
    if (clientId) p.clientId = clientId;
    if (options?.siteType) p.siteType = options.siteType;
    if (options?.isEmergency !== undefined) p.isEmergency = options.isEmergency;
    const q = new URLSearchParams(p).toString();
    return request<any[]>(`/sites${q ? `?${q}` : ''}`);
  },
  createSite: (siteData: any) =>
    request<any>('/sites', { method: 'POST', body: JSON.stringify(siteData) }),
  createEmergencyGeofence: (data: {
    name: string;
    clientId: string;
    address?: string;
    latitude: number;
    longitude: number;
    geofenceRadius?: number;
    sanctionedStrength?: number;
    emergencyNotes?: string;
    validFrom?: string;
    validUntil?: string;
  }) =>
    request<any>('/sites', {
      method: 'POST',
      body: JSON.stringify({ ...data, isEmergency: true, siteType: 'Emergency' }),
    }),
  getDeployedStaff: (siteId: string) =>
    request<any[]>(`/sites/${siteId}/deployed-staff`),
  updateGeofence: (siteId: string, data: { latitude: number; longitude: number; geofenceRadius: number; siteType?: string; isEmergency?: boolean; emergencyNotes?: string; validUntil?: string }) =>
    request<any>(`/sites/${siteId}/geofence`, { method: 'PUT', body: JSON.stringify(data) }),

  // Staff Deployments
  getDeployments: (params?: { siteId?: string; clientId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/deployments${q ? `?${q}` : ''}`);
  },
  createDeployment: (data: { siteId: string; clientId: string; employeeId: string; shiftId?: string; startDate?: string; deployedBy?: string }) =>
    request<any>('/deployments', { method: 'POST', body: JSON.stringify(data) }),
  relieveDeployment: (id: string) => request<any>(`/deployments/${id}`, { method: 'DELETE' }),
  uploadStaffExcel: (data: { clientId: string; siteId: string; officerId?: string; staff: any[] }) =>
    request<{ success: boolean; count: number; siteId: string; siteName: string; clientId: string; clientName: string; officerId?: string; staff: any[]; message: string }>(
      '/deployments/bulk-excel',
      { method: 'POST', body: JSON.stringify(data) }
    ),
  assignClientToOfficer: (data: { officerId: string; clientId: string; siteId: string; shift?: string; notes?: string }) =>
    request<{ success: boolean; message: string; officerId: string; siteId: string; clientId: string }>(
      '/deployments/assign-officer',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // Attendance & GPS
  getAttendance: (params?: { date?: string; startDate?: string; endDate?: string; employeeId?: string; siteId?: string; clientId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/attendance${q ? `?${q}` : ''}`);
  },
  getTodayAttendance: (employeeId: string) =>
    request<{ hasPunchedIn: boolean; hasPunchedOut: boolean; punchIn: string | null; punchOut: string | null; date: string; status?: string; gpsVerified?: boolean; siteName?: string; record?: any }>(
      `/attendance/today/${encodeURIComponent(employeeId)}`
    ),
  punchAttendance: (data: {
    employeeId?: string;
    employeeCode?: string;
    siteId?: string;
    latitude?: number;
    longitude?: number;
    punchType?: 'IN' | 'OUT';
    accuracy?: number;
    selfieUrl?: string;
  }) =>
    request<{
      success: boolean;
      action?: string;
      time?: string;
      gpsVerified: boolean;
      distanceMeters?: number;
      geofenceRadius?: number;
      siteName?: string;
      record: any;
    }>('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Field Officer Site Muster & Frontline Roll-Call
  submitFieldMuster: (data: {
    officerId: string;
    siteId: string;
    shift?: string;
    latitude?: number;
    longitude?: number;
    musterPhotoUrl: string;
    staffStatuses: Array<{ employeeId: string; status: 'Present' | 'Absent' | 'Late' | 'Reliever'; notes?: string }>;
    notes?: string;
  }) =>
    request<{
      success: boolean;
      auditId: string;
      siteName: string;
      date: string;
      time: string;
      totalSanctioned: number;
      totalPresent: number;
      totalAbsent: number;
      isGeofenceVerified: boolean;
      distanceMeters?: number;
      audit: any;
    }>('/attendance/field-muster', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFieldMusterAudits: (params?: { siteId?: string; date?: string; officerId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/attendance/field-muster${q ? `?${q}` : ''}`);
  },

  // Night Patrolling & Checkpoint Inspection with Photo
  getPatrolLogs: (params?: { siteId?: string; officerId?: string; date?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/patrols${q ? `?${q}` : ''}`);
  },
  submitPatrolLog: (data: {
    officerId: string;
    siteId?: string;
    checkpointName: string;
    patrolShift?: string;
    status?: string;
    latitude?: number;
    longitude?: number;
    photoUrl: string;
    notes?: string;
  }) =>
    request<{
      success: boolean;
      id: string;
      siteName: string;
      isGeofenceVerified: boolean;
      distanceMeters?: number;
      patrolLog: any;
    }>('/patrols', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPatrolCheckpoints: () => request<any[]>('/patrols/checkpoints'),
  getPatrolAssignments: (params?: { officerId?: string; date?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/patrols/assignments${q ? `?${q}` : ''}`);
  },
  createPatrolAssignment: (data: {
    officerId: string;
    clientId?: string;
    siteId?: string;
    locationType?: 'client' | 'custom';
    locationName: string;
    address: string;
    latitude?: number;
    longitude?: number;
    geofenceRadius?: number;
    checkpointName: string;
    shift?: string;
    instructions?: string;
  }) =>
    request<{ success: boolean; message: string; assignment: any }>('/patrols/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOfficerDuties: (officerId: string) =>
    request<{
      officerId: string;
      officerName: string;
      officerCode: string;
      assignedClients: any[];
      assignedPatrols: any[];
      totalDutiesCount: number;
    }>(`/attendance/officer-duties/${encodeURIComponent(officerId)}`),

  // Employee Documents & Review
  getDocuments: (params?: { status?: string; employeeId?: string; documentType?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/documents${q ? `?${q}` : ''}`);
  },
  uploadDocument: (data: { employeeId: string; documentType: string; fileName: string; fileUrl?: string }) =>
    request<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
  reviewDocument: (id: string, status: 'Approved' | 'Rejected', reason?: string) =>
    request<any>(`/documents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason: reason }),
    }),

  // Billing & GST Invoices
  getContracts: (params?: { clientId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/billing/contracts${q ? `?${q}` : ''}`);
  },
  createContract: (data: any) => request<any>('/billing/contracts', { method: 'POST', body: JSON.stringify(data) }),
  getInvoices: (params?: { clientId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/billing/invoices${q ? `?${q}` : ''}`);
  },
  createInvoice: (data: {
    clientId: string;
    contractId?: string;
    subtotal: number;
    isInterstate?: boolean;
    dueDate?: string;
    gstBillFileUrl?: string;
  }) => request<any>('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),

  // Daily Work Reports & Incidents
  getDailyReports: (params?: { date?: string; startDate?: string; endDate?: string; siteId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/reports/daily${q ? `?${q}` : ''}`);
  },
  createDailyReport: (data: any) => request<any>('/reports/daily', { method: 'POST', body: JSON.stringify(data) }),
  getIncidents: (params?: { siteId?: string; status?: string; priority?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/reports/incidents${q ? `?${q}` : ''}`);
  },
  createIncident: (data: any) => request<any>('/reports/incidents', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard KPIs & Notifications
  getKpis: () => request<any>('/dashboard/kpis'),
  getNotifications: (role?: string) =>
    request<any[]>(`/dashboard/notifications${role ? `?role=${role}` : ''}`),
};

