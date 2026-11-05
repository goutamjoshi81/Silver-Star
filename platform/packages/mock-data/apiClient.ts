// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CENTRALIZED API CLIENT
// Connects frontend apps to backend PostgreSQL endpoints
// ============================================================

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) || (typeof window !== 'undefined' && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api');


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
      throw new Error(errBody.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
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
  getSites: (clientId?: string) =>
    request<any[]>(`/sites${clientId ? `?clientId=${clientId}` : ''}`),
  createSite: (siteData: any) =>
    request<any>('/sites', { method: 'POST', body: JSON.stringify(siteData) }),
  updateGeofence: (siteId: string, data: { latitude: number; longitude: number; geofenceRadius: number }) =>
    request<any>(`/sites/${siteId}/geofence`, { method: 'PUT', body: JSON.stringify(data) }),

  // Staff Deployments
  getDeployments: (params?: { siteId?: string; clientId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/deployments${q ? `?${q}` : ''}`);
  },
  createDeployment: (data: { siteId: string; clientId: string; employeeId: string; shiftId?: string; startDate?: string; deployedBy?: string }) =>
    request<any>('/deployments', { method: 'POST', body: JSON.stringify(data) }),
  relieveDeployment: (id: string) => request<any>(`/deployments/${id}`, { method: 'DELETE' }),

  // Attendance & GPS
  getAttendance: (params?: { date?: string; startDate?: string; endDate?: string; employeeId?: string; siteId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/attendance${q ? `?${q}` : ''}`);
  },
  punchAttendance: (data: { employeeId: string; siteId?: string; latitude?: number; longitude?: number }) =>
    request<{ success: boolean; gpsVerified: boolean; record: any }>('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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

