import { useState, useEffect } from 'react'
import {
  api,
  downloadClientTemplate,
  parseCsvText,
  mapClientCsvRows,
  exportToCorporateExcel,
  exportToCorporatePdf,
  type CorporateExportOptions,
} from '@mock/mockData'
import {
  Building2,
  Plus,
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
} from 'lucide-react'

const AVAILABLE_SERVICES = [
  'Security Services',
  'Housekeeping',
  'Electro-Mechanical',
  'Horticulture',
  'Guest House Management',
  'Pest Control',
]

export default function OpsClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Single Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    monthlyBilling: 0,
    servicesProvided: ['Security Services', 'Housekeeping'],
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
  })
  const [submittingSingle, setSubmittingSingle] = useState(false)

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: boolean; count: number; message: string } | null>(null)

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await api.getClients()
      setClients(data)
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  // Create Single Client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.name.trim()) return

    setSubmittingSingle(true)
    try {
      await api.createClient(newClient)
      setShowAddModal(false)
      setNewClient({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        monthlyBilling: 0,
        servicesProvided: ['Security Services', 'Housekeeping'],
        contractStart: new Date().toISOString().split('T')[0],
        contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
      })
      await loadClients()
    } catch (err: any) {
      alert(`Error creating client: ${err.message}`)
    } finally {
      setSubmittingSingle(false)
    }
  }

  // Handle CSV file selection for Bulk Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)
    setBulkResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        const { rows } = parseCsvText(text)
        const mapped = mapClientCsvRows(rows)
        setParsedRows(mapped)
      }
    }
    reader.readAsText(file)
  }

  // Submit Bulk Upload
  const handleConfirmBulkUpload = async () => {
    const validRows = parsedRows.filter(r => r.isValid)
    if (validRows.length === 0) {
      alert('No valid client rows to upload. Please review errors.')
      return
    }

    setBulkUploading(true)
    try {
      const res = await api.bulkCreateClients(validRows)
      setBulkResult({
        success: true,
        count: res.count || validRows.length,
        message: `Successfully imported ${res.count || validRows.length} client accounts to database.`,
      })
      await loadClients()
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
      title: 'Operational Client Accounts & Contracts Register',
      subtitle: 'Active Client Portfolio, SLA Allocations & Commercial Billing Status',
      category: 'Operations Management',
      filterSummary: {
        Status: statusFilter,
        Search: search || 'All Accounts',
      },
      kpis: [
        { label: 'Total Clients', value: clients.length },
        { label: 'Active Contracts', value: clients.filter(c => c.status === 'Active').length },
        {
          label: 'Total Monthly Value',
          value: `₹${clients.reduce((acc, c) => acc + (c.monthlyBilling || 0), 0).toLocaleString('en-IN')}`,
        },
      ],
      columns: [
        { header: 'Client ID', key: 'id' },
        { header: 'Company Name', key: 'name' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        {
          header: 'Monthly Billing',
          key: 'monthlyBilling',
          format: (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
        },
        {
          header: 'Services Provided',
          key: 'servicesProvided',
          format: (val) => (Array.isArray(val) ? val.join(', ') : String(val || '')),
        },
        { header: 'Contract Start', key: 'contractStart' },
        { header: 'Contract End', key: 'contractEnd' },
        { header: 'Status', key: 'status' },
      ],
      data: filteredClients,
      filename: `SilverStar_Operations_Clients_${new Date().toISOString().split('T')[0]}`,
    }

    if (format === 'excel') exportToCorporateExcel(exportOpts)
    else exportToCorporatePdf(exportOpts)
  }

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalMonthlyBilling = clients.reduce((sum, c) => sum + (c.monthlyBilling || 0), 0)
  const activeClientsCount = clients.filter(c => c.status === 'Active').length

  const validBulkCount = parsedRows.filter(r => r.isValid).length
  const invalidBulkCount = parsedRows.length - validBulkCount

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Clients</p>
            <p className="text-2xl font-bold text-[#202B75] mt-1">{clients.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">Registered Enterprise Accounts</span>
          </div>
          <div className="p-3 bg-blue-50 text-[#202B75] rounded-xl">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Contracts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeClientsCount}</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">Current operational SLA</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Monthly Billing Value</p>
            <p className="text-2xl font-bold text-[#202B75] mt-1">₹{totalMonthlyBilling.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">Total Recurring Billing</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Services Covered</p>
            <p className="text-2xl font-bold text-[#26BCEE] mt-1">6 Modules</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">Security, HK, Facility</span>
          </div>
          <div className="p-3 bg-sky-50 text-[#26BCEE] rounded-xl">
            <Shield size={24} />
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
              placeholder="Search by company name, contact, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-gray-700 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Buttons: Download Template, Bulk Upload, Add Client, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadClientTemplate()}
            title="Download Bulk Upload Excel/CSV Template"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Download size={14} /> Download Template
          </button>

          <button
            onClick={() => {
              setBulkFile(null)
              setParsedRows([])
              setBulkResult(null)
              setShowBulkModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#202B75] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Upload size={14} /> Bulk Upload Clients
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#202B75] hover:bg-[#182159] rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} /> Add Client
          </button>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            <button
              onClick={() => handleExport('excel')}
              title="Corporate Excel Export"
              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200"
            >
              <FileSpreadsheet size={15} />
            </button>
            <button
              onClick={() => handleExport('pdf')}
              title="Corporate PDF Export"
              className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-gray-200"
            >
              <FileDown size={15} />
            </button>
            <button
              onClick={loadClients}
              title="Refresh"
              className="p-2 text-gray-600 hover:text-[#202B75] hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-700">
            Client Accounts Directory ({filteredClients.length} of {clients.length})
          </p>
          <span className="text-[11px] text-gray-400">PostgreSQL Operational Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/70 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-3 px-4">Company / Organization</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Monthly Billing</th>
                <th className="py-3 px-4">Services Provided</th>
                <th className="py-3 px-4">Contract Period</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <RefreshCw className="animate-spin inline mr-2" size={16} /> Loading client records from database...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Building2 className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="font-medium text-gray-600">No client accounts found</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Click "+ Add Client" or "Bulk Upload Clients" to register accounts.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const statusColors: Record<string, string> = {
                    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    Expired: 'bg-gray-100 text-gray-600 border-gray-200',
                    Terminated: 'bg-red-50 text-red-700 border-red-200',
                  }
                  return (
                    <tr key={client.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#202B75] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{client.name}</p>
                            <span className="text-[10px] text-gray-400 font-mono">{client.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{client.contactPerson || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="text-gray-700 font-mono text-[11px] flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" /> {client.phone}
                          </p>
                          {client.email && (
                            <p className="text-gray-500 text-[10px] flex items-center gap-1 truncate max-w-[160px]">
                              <Mail size={11} className="text-gray-400" /> {client.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[160px] truncate" title={client.address}>
                        {client.address || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#202B75] font-mono">
                        ₹{Number(client.monthlyBilling || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(Array.isArray(client.servicesProvided) ? client.servicesProvided : []).map((s: string, idx: number) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        <div>{client.contractStart || '-'}</div>
                        <div className="text-[10px] text-gray-400">to {client.contractEnd || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusColors[client.status] || 'bg-gray-100 text-gray-600'}`}>
                          {client.status || 'Active'}
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

      {/* MODAL 1: ADD SINGLE CLIENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#202B75]">Add New Client Account</h3>
                <p className="text-xs text-gray-400">Register facility management contract client into PostgreSQL</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization Name *</label>
                <input
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="e.g. Prestige Tech Park / Infosys Campus"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person Name *</label>
                  <input
                    required
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Official Email Address *</label>
                  <input
                    required
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="facility@company.com"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Billing (INR) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={newClient.monthlyBilling}
                    onChange={(e) => setNewClient({ ...newClient, monthlyBilling: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 250000"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-mono focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address / Site Location</label>
                <textarea
                  rows={2}
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Street Address, City, State, PIN"
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#202B75]/20 focus:border-[#202B75]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Services Provided</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_SERVICES.map((service) => {
                    const checked = newClient.servicesProvided.includes(service)
                    return (
                      <label
                        key={service}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-[11px] transition-colors ${
                          checked ? 'bg-blue-50 border-[#202B75] text-[#202B75] font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewClient({
                                ...newClient,
                                servicesProvided: [...newClient.servicesProvided, service],
                              })
                            } else {
                              setNewClient({
                                ...newClient,
                                servicesProvided: newClient.servicesProvided.filter((s) => s !== service),
                              })
                            }
                          }}
                          className="rounded text-[#202B75]"
                        />
                        <span>{service}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contract Start</label>
                  <input
                    type="date"
                    value={newClient.contractStart}
                    onChange={(e) => setNewClient({ ...newClient, contractStart: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contract End</label>
                  <input
                    type="date"
                    value={newClient.contractEnd}
                    onChange={(e) => setNewClient({ ...newClient, contractEnd: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSingle}
                  className="px-5 py-2 bg-[#202B75] text-white rounded-lg font-semibold hover:bg-[#182159] disabled:opacity-50"
                >
                  {submittingSingle ? 'Saving...' : 'Save Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPLOAD CLIENTS */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#202B75] rounded-lg">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#202B75]">Bulk Upload Client Accounts</h3>
                  <p className="text-xs text-gray-400">Import multiple clients via Excel / CSV with matched column headers</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Step 1: Download Template */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <FileSpreadsheet size={16} /> <span>Step 1: Download Standard Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Use our verified template with predefined matching columns for seamless import into PostgreSQL.
                  </p>
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Columns: Company Name, Contact Person, Email, Phone, Address, Monthly Billing (INR), Services Provided, Contract Start, Contract End, Status
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadClientTemplate()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex-shrink-0"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>

              {/* Step 2: Upload CSV */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#202B75] rounded-xl p-6 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="clientBulkInput"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="clientBulkInput" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 mx-auto bg-blue-100 text-[#202B75] rounded-full flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#202B75] hover:underline">Click to browse</span>
                    <span className="text-xs text-gray-500"> or drag and drop your completed CSV file</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Accepted format: .csv (UTF-8)</p>
                  {bulkFile && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 text-[#202B75] rounded-full text-xs font-medium border border-blue-200">
                      <FileSpreadsheet size={14} />
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
                          <th className="p-2">Company Name</th>
                          <th className="p-2">Contact Person</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Monthly Billing</th>
                          <th className="p-2">Services</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px]">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                            <td className="p-2 font-mono text-gray-500">#{r._rowIndex}</td>
                            <td className="p-2 font-semibold text-gray-800">{r.name || <span className="text-red-500 font-normal">Missing Name</span>}</td>
                            <td className="p-2 text-gray-600">{r.contactPerson}</td>
                            <td className="p-2 text-gray-600 font-mono">{r.phone}</td>
                            <td className="p-2 text-[#202B75] font-mono">₹{r.monthlyBilling.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-gray-500 max-w-[120px] truncate">{r.servicesProvided.join(', ')}</td>
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkUpload}
                disabled={bulkUploading || validBulkCount === 0}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#182159] disabled:opacity-50 shadow-sm"
              >
                <Upload size={14} />
                {bulkUploading ? 'Importing to Database...' : `Import ${validBulkCount} Clients to Database`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
