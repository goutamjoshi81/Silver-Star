import { useState, useEffect } from 'react'
import { SITES, CONTRACT_BILLINGS, api, downloadClientTemplate, downloadClientExcelTemplate, parseSpreadsheetFile, mapClientCsvRows } from '@mock/mockData'
import { Plus, Search, Eye, Edit2, X, Building2, Phone, Mail, Calendar, MapPin, Check, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    monthlyBilling: 0,
    servicesProvided: ['Security Services', 'Housekeeping'],
  })
  const [loading, setLoading] = useState(true)

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: boolean; count: number; message: string } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)
    setBulkResult(null)

    try {
      const { rows } = await parseSpreadsheetFile(file)
      const mapped = mapClientCsvRows(rows)
      setParsedRows(mapped)
    } catch (err: any) {
      alert(`Failed to parse file: ${err.message}`)
    }
  }

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
      loadData()
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

  const loadData = () => {
    api.getClients()
      .then(setClients)
      .catch(err => console.error('Error loading clients:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
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
        servicesProvided: ['Security Services'],
      })
      loadData()
    } catch (err: any) {
      alert(`Error creating client: ${err.message}`)
    }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase())
  )

  const client = clients.find(c => c.id === selected)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{clients.length} client accounts</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadClientExcelTemplate()}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors font-medium cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Excel Template (.xlsx)
          </button>
          <button
            onClick={() => downloadClientTemplate()}
            className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 text-xs px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer"
          >
            <Download size={14} /> CSV Template
          </button>
          <button
            onClick={() => {
              setBulkFile(null)
              setParsedRows([])
              setBulkResult(null)
              setShowBulkModal(true)
            }}
            className="flex items-center gap-1.5 bg-blue-50 text-[#202B75] border border-blue-200 text-xs px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium cursor-pointer"
          >
            <Upload size={14} /> Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#202B75] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#161f56] transition-colors font-medium shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-800">Add New Client Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization Name *</label>
                <input required value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="e.g. Acme Tech Park" className="w-full border rounded-lg p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person *</label>
                  <input required value={newClient.contactPerson} onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    placeholder="e.g. Ramesh Verma" className="w-full border rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input required value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+91 98765 43210" className="w-full border rounded-lg p-2.5 font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Email Address *</label>
                <input required type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="client@acme.com" className="w-full border rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Facility / Billing Address *</label>
                <input required value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Electronic City, Bangalore" className="w-full border rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Monthly Contract Value (₹)</label>
                <input type="number" value={newClient.monthlyBilling || ''} onChange={e => setNewClient({ ...newClient, monthlyBilling: parseFloat(e.target.value) || 0 })}
                  placeholder="250000" className="w-full border rounded-lg p-2.5 font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#202B75] text-white rounded-lg font-semibold flex items-center gap-1.5">
                  <Check size={14} /> Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sites</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No clients found. Click "+ Add Client" to create your first client in PostgreSQL.
                </td>
              </tr>
            ) : (
              filtered.map(client => {
                const contract = CONTRACT_BILLINGS.find(c => c.clientId === client.id)
                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#202B75]/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-[#202B75]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{client.contactPerson}</p>
                      <p className="text-xs text-gray-400">{client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#26BCEE]/10 text-[#26BCEE] text-xs font-semibold px-2 py-1 rounded-full">
                        {client.sites?.length || 0} site{client.sites?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{contract?.contractNumber || '—'}</p>
                      <p className="text-xs text-gray-400">₹{((client.monthlyBilling || 0) / 1000).toFixed(0)}K/mo</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        client.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                        client.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                      }`}>{client.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(client.id)} className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {client && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#202B75]">{client.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Building2 size={12} />{client.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Phone size={12} />{client.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Mail size={12} />{client.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="text-sm font-medium flex items-center gap-1"><MapPin size={12} />{client.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contract Start</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Calendar size={12} />{client.contractStart}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contract End</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Calendar size={12} />{client.contractEnd}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Services Provided</p>
                <div className="flex flex-wrap gap-2">
                  {client.servicesProvided?.map((s: string) => (
                    <span key={s} className="bg-[#202B75]/10 text-[#202B75] text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#202B75] rounded-lg">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#202B75]">Bulk Upload Client Accounts</h3>
                  <p className="text-xs text-gray-400">Import clients from Excel / CSV matching system columns</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <FileSpreadsheet size={16} /> <span>Download Corporate Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Pre-formatted templates with exact column names and guidelines sheet.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadClientExcelTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet size={14} /> Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadClientTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                  >
                    <Download size={14} /> CSV (.csv)
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#202B75] rounded-xl p-5 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="saClientBulkInput"
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="saClientBulkInput" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 mx-auto bg-blue-100 text-[#202B75] rounded-full flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#202B75] hover:underline">Choose Excel or CSV File</span>
                    <span className="text-xs text-gray-500"> or drag and drop</span>
                  </div>
                  {bulkFile && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200">
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>{bulkFile.name}</span>
                    </div>
                  )}
                </label>
              </div>

              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Preview ({parsedRows.filter(r => r.isValid).length} ready of {parsedRows.length})</span>
                  </div>
                  <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg text-xs">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold">
                        <tr>
                          <th className="p-2">Row</th>
                          <th className="p-2">Company</th>
                          <th className="p-2">Contact</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Billing</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                            <td className="p-2 font-mono text-gray-500">#{r._rowIndex}</td>
                            <td className="p-2 font-semibold text-gray-800">{r.name || 'Missing Name'}</td>
                            <td className="p-2 text-gray-600">{r.contactPerson}</td>
                            <td className="p-2 text-gray-600 font-mono">{r.phone}</td>
                            <td className="p-2 font-mono">₹{r.monthlyBilling.toLocaleString('en-IN')}</td>
                            <td className="p-2">
                              {r.isValid ? (
                                <span className="text-emerald-600 font-semibold">Ready</span>
                              ) : (
                                <span className="text-red-600 font-semibold">{r.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bulkResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    bulkResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {bulkResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span className="font-medium">{bulkResult.message}</span>
                </div>
              )}
            </div>

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
                disabled={bulkUploading || parsedRows.filter(r => r.isValid).length === 0}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#182159] disabled:opacity-50"
              >
                <Upload size={14} />
                {bulkUploading ? 'Uploading...' : `Import ${parsedRows.filter(r => r.isValid).length} Clients`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
