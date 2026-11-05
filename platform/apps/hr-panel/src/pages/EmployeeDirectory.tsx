import { useState, useEffect } from 'react'
import { DEPARTMENTS, DESIGNATIONS, SITES, CLIENTS, api, downloadEmployeeTemplate, downloadEmployeeExcelTemplate, parseSpreadsheetFile, mapEmployeeCsvRows } from '@mock/mockData'
import { Search, Phone, MessageSquare, Mail, MapPin, ShieldCheck, UserCheck, LayoutGrid, List, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [loading, setLoading] = useState(true)

  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: boolean; count: number; message: string } | null>(null)

  const loadData = () => {
    setLoading(true)
    api.getEmployees()
      .then(data => setEmployees(data))
      .catch(err => console.error('Failed to load employees from DB:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

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

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.toLowerCase().includes(search.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase()))

    const matchesDept = selectedDept === 'All' || e.departmentId === selectedDept
    return matchesSearch && matchesDept
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Staff & Workforce Directory</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Active Silver Star staff records with direct phone contacts, deployment status, and KYC verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow text-[#202B75]' : 'text-gray-500'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white shadow text-[#202B75]' : 'text-gray-500'
              }`}
            >
              <List size={14} /> Table
            </button>
          </div>
          <span className="text-xs font-bold text-[#202B75] bg-[#202B75]/10 px-3 py-1.5 rounded-lg">
            {filtered.length} Employees Found
          </span>
          <button
            onClick={() => downloadEmployeeExcelTemplate()}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Excel Template (.xlsx)
          </button>
          <button
            onClick={() => downloadEmployeeTemplate()}
            className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer"
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
            className="flex items-center gap-1.5 bg-[#202B75] text-white text-xs px-3.5 py-1.5 rounded-lg hover:bg-[#161f56] transition-colors font-medium shadow-sm cursor-pointer"
          >
            <Upload size={14} /> Bulk Upload Staff
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, employee code, or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#202B75]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Department:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 font-medium text-gray-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
            const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
            const site = SITES.find(s => s.id === emp.deployedSiteId)
            const client = CLIENTS.find(c => c.id === emp.deployedClientId)

            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3.5 hover:border-[#202B75]/50 transition-all hover:shadow-md"
              >
                {/* Employee Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#202B75] text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{emp.name}</h3>
                      <p className="text-xs text-[#26BCEE] font-bold font-mono">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Primary Contact Number (Highlighted per request) */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#202B75] text-white flex items-center justify-center flex-shrink-0">
                      <Phone size={13} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Contact Number</p>
                      <a
                        href={`tel:${emp.phone}`}
                        className="text-xs font-bold text-[#202B75] hover:underline font-mono"
                      >
                        {emp.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${emp.phone}`}
                      title="Direct Call"
                      className="p-1.5 rounded-md bg-white text-[#202B75] border border-sky-200 hover:bg-sky-100 transition-colors"
                    >
                      <Phone size={12} />
                    </a>
                    <a
                      href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp Message"
                      className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <MessageSquare size={12} />
                    </a>
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50/60 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="font-semibold text-gray-800">{dept?.name || 'Operations'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-semibold text-gray-800">{desig?.name || 'Staff'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deployment:</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">
                      {site ? `${site.name}` : client ? `${client.name}` : 'Unassigned (Reserve)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emergency:</span>
                    <span className="font-mono text-gray-700">{emp.emergencyContact?.phone || '+91 9620000494'}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 pt-1">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-md font-bold flex-1 text-center border ${
                      emp.kycStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    KYC: {emp.kycStatus}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-md font-bold flex-1 text-center bg-gray-100 text-gray-700 border border-gray-200">
                    {emp.employmentType}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Contact Number</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Deployment Site</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(emp => {
                  const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
                  const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
                  const site = SITES.find(s => s.id === emp.deployedSiteId)
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{emp.name}</div>
                        <div className="text-[10px] text-gray-400">{emp.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{emp.employeeCode}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${emp.phone}`}
                            className="font-mono font-bold text-[#202B75] hover:underline"
                          >
                            {emp.phone}
                          </a>
                          <a
                            href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{dept?.name || 'Operations'}</td>
                      <td className="px-4 py-3 text-gray-700">{desig?.name || 'Staff'}</td>
                      <td className="px-4 py-3 text-gray-600">{site?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.kycStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {emp.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${emp.phone}`}
                          className="px-2.5 py-1 bg-[#202B75] text-white rounded text-[11px] font-bold hover:bg-[#161f56] inline-flex items-center gap-1"
                        >
                          <Phone size={10} /> Call
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
                  <h3 className="font-bold text-base text-[#202B75]">Bulk Upload Staff & Employees</h3>
                  <p className="text-xs text-gray-400">Import staff records from Excel / CSV with matched columns</p>
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
                    <FileSpreadsheet size={16} /> <span>Download Staff Bulk Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Pre-formatted templates with exact column names and master data reference.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadEmployeeExcelTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet size={14} /> Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadEmployeeTemplate()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                  >
                    <Download size={14} /> CSV (.csv)
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 hover:border-[#202B75] rounded-xl p-5 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="hrEmpBulkInput"
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="hrEmpBulkInput" className="cursor-pointer space-y-2 block">
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
                          <th className="p-2">Code</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Dept</th>
                          <th className="p-2">Phone</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'}>
                            <td className="p-2 font-mono text-gray-500">#{r._rowIndex}</td>
                            <td className="p-2 font-mono">{r.employeeCode || 'Auto'}</td>
                            <td className="p-2 font-semibold text-gray-800">{r.name || 'Missing Name'}</td>
                            <td className="p-2 text-gray-600">{r.department}</td>
                            <td className="p-2 font-mono">{r.phone}</td>
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
                {bulkUploading ? 'Uploading...' : `Import ${parsedRows.filter(r => r.isValid).length} Staff`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
