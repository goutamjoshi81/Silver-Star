import { useState, useEffect } from 'react'
import {
  api,
  downloadEmployeeTemplate,
  downloadEmployeeExcelTemplate,
  parseSpreadsheetFile,
  mapEmployeeCsvRows,
  exportToCorporateExcel,
  exportToCorporatePdf,
  type CorporateExportOptions,
} from '@mock/mockData'
import {
  Users,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  FileDown,
  Shield,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Lock,
  ShieldAlert,
} from 'lucide-react'

export default function OpsEmployees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'FIELD_OFFICER' | 'STANDARD'>('ALL')
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: boolean; count: number; message: string } | null>(null)

  // Grant Field Officer App Access Modal State
  const [selectedEmpForGrant, setSelectedEmpForGrant] = useState<any | null>(null)
  const [grantForm, setGrantForm] = useState({
    username: '',
    email: '',
    password: 'Silverstar@123',
    role: 'Operations Manager',
    updateDesignation: true,
  })
  const [grantingAccess, setGrantingAccess] = useState(false)
  const [credentialsResult, setCredentialsResult] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text })
    setTimeout(() => setActionMsg(null), 5000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [empData, deptData] = await Promise.all([
        api.getEmployees(),
        api.getDepartments(),
      ])
      setEmployees(empData || [])
      setDepartments(deptData || [])
    } catch (err) {
      console.error('Failed to load operational staff data:', err)
      showNotification('error', 'Error loading staff records from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Open Grant Modal
  const handleOpenGrantModal = (emp: any) => {
    const defaultEmail = emp.email || `${(emp.employeeCode || 'emp').toLowerCase().replace(/[^a-z0-9]/g, '')}@silverstarindia.net`
    setSelectedEmpForGrant(emp)
    setGrantForm({
      username: emp.employeeCode || emp.name,
      email: defaultEmail,
      password: 'Silverstar@123',
      role: 'Supervisor',
      updateDesignation: true,
    })
  }

  // Submit Grant Access to Backend
  const handleConfirmGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpForGrant) return

    setGrantingAccess(true)
    try {
      const res = await api.grantFieldOfficerAccess(selectedEmpForGrant.id, grantForm)
      showNotification('success', res.message || `Field Officer application access granted to ${selectedEmpForGrant.name}`)
      setCredentialsResult(res.credentials || {
        employeeCode: selectedEmpForGrant.employeeCode,
        name: selectedEmpForGrant.name,
        loginIdentifier: selectedEmpForGrant.employeeCode,
        loginEmail: grantForm.email,
        role: grantForm.role,
        status: 'Active',
        defaultPassword: grantForm.password,
      })
      setSelectedEmpForGrant(null)
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to grant Field Officer application access.')
    } finally {
      setGrantingAccess(false)
    }
  }

  // Revoke Access
  const handleRevokeAccess = async (emp: any) => {
    if (!confirm(`Are you sure you want to revoke Field Officer application access for ${emp.name} (${emp.employeeCode})? They will no longer be able to log in to the Mobile App or Operations Console.`)) {
      return
    }

    try {
      const res = await api.revokeFieldOfficerAccess(emp.id)
      showNotification('success', res.message || `Field Officer application access revoked for ${emp.name}`)
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to revoke application access.')
    }
  }

  // Copy Credentials
  const handleCopyCredentials = () => {
    if (!credentialsResult) return
    const text = `Silver Star Field Officer Application Access:\nName: ${credentialsResult.name}\nBadge / Login ID: ${credentialsResult.loginIdentifier || credentialsResult.employeeCode}\nEmail: ${credentialsResult.loginEmail}\nPassword: ${credentialsResult.defaultPassword}\nRole: ${credentialsResult.role}\nPortal URL: http://129.121.170.111/ops-admin`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  // Handle Spreadsheet (.xlsx / .csv) file selection for Bulk Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)
    setBulkResult(null)

    try {
      const { rows } = await parseSpreadsheetFile(file)
      const mapped = mapEmployeeCsvRows(rows)
      setParsedRows(mapped)
    } catch (err: any) {
      alert(`Failed to parse file: ${err.message}`)
    }
  }

  // Submit Bulk Upload to Backend
  const handleConfirmBulkUpload = async () => {
    const validRows = parsedRows.filter(r => r.isValid)
    if (validRows.length === 0) {
      alert('No valid employee rows to upload. Please review errors.')
      return
    }

    setBulkUploading(true)
    try {
      const res = await api.bulkCreateEmployees(validRows)
      setBulkResult({
        success: true,
        count: res.count || validRows.length,
        message: `Successfully imported ${res.count || validRows.length} staff members to database.`,
      })
      await loadData()
    } catch (err: any) {
      setBulkResult({
        success: false,
        count: 0,
        message: `Bulk upload failed: ${err.message}`,
      })
    } finally {
      setBulkUploading(false)
    }
  }

  // Export report
  const handleExport = (format: 'excel' | 'pdf') => {
    const exportOpts: CorporateExportOptions = {
      title: 'Operations Workforce & Staff Roster Register',
      subtitle: 'Field Personnel, Duty Deployments & Statutory Compliance Registry',
      category: 'Operations Management',
      filterSummary: {
        Department: departmentFilter,
        Status: statusFilter,
        AppAccess: accessFilter,
        Search: search || 'All Workforce',
      },
      kpis: [
        { label: 'Total Workforce', value: employees.length },
        { label: 'Active on Duty', value: employees.filter(e => e.status === 'Active').length },
        { label: 'Field Officers with App Access', value: employees.filter(e => e.hasAppAccess || e.isFieldOfficer).length },
        { label: 'KYC Verified', value: employees.filter(e => e.kycStatus === 'Verified').length },
      ],
      columns: [
        { header: 'Employee Code', key: 'employeeCode' },
        { header: 'Full Name', key: 'name' },
        { header: 'Department', key: 'departmentName' },
        { header: 'Designation', key: 'designationName' },
        { header: 'App Access', key: 'appAccessStatus' },
        { header: 'Phone', key: 'phone' },
        { header: 'Deployment Site', key: 'siteName' },
        { header: 'KYC Status', key: 'kycStatus' },
        { header: 'Status', key: 'status' },
      ],
      data: filteredEmployees.map(e => ({
        ...e,
        appAccessStatus: e.hasAppAccess || e.isFieldOfficer ? 'Field Officer (Active)' : 'Standard Staff',
      })),
      filename: `SilverStar_Workforce_Register_${new Date().toISOString().split('T')[0]}`,
    }

    if (format === 'excel') exportToCorporateExcel(exportOpts)
    else exportToCorporatePdf(exportOpts)
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.employeeCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.phone || '').includes(search)
    const matchDept = departmentFilter === 'ALL' || emp.departmentId === departmentFilter || emp.departmentName === departmentFilter
    const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter
    
    const isOfficer = Boolean(emp.hasAppAccess || emp.isFieldOfficer)
    const matchAccess =
      accessFilter === 'ALL' ||
      (accessFilter === 'FIELD_OFFICER' && isOfficer) ||
      (accessFilter === 'STANDARD' && !isOfficer)

    return matchSearch && matchDept && matchStatus && matchAccess
  })

  const validBulkCount = parsedRows.filter(r => r.isValid).length
  const invalidBulkCount = parsedRows.length - validBulkCount
  const activeStaffCount = employees.filter(e => e.status === 'Active').length
  const verifiedKycCount = employees.filter(e => e.kycStatus === 'Verified').length
  const fieldOfficersAppCount = employees.filter(e => e.hasAppAccess || e.isFieldOfficer).length

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionMsg && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border shadow-sm transition-all ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-red-600" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Staff Strength</p>
            <p className="text-2xl font-bold text-[#202B75] mt-1">{employees.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">Registered Personnel</span>
          </div>
          <div className="p-3 bg-blue-50 text-[#202B75] rounded-xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Active On-Duty</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeStaffCount}</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">Ready for Deployment</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Field Officer Application Access Highlight Card */}
        <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-teal-50/40">
          <div>
            <p className="text-xs text-teal-800 font-bold uppercase tracking-wider">Field Officers (App Access)</p>
            <p className="text-2xl font-extrabold text-teal-700 mt-1">{fieldOfficersAppCount}</p>
            <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-flex items-center gap-1">
              <ShieldCheck size={13} /> Mobile & Web Access Granted
            </span>
          </div>
          <div className="p-3 bg-teal-100/80 text-teal-700 rounded-xl shadow-xs">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">KYC Compliance</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{verifiedKycCount}</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">Aadhaar QR Verified</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Enterprise Excel Bulk Onboarding Banner */}
      <div className="bg-gradient-to-r from-[#202B75] via-[#1a2360] to-[#0f172a] rounded-2xl p-5 text-white shadow-md border border-[#202B75]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold tracking-wide">
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>CORPORATE EXCEL STAFF ONBOARDING & ACCESS CONTROL</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Workforce Roster & Field Officer Application Access Control
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage operational staff roster, bulk upload workforce workbooks, and grant instant <strong>Field Officer application access</strong> to qualified supervisors for mobile roll-call muster, night patrols, and incident auditing.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-300 font-mono">
              <span className="text-slate-400">Features:</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">Batch Excel (.xlsx)</span>
              <span className="px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-200 font-semibold border border-teal-400/30">Grant Field Officer App Access</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">Auto Password & Credentials</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">Revoke Control</span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => downloadEmployeeExcelTemplate()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => downloadEmployeeTemplate()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Download CSV</span>
            </button>

            <button
              onClick={() => {
                setBulkFile(null)
                setParsedRows([])
                setBulkResult(null)
                setShowBulkModal(true)
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#26BCEE] hover:bg-[#1fa8d6] text-white text-xs font-bold rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Upload size={15} />
              <span>Upload Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by staff name, employee code, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
            />
          </div>

          {/* Filter by Field Officer App Access */}
          <div className="flex items-center gap-1.5 border border-teal-200 rounded-lg px-2.5 py-1.5 bg-teal-50/50">
            <Key size={14} className="text-teal-600" />
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value as any)}
              className="bg-transparent text-xs text-teal-900 outline-none font-bold cursor-pointer"
            >
              <option value="ALL">All Staff Access ({employees.length})</option>
              <option value="FIELD_OFFICER">Field Officers (App Access Granted) ({fieldOfficersAppCount})</option>
              <option value="STANDARD">Standard Staff (No App Access) ({employees.length - fieldOfficersAppCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50">
            <Filter size={14} className="text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-xs text-gray-700 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-gray-700 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Download Template, Bulk Upload, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadEmployeeExcelTemplate()}
            title="Download Corporate Employee Template (.xlsx)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Excel Template (.xlsx)
          </button>

          <button
            onClick={() => {
              setBulkFile(null)
              setParsedRows([])
              setBulkResult(null)
              setShowBulkModal(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#202B75] hover:bg-[#182159] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Upload size={14} /> Bulk Upload Staff
          </button>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => handleExport('excel')}
              title="Corporate Excel Export"
              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 cursor-pointer"
            >
              <FileSpreadsheet size={15} />
            </button>
            <button
              onClick={() => handleExport('pdf')}
              title="Corporate PDF Export"
              className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-gray-200 cursor-pointer"
            >
              <FileDown size={15} />
            </button>
            <button
              onClick={loadData}
              title="Refresh"
              className="p-2 text-gray-600 hover:text-[#202B75] hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-700">
            Workforce Directory ({filteredEmployees.length} of {employees.length} Staff)
          </p>
          <span className="text-[11px] text-gray-400">PostgreSQL Live Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/70 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Employee Code</th>
                <th className="py-3 px-4">Department & Designation</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Deployment Site</th>
                <th className="py-3 px-4 text-center">KYC Status</th>
                <th className="py-3 px-4 text-center font-bold text-teal-800 bg-teal-50/60 border-x border-teal-100">
                  Field Officer App Access
                </th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    <RefreshCw className="animate-spin inline mr-2" size={16} /> Loading staff records from database...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    <Users className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="font-medium text-gray-600">No staff members found</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Click "Bulk Upload Staff" or adjust search/filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const statusColors: Record<string, string> = {
                    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'On Leave': 'bg-amber-50 text-amber-700 border-amber-200',
                    Suspended: 'bg-red-50 text-red-700 border-red-200',
                    Inactive: 'bg-gray-100 text-gray-600 border-gray-200',
                  }
                  const hasOfficerAccess = Boolean(emp.hasAppAccess || emp.isFieldOfficer)

                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#202B75] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{emp.name}</p>
                            <span className="text-[10px] text-gray-400">{emp.gender || 'Male'} · {emp.employmentType || 'Permanent'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700 text-[11px]">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{emp.designationName || 'Staff Member'}</p>
                          <span className="text-[10px] text-gray-400">{emp.departmentName || 'Operations'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="text-gray-700 font-mono text-[11px] flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" /> {emp.phone}
                          </p>
                          {emp.email && (
                            <p className="text-gray-400 text-[10px] truncate max-w-[150px]">
                              {emp.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {emp.siteName || <span className="text-gray-400 italic">Unassigned Pool</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${emp.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {emp.kycStatus || 'Pending'}
                        </span>
                      </td>

                      {/* FIELD OFFICER APP ACCESS COLUMN */}
                      <td className="py-3 px-4 text-center bg-teal-50/20 border-x border-teal-100/60">
                        {hasOfficerAccess ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck size={12} className="text-emerald-600" />
                              Field Officer (Active)
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <button
                                onClick={() => handleOpenGrantModal(emp)}
                                className="text-[10px] text-[#202B75] hover:underline font-semibold cursor-pointer"
                                title="Manage / Reset App Password"
                              >
                                Manage Access
                              </button>
                              <span className="text-gray-300">·</span>
                              <button
                                onClick={() => handleRevokeAccess(emp)}
                                className="text-[10px] text-red-500 hover:underline font-medium cursor-pointer"
                                title="Revoke App Credentials"
                              >
                                Revoke
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenGrantModal(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#202B75] hover:bg-[#182159] rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <Key size={12} className="text-[#26BCEE]" />
                            <span>Grant Field Officer Access</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {emp.joiningDate || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusColors[emp.status] || 'bg-gray-100 text-gray-600'}`}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GRANT FIELD OFFICER APPLICATION ACCESS */}
      {selectedEmpForGrant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#202B75]">Grant Field Officer Application Access</h3>
                  <p className="text-xs text-gray-500">Enable mobile app login and field supervision permissions</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmpForGrant(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Employee Info Badge */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-gray-900">{selectedEmpForGrant.name}</div>
                <div className="text-gray-500 font-mono">{selectedEmpForGrant.employeeCode} · {selectedEmpForGrant.phone}</div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-700">{selectedEmpForGrant.designationName || 'Staff Member'}</span>
                <div className="text-[10px] text-gray-400">{selectedEmpForGrant.departmentName || 'Operations'}</div>
              </div>
            </div>

            <form onSubmit={handleConfirmGrant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile App & Web Login Identifier (Badge ID / Username)
                </label>
                <input
                  type="text"
                  required
                  value={grantForm.username}
                  onChange={(e) => setGrantForm({ ...grantForm, username: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75] font-mono"
                  placeholder="e.g. SS-10001"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Staff can sign into the mobile app using this Badge Code or Phone.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Official Account Email
                </label>
                <input
                  type="email"
                  required
                  value={grantForm.email}
                  onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  placeholder="officer@silverstarindia.net"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={grantForm.password}
                    onChange={(e) => setGrantForm({ ...grantForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75] font-mono"
                    placeholder="Enter secure password"
                  />
                  <Lock size={13} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Default initial password for Silver Star field workforce is <span className="font-mono text-gray-600 font-bold">Silverstar@123</span>.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Application Authorization Role
                </label>
                <select
                  value={grantForm.role}
                  onChange={(e) => setGrantForm({ ...grantForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white font-medium text-gray-700"
                >
                  <option value="Supervisor">Field Officer / Security Supervisor</option>
                  <option value="Operations Manager">Operations Manager</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={grantForm.updateDesignation}
                    onChange={(e) => setGrantForm({ ...grantForm, updateDesignation: e.target.checked })}
                    className="rounded text-[#202B75] focus:ring-[#202B75]"
                  />
                  <span className="font-medium">Also upgrade official designation to <strong>Field Officer (DES009)</strong> in database</span>
                </label>
              </div>

              {/* Granted Capabilities Preview */}
              <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-teal-800">
                  <ShieldCheck size={14} />
                  <span>Enabled Mobile App Capabilities:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-teal-700 space-y-0.5 pl-1">
                  <li>Daily frontline guard & housekeeper roll-call muster with photo upload</li>
                  <li>Night patrolling checkpoints scanning & incident reporting</li>
                  <li>Client facility inspection log submissions & GPS verification</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedEmpForGrant(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantingAccess}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#202B75] text-white rounded-lg text-xs font-bold hover:bg-[#182159] disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {grantingAccess ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <Key size={13} className="text-[#26BCEE]" />
                      Confirm & Grant App Access
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREDENTIALS CONFIRMATION CARD */}
      {credentialsResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="font-extrabold text-base text-[#202B75]">
                Field Officer Access Granted!
              </h3>
              <p className="text-xs text-gray-500">
                Application credentials have been provisioned in PostgreSQL. Share these details with the officer:
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500 font-sans">Officer Name:</span>
                <span className="font-bold text-gray-900 font-sans">{credentialsResult.name}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500 font-sans">Badge / Login ID:</span>
                <span className="font-bold text-[#202B75]">{credentialsResult.loginIdentifier || credentialsResult.employeeCode}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500 font-sans">Login Email:</span>
                <span className="text-gray-800">{credentialsResult.loginEmail}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500 font-sans">App Password:</span>
                <span className="font-bold text-emerald-700">{credentialsResult.defaultPassword}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-sans">Access Level:</span>
                <span className="text-gray-700 font-sans font-semibold">{credentialsResult.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCredentialsResult(null)}
                className="px-5 py-2.5 bg-[#202B75] hover:bg-[#182159] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK UPLOAD EMPLOYEES */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#202B75] rounded-lg">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#202B75]">Bulk Upload Staff & Field Employees</h3>
                  <p className="text-xs text-gray-400">Import multiple employees via Excel / CSV with matched column headers</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Step 1: Download Proper Excel / CSV Template */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <FileSpreadsheet size={16} className="text-emerald-700" />
                    <span>Step 1: Download Pre-Formatted Staff Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Includes built-in master sheets for verified Department & Designation codes.
                  </p>
                  <div className="flex flex-wrap gap-1 text-[10px] text-emerald-800 pt-1">
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Employee Code</span>
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Full Name *</span>
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Phone *</span>
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Department *</span>
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Designation *</span>
                    <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300/40">Bank & KYC</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadEmployeeExcelTemplate()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet size={14} /> Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadEmployeeTemplate()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                  >
                    <Download size={14} /> CSV (.csv)
                  </button>
                </div>
              </div>

              {/* Step 2: Upload Excel / CSV */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#202B75] rounded-xl p-6 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="employeeBulkInput"
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="employeeBulkInput" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 mx-auto bg-blue-100 text-[#202B75] rounded-full flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#202B75] hover:underline">Click to browse file</span>
                    <span className="text-xs text-gray-500"> or drag and drop your completed spreadsheet</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Supported formats: Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
                  {bulkFile && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200">
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>{bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Step 3: Preview Parsed Rows */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-700">Data Verification Preview</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {validBulkCount} Valid
                      </span>
                      {invalidBulkCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
                          {invalidBulkCount} Incomplete
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">Total {parsedRows.length} Rows</span>
                  </div>

                  <div className="max-h-56 overflow-auto border border-gray-200 rounded-lg text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold text-[11px]">
                        <tr>
                          <th className="p-2">Row</th>
                          <th className="p-2">Code</th>
                          <th className="p-2">Full Name</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Designation</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px]">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                            <td className="p-2 font-mono text-gray-500">#{r._rowIndex}</td>
                            <td className="p-2 font-mono text-gray-700">{r.employeeCode || <span className="text-gray-400 italic">Auto</span>}</td>
                            <td className="p-2 font-semibold text-gray-800">{r.name || <span className="text-red-500 font-normal">Missing Name</span>}</td>
                            <td className="p-2 text-gray-600">{r.department}</td>
                            <td className="p-2 text-gray-600">{r.designation}</td>
                            <td className="p-2 text-gray-600 font-mono">{r.phone || <span className="text-red-500 font-normal">Missing Phone</span>}</td>
                            <td className="p-2 font-medium">{r.status}</td>
                            <td className="p-2">
                              {r.isValid ? (
                                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 size={12} /> Ready
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center gap-1 font-semibold" title={r.error}>
                                  <AlertCircle size={12} /> {r.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Result Alert */}
              {bulkResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    bulkResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {bulkResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="font-medium">{bulkResult.message}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkUpload}
                disabled={bulkUploading || validBulkCount === 0}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#182159] disabled:opacity-50 shadow-sm cursor-pointer"
              >
                <Upload size={14} />
                {bulkUploading ? 'Importing to Database...' : `Import ${validBulkCount} Staff to Database`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
