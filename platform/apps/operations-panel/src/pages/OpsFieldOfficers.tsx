import { useState, useEffect } from 'react'
import {
  api,
  CLIENTS,
  SITES,
  EMPLOYEES,
  exportToCorporateExcel,
  exportToCorporatePdf,
  type CorporateExportOptions,
} from '@mock/mockData'
import {
  ShieldCheck,
  UserPlus,
  CalendarCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  FileDown,
  Clock,
  Briefcase,
  UserCheck,
} from 'lucide-react'

interface FieldOfficer {
  id: string
  employeeCode: string
  name: string
  phone: string
  email?: string
  bloodGroup?: string
  gender?: string
  status: string
  kycStatus?: string
  designation?: string
  department?: string
  activeAssignmentsCount?: number
  supervisedSitesCount?: number
  joiningDate?: string
}

interface Appointment {
  id: string
  officerId: string
  officerName: string
  officerCode?: string
  officerPhone?: string
  clientId: string
  clientName: string
  siteId?: string
  siteName?: string
  siteAddress?: string
  sanctionedStrength?: number
  shift: string
  visitFrequency: string
  status: string
  notes?: string
  assignedDate?: string
  createdAt?: string
}

export default function OpsFieldOfficers() {
  const [officers, setOfficers] = useState<FieldOfficer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'appointments' | 'officers'>('appointments')
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('ALL')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modals
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false)
  const [showAppointModal, setShowAppointModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  // Add Officer Form State
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    phone: '',
    email: '',
    employeeCode: '',
    bloodGroup: 'O+',
    gender: 'Male',
    address: 'Bengaluru HQ',
  })
  const [submittingOfficer, setSubmittingOfficer] = useState(false)

  // Appoint Officer Form State
  const [newAppoint, setNewAppoint] = useState({
    officerId: '',
    clientId: '',
    siteId: '',
    visitFrequency: 'Daily',
    shift: 'Day Shift (06:00 - 14:00)',
    notes: 'Frontline roll-call audit, uniform inspection, client escalation desk',
    status: 'Active',
  })
  const [submittingAppoint, setSubmittingAppoint] = useState(false)

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 5000)
  }

  // Load All Data
  const loadData = async () => {
    setLoading(true)
    try {
      const [officersData, appointmentsData, clientsData, sitesData] = await Promise.all([
        api.getFieldOfficers().catch(async () => {
          // Fallback to employees with supervisor/field roles
          const allEmps = await api.getEmployees().catch(() => EMPLOYEES)
          return allEmps
            .filter((e: any) => {
              const des = (e.designation || e.role || '').toLowerCase()
              const dept = (e.department || '').toLowerCase()
              return (
                des.includes('supervisor') ||
                des.includes('officer') ||
                des.includes('inspector') ||
                dept.includes('security') ||
                dept.includes('operations') ||
                (e.employeeCode || '').startsWith('SS-10001')
              )
            })
            .map((e: any) => ({
              id: e.id,
              employeeCode: e.employeeCode || e.code,
              name: e.name,
              phone: e.phone,
              email: e.email,
              bloodGroup: e.bloodGroup,
              status: e.status || 'Active',
              kycStatus: e.kycStatus || 'Verified',
              designation: e.designation || 'Security Supervisor',
              department: e.department || 'Security Services',
              activeAssignmentsCount: 1,
            }))
        }),
        api.getFieldOfficerAppointments().catch(() => []),
        api.getClients().catch(() => CLIENTS),
        api.getSites().catch(() => SITES),
      ])

      setOfficers(officersData || [])
      setAppointments(appointmentsData || [])
      setClients(clientsData || [])
      setSites(sitesData || [])
    } catch (err: any) {
      console.error('Failed to load field officers data:', err)
      showNotification('error', 'Error loading field officers and appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Create Field Officer
  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOfficer.name || !newOfficer.phone) {
      showNotification('error', 'Officer name and phone number are required')
      return
    }

    setSubmittingOfficer(true)
    try {
      const res = await api.createFieldOfficer(newOfficer)
      showNotification('success', res.message || `Field Officer ${newOfficer.name} registered successfully`)
      setShowAddOfficerModal(false)
      setNewOfficer({
        name: '',
        phone: '',
        email: '',
        employeeCode: '',
        bloodGroup: 'O+',
        gender: 'Male',
        address: 'Bengaluru HQ',
      })
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to create field officer')
    } finally {
      setSubmittingOfficer(false)
    }
  }

  // Handle Appoint Field Officer
  const handleAppointOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAppoint.officerId || !newAppoint.clientId || !newAppoint.siteId) {
      showNotification('error', 'Please select Field Officer, Client, and Site')
      return
    }

    setSubmittingAppoint(true)
    try {
      const res = await api.appointFieldOfficer(newAppoint)
      showNotification('success', res.message || 'Field Officer appointed successfully!')
      setShowAppointModal(false)
      setNewAppoint({
        officerId: '',
        clientId: '',
        siteId: '',
        visitFrequency: 'Daily',
        shift: 'Day Shift (06:00 - 14:00)',
        notes: 'Frontline roll-call audit, uniform inspection, client escalation desk',
        status: 'Active',
      })
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to appoint field officer')
    } finally {
      setSubmittingAppoint(false)
    }
  }

  // Handle Update Appointment
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppointment) return

    try {
      await api.updateFieldOfficerAppointment(editingAppointment.id, {
        shift: editingAppointment.shift,
        visitFrequency: editingAppointment.visitFrequency,
        status: editingAppointment.status,
        notes: editingAppointment.notes,
      })
      showNotification('success', 'Appointment updated successfully')
      setEditingAppointment(null)
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update appointment')
    }
  }

  // Handle Relieve Appointment
  const handleRelieveAppointment = async (appt: Appointment) => {
    if (!confirm(`Are you sure you want to relieve ${appt.officerName} from ${appt.siteName || 'this site'}?`)) {
      return
    }

    try {
      await api.deleteFieldOfficerAppointment(appt.id)
      showNotification('success', `Relieved ${appt.officerName} from ${appt.siteName}`)
      await loadData()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to relieve appointment')
    }
  }

  // Quick Open Appoint Modal for specific officer
  const openAppointForOfficer = (officerId: string) => {
    setNewAppoint(prev => ({ ...prev, officerId }))
    setShowAppointModal(true)
  }

  // Sites filtered by selected client in Appoint Modal
  const availableSitesForAppoint = newAppoint.clientId
    ? sites.filter(s => s.clientId === newAppoint.clientId)
    : sites

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch =
      (a.officerName || '').toLowerCase().includes(q) ||
      (a.clientName || '').toLowerCase().includes(q) ||
      (a.siteName || '').toLowerCase().includes(q) ||
      (a.officerCode || '').toLowerCase().includes(q) ||
      (a.notes || '').toLowerCase().includes(q)

    const matchesClient = clientFilter === 'ALL' || a.clientId === clientFilter
    return matchesSearch && matchesClient
  })

  // Filtered Officers
  const filteredOfficers = officers.filter(o => {
    const q = search.toLowerCase()
    return (
      (o.name || '').toLowerCase().includes(q) ||
      (o.employeeCode || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q)
    )
  })

  // Export Data
  const exportColumns = [
    { header: 'Officer ID', key: 'officerCode', width: 14 },
    { header: 'Officer Name', key: 'officerName', width: 22 },
    { header: 'Contact', key: 'officerPhone', width: 16 },
    { header: 'Client', key: 'clientName', width: 25 },
    { header: 'Appointed Site', key: 'siteName', width: 25 },
    { header: 'Frequency', key: 'visitFrequency', width: 15 },
    { header: 'Shift', key: 'shift', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 },
  ]

  const exportOptions: CorporateExportOptions = {
    title: 'FIELD OFFICER SITE APPOINTMENT REGISTER',
    subtitle: 'Silver Star Facility Management Pvt. Ltd. - Operations Control Division',
    filename: 'SilverStar_Field_Officer_Appointments',
    category: 'Operations & Field Supervision',
    notes: 'Generated from Operations Management Panel',
    columns: exportColumns,
    data: filteredAppointments.map(a => ({
      officerCode: a.officerCode || a.officerId,
      officerName: a.officerName,
      officerPhone: a.officerPhone || 'N/A',
      clientName: a.clientName,
      siteName: a.siteName || 'HQ / Central Pool',
      visitFrequency: a.visitFrequency,
      shift: a.shift,
      status: a.status,
      notes: a.notes || 'Routine Inspection',
    })),
  }

  // Calculate KPIs
  const totalOfficersCount = officers.length
  const activeAppointmentsCount = appointments.filter(a => a.status === 'Active' || a.status === 'Assigned').length
  const assignedSiteIds = new Set(appointments.map(a => a.siteId).filter(Boolean))
  const unassignedSitesCount = sites.filter(s => !assignedSiteIds.has(s.id)).length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {msg && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border shadow-sm transition-all ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B75] flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#26BCEE]" />
            Field Officers & Site Appointments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Register field officers, appoint supervisors to client sites, and manage frontline inspection coverage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToCorporateExcel(exportOptions)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={() => exportToCorporatePdf(exportOptions)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            Export PDF
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#202B75]' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddOfficerModal(true)}
            className="flex items-center gap-2 bg-white border border-[#202B75] text-[#202B75] hover:bg-[#202B75]/5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Add Field Officer
          </button>
          <button
            onClick={() => setShowAppointModal(true)}
            className="flex items-center gap-2 bg-[#202B75] hover:bg-[#161f56] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-[#26BCEE]" />
            + Appoint to Site
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Field Officers</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#202B75]">
              <ShieldCheck className="w-5 h-5 text-[#202B75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalOfficersCount}</span>
            <span className="text-xs font-medium text-emerald-600">Active Duty</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Supervisors registered for site audits</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Appointments</span>
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">{activeAppointmentsCount}</span>
            <span className="text-xs font-medium text-teal-600">Site Deployments</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Client facilities under supervision</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unassigned Sites</span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{unassignedSitesCount}</span>
            <span className="text-xs font-medium text-amber-600">Needs Supervisor</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Sites awaiting dedicated field officer</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Client Sites</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#202B75]">
              <MapPin className="w-5 h-5 text-[#202B75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#202B75]">{sites.length}</span>
            <span className="text-xs font-medium text-blue-600">Under Contract</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Facilities across Bengaluru & NCR</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-[#202B75] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Site Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('officers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'officers'
                  ? 'bg-[#202B75] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Field Officers Directory ({officers.length})
            </button>
          </div>

          {/* Search & Client Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search officer, client, site..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75]"
              />
            </div>

            {activeTab === 'appointments' && (
              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
              >
                <option value="ALL">All Clients ({clients.length})</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Site Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Field Officer</th>
                  <th className="py-3 px-4">Client & Appointed Site</th>
                  <th className="py-3 px-4">Inspection Frequency</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Notes / Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-semibold text-gray-700">No Site Appointments Found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "+ Appoint to Site" to assign a field officer to a client facility.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(appt => (
                    <tr key={appt.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#202B75]/10 flex items-center justify-center font-bold text-[#202B75] text-xs">
                            {appt.officerName ? appt.officerName.slice(0, 2).toUpperCase() : 'FO'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{appt.officerName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px] text-[#202B75]">
                                {appt.officerCode || appt.officerId}
                              </span>
                              {appt.officerPhone && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {appt.officerPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {appt.clientName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#26BCEE]" />
                          <span>{appt.siteName || 'All Sites'}</span>
                          {appt.sanctionedStrength && (
                            <span className="text-[11px] text-gray-400">({appt.sanctionedStrength} guards)</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {appt.visitFrequency || 'Daily'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                          {appt.shift || 'Day Shift'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-gray-600 truncate" title={appt.notes}>
                          {appt.notes || 'Routine physical roll-call and site audit'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            appt.status === 'Active' || appt.status === 'Assigned'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {appt.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingAppointment(appt)}
                            className="p-1.5 text-gray-500 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Appointment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRelieveAppointment(appt)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Relieve / Unassign Officer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Field Officers Directory */}
        {activeTab === 'officers' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Officer Profile</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">KYC / Onboarding</th>
                  <th className="py-3 px-4">Active Sites</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-semibold text-gray-700">No Field Officers Registered</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "+ Add Field Officer" to register a new supervisor in the system.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map(officer => (
                    <tr key={officer.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#202B75] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {officer.name ? officer.name.slice(0, 2).toUpperCase() : 'FO'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{officer.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              {officer.employeeCode || officer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-700 flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {officer.phone}
                        </div>
                        {officer.email && (
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {officer.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800 text-xs">
                          {officer.designation || 'Security Supervisor'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {officer.department || 'Security Services'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          {officer.bloodGroup || 'O+'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {officer.kycStatus || 'Verified'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-sm text-[#202B75] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {officer.activeAssignmentsCount ?? officer.supervisedSitesCount ?? 0} sites
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openAppointForOfficer(officer.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-[#26BCEE]" />
                          Appoint
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Field Officer */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#202B75] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#26BCEE]" />
                <h2 className="text-lg font-bold">Register New Field Officer</h2>
              </div>
              <button
                onClick={() => setShowAddOfficerModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra (Field Officer)"
                  value={newOfficer.name}
                  onChange={e => setNewOfficer({ ...newOfficer, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 00000"
                    value={newOfficer.phone}
                    onChange={e => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    placeholder="Auto (e.g. SS-FO-1002)"
                    value={newOfficer.employeeCode}
                    onChange={e => setNewOfficer({ ...newOfficer, employeeCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="officer@silverstarindia.net"
                    value={newOfficer.email}
                    onChange={e => setNewOfficer({ ...newOfficer, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newOfficer.bloodGroup}
                    onChange={e => setNewOfficer({ ...newOfficer, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Base HQ / Operating Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electronic City HQ / Outer Ring Road Corridor"
                  value={newOfficer.address}
                  onChange={e => setNewOfficer({ ...newOfficer, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#202B75] shrink-0 mt-0.5" />
                <span>
                  This will register the officer with <strong>Security Supervisor / Field Officer</strong> status,
                  verified KYC, and auto-provision credentials in the database.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOfficer}
                  className="px-5 py-2.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {submittingOfficer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    'Save Field Officer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Appoint Officer to Site */}
      {showAppointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#202B75] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-[#26BCEE]" />
                <h2 className="text-lg font-bold">Appoint Field Officer to Site</h2>
              </div>
              <button
                onClick={() => setShowAppointModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppointOfficer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Field Officer <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newAppoint.officerId}
                  onChange={e => setNewAppoint({ ...newAppoint, officerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                >
                  <option value="">-- Choose Field Officer / Supervisor --</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.employeeCode || o.id}) - {o.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Corporate Client <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newAppoint.clientId}
                  onChange={e => {
                    const cId = e.target.value
                    const matchedSites = sites.filter(s => s.clientId === cId)
                    setNewAppoint({
                      ...newAppoint,
                      clientId: cId,
                      siteId: matchedSites.length > 0 ? matchedSites[0].id : '',
                    })
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                >
                  <option value="">-- Choose Corporate Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Select Facility / Site <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newAppoint.siteId}
                  onChange={e => setNewAppoint({ ...newAppoint, siteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                >
                  <option value="">-- Choose Site --</option>
                  {availableSitesForAppoint.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.sanctionedStrength || 0} guards)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Inspection Frequency
                  </label>
                  <select
                    value={newAppoint.visitFrequency}
                    onChange={e => setNewAppoint({ ...newAppoint, visitFrequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                  >
                    <option value="Daily">Daily Roll-Call & Audit</option>
                    <option value="Twice Daily">Twice Daily (Morning & Evening)</option>
                    <option value="3 Times Weekly">3 Times Weekly</option>
                    <option value="Weekly">Weekly Comprehensive Audit</option>
                    <option value="Night Patrol Audit">Night Patrol Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Supervision Shift
                  </label>
                  <select
                    value={newAppoint.shift}
                    onChange={e => setNewAppoint({ ...newAppoint, shift: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                  >
                    <option value="Day Shift (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                    <option value="General Shift (09:00 - 18:00)">General (09:00 - 18:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Responsibility / Audit Scope
                </label>
                <textarea
                  rows={2}
                  value={newAppoint.notes}
                  onChange={e => setNewAppoint({ ...newAppoint, notes: e.target.value })}
                  placeholder="e.g. Conduct daily guard turnout check, biometric verification, client escalation review"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAppointModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAppoint}
                  className="px-5 py-2.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {submittingAppoint ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Appointing in DB...
                    </>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Appointment */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#202B75] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-[#26BCEE]" />
                <h2 className="text-lg font-bold">Edit Appointment Details</h2>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <div><strong>Officer:</strong> {editingAppointment.officerName}</div>
                <div><strong>Client & Site:</strong> {editingAppointment.clientName} - {editingAppointment.siteName}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Inspection Frequency
                  </label>
                  <select
                    value={editingAppointment.visitFrequency}
                    onChange={e => setEditingAppointment({ ...editingAppointment, visitFrequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                  >
                    <option value="Daily">Daily Roll-Call & Audit</option>
                    <option value="Twice Daily">Twice Daily (Morning & Evening)</option>
                    <option value="3 Times Weekly">3 Times Weekly</option>
                    <option value="Weekly">Weekly Comprehensive Audit</option>
                    <option value="Night Patrol Audit">Night Patrol Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editingAppointment.status}
                    onChange={e => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Supervision Shift
                </label>
                <input
                  type="text"
                  value={editingAppointment.shift}
                  onChange={e => setEditingAppointment({ ...editingAppointment, shift: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notes / Audit Scope
                </label>
                <textarea
                  rows={2}
                  value={editingAppointment.notes || ''}
                  onChange={e => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
