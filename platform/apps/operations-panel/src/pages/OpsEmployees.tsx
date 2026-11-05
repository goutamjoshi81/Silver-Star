import { useState, useEffect } from 'react'
import {
  api,
  downloadEmployeeTemplate,
  parseCsvText,
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
} from 'lucide-react'

export default function OpsEmployees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ success: boolean; count: number; message: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [empData, deptData] = await Promise.all([
        api.getEmployees(),
        api.getDepartments(),
      ])
      setEmployees(empData)
      setDepartments(deptData)
    } catch (err) {
      console.error('Failed to load operational staff data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
        const mapped = mapEmployeeCsvRows(rows)
        setParsedRows(mapped)
      }
    }
    reader.readAsText(file)
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
        Search: search || 'All Workforce',
      },
      kpis: [
        { label: 'Total Workforce', value: employees.length },
        { label: 'Active on Duty', value: employees.filter(e => e.status === 'Active').length },
        { label: 'KYC Verified', value: employees.filter(e => e.kycStatus === 'Verified').length },
      ],
      columns: [
        { header: 'Employee Code', key: 'employeeCode' },
        { header: 'Full Name', key: 'name' },
        { header: 'Department', key: 'departmentName' },
        { header: 'Designation', key: 'designationName' },
        { header: 'Phone', key: 'phone' },
        { header: 'Deployment Site', key: 'siteName' },
        { header: 'KYC Status', key: 'kycStatus' },
        { header: 'Joining Date', key: 'joiningDate' },
        { header: 'Status', key: 'status' },
      ],
      data: filteredEmployees,
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
    return matchSearch && matchDept && matchStatus
  })

  const validBulkCount = parsedRows.filter(r => r.isValid).length
  const invalidBulkCount = parsedRows.length - validBulkCount
  const activeStaffCount = employees.filter(e => e.status === 'Active').length
  const verifiedKycCount = employees.filter(e => e.kycStatus === 'Verified').length

  return (
    <div className="space-y-6">
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

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Operational Depts</p>
            <p className="text-2xl font-bold text-[#26BCEE] mt-1">{departments.length}</p>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">HK, Security, Technical</span>
          </div>
          <div className="p-3 bg-sky-50 text-[#26BCEE] rounded-xl">
            <Briefcase size={24} />
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
            onClick={() => downloadEmployeeTemplate()}
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
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#202B75] hover:bg-[#182159] rounded-lg shadow-sm transition-colors"
          >
            <Upload size={14} /> Bulk Upload Employees
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
              onClick={loadData}
              title="Refresh"
              className="p-2 text-gray-600 hover:text-[#202B75] hover:bg-gray-100 rounded-lg border border-gray-200"
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
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <RefreshCw className="animate-spin inline mr-2" size={16} /> Loading staff records from database...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Users className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="font-medium text-gray-600">No staff members found</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Click "Bulk Upload Employees" or register staff in the HR panel.
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

      {/* MODAL: BULK UPLOAD EMPLOYEES */}
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
              {/* Step 1: Download Template */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <FileSpreadsheet size={16} /> <span>Step 1: Download Standard Employee Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Use our verified template with predefined matching columns for seamless import into PostgreSQL.
                  </p>
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Columns: Employee Code, Full Name, Phone, Email, Department, Designation, Employment Type, Gender, Date of Birth, Blood Group, Address, Joining Date, Bank Name, Account Number, IFSC Code, PF UAN, Status
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadEmployeeTemplate()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex-shrink-0"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>

              {/* Step 2: Upload CSV */}
              <div className="border-2 border-dashed border-gray-300 hover:border-[#202B75] rounded-xl p-6 text-center transition-colors bg-gray-50/50">
                <input
                  type="file"
                  id="employeeBulkInput"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="employeeBulkInput" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 mx-auto bg-blue-100 text-[#202B75] rounded-full flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#202B75] hover:underline">Click to browse</span>
                    <span className="text-xs text-gray-500"> or drag and drop your completed employee CSV file</span>
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
                {bulkUploading ? 'Importing to Database...' : `Import ${validBulkCount} Staff to Database`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
