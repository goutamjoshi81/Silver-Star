import { useState, useEffect } from 'react'
import {
  DEPARTMENTS, EMPLOYEE_DOCUMENTS, api,
  exportToCorporateExcel, exportToCorporatePdf, type CorporateExportOptions
} from '@mock/mockData'
import { Download, FileSpreadsheet, Calendar, Filter, CheckCircle2, AlertCircle, Clock, FileCheck } from 'lucide-react'

export default function HRReports() {
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [filterPreset, setFilterPreset] = useState<'all' | 'today' | '7days' | 'month' | 'custom'>('all')
  const [startDate, setStartDate] = useState<string>('2024-01-01')
  const [endDate, setEndDate] = useState<string>('2026-12-31')
  const [activeTab, setActiveTab] = useState<'kyc' | 'docs' | 'departments'>('kyc')
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getEmployees().catch(() => []),
      api.getDocuments().catch(() => []),
    ]).then(([emps, docs]) => {
      setEmployees(emps || [])
      setDocuments(docs || [])
    })
  }, [])

  // Handle Preset changes
  const applyPreset = (preset: 'all' | 'today' | '7days' | 'month' | 'custom') => {
    setFilterPreset(preset)
    const today = new Date().toISOString().split('T')[0]
    if (preset === 'all') {
      setStartDate('2024-01-01')
      setEndDate('2026-12-31')
    } else if (preset === 'today') {
      setStartDate(today)
      setEndDate(today)
    } else if (preset === '7days') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      setStartDate(d.toISOString().split('T')[0])
      setEndDate(today)
    } else if (preset === 'month') {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(today)
    }
  }

  // Filter employees by joiningDate
  const filteredEmployees = employees.filter(emp => {
    if (!emp.joiningDate) return true
    if (filterPreset === 'all') return true
    return emp.joiningDate >= startDate && emp.joiningDate <= endDate
  })

  const verifiedCount = filteredEmployees.filter(e => e.kycStatus === 'Verified').length
  const pendingCount = filteredEmployees.filter(e => e.kycStatus === 'Pending').length
  const totalDocs = filteredEmployees.reduce((acc, e) => {
    return acc + EMPLOYEE_DOCUMENTS.filter(d => d.employeeId === e.id).length
  }, 0)

  const handleExport = (type: 'PDF' | 'Excel') => {
    let options: CorporateExportOptions

    if (activeTab === 'kyc') {
      options = {
        title: 'Statutory eKYC & Identity Verification Audit Report',
        subtitle: 'Official UIDAI Aadhaar QR and DigiLocker verification logs for on-site staff',
        category: 'HR STATUTORY COMPLIANCE REPORT',
        dateRange: { start: startDate, end: endDate },
        kpis: [
          { label: 'Total Assessed Staff', value: filteredEmployees.length },
          { label: 'Verified Staff', value: verifiedCount },
          { label: 'Pending Verification', value: pendingCount },
          { label: 'Compliance Rate', value: `${filteredEmployees.length ? Math.round((verifiedCount / filteredEmployees.length) * 100) : 0}%` },
        ],
        columns: [
          { header: 'Sl No', key: 'sl_no', align: 'center' },
          { header: 'Employee Code', key: 'employeeCode' },
          { header: 'Staff Name', key: 'name' },
          { header: 'Department', key: 'departmentName', format: (v, r) => v || DEPARTMENTS.find(d => d.id === r.departmentId)?.name || 'Operations' },
          { header: 'Designation', key: 'designationName', format: (v, r) => v || 'Staff' },
          { header: 'Contact Mobile', key: 'phone' },
          { header: 'eKYC Method', key: 'kycMethod', format: v => v || 'Aadhaar Secure QR' },
          { header: 'KYC Status', key: 'kycStatus', align: 'center' },
          { header: 'Joining Date', key: 'joiningDate', align: 'center' },
        ],
        data: filteredEmployees,
        filename: `SilverStar_HR_KYC_Report_${startDate}_to_${endDate}`,
        notes: 'Compliance report certified in accordance with Section 12 of PSARA Regulations.',
      }
    } else if (activeTab === 'docs') {
      options = {
        title: 'Employee Statutory Documents Dossier Report',
        subtitle: 'Audit listing of identity proofs, police clearances, and banking records',
        category: 'EMPLOYEE DOCUMENTATION AUDIT',
        kpis: [
          { label: 'Total Uploaded Proofs', value: documents.length },
          { label: 'Approved Documents', value: documents.filter(d => d.status === 'Approved').length },
          { label: 'Pending Review', value: documents.filter(d => d.status === 'Pending').length },
        ],
        columns: [
          { header: 'Sl No', key: 'sl_no', align: 'center' },
          { header: 'Document Type', key: 'documentType' },
          { header: 'File Name', key: 'fileName' },
          { header: 'Staff Name', key: 'employeeName', format: (v, r) => v || employees.find(e => e.id === r.employeeId)?.name || r.employeeId },
          { header: 'Upload Date', key: 'uploadDate', align: 'center' },
          { header: 'Verification Status', key: 'status', align: 'center' },
        ],
        data: documents,
        filename: `SilverStar_Employee_Documents_${new Date().toISOString().split('T')[0]}`,
      }
    } else {
      // departments
      const deptData = DEPARTMENTS.map((dept, i) => {
        const staff = filteredEmployees.filter(e => e.departmentId === dept.id)
        const verified = staff.filter(e => e.kycStatus === 'Verified').length
        return {
          sl_no: i + 1,
          code: dept.code,
          name: dept.name,
          headcount: staff.length,
          verified: verified,
          complianceRate: staff.length > 0 ? `${Math.round((verified / staff.length) * 100)}%` : '100%',
        }
      })

      options = {
        title: 'Departmental Headcount & Manpower Allocation Audit',
        subtitle: 'Enterprise workforce distribution across housekeeping, security, and electro-mechanical divisions',
        category: 'WORKFORCE DISTRIBUTION AUDIT',
        kpis: [
          { label: 'Total Departments', value: DEPARTMENTS.length },
          { label: 'Total Active Workforce', value: filteredEmployees.length },
          { label: 'Overall KYC Verified', value: verifiedCount },
        ],
        columns: [
          { header: 'Sl No', key: 'sl_no', align: 'center' },
          { header: 'Dept Code', key: 'code', align: 'center' },
          { header: 'Department Name', key: 'name' },
          { header: 'Total Staff Headcount', key: 'headcount', align: 'center' },
          { header: 'KYC Verified Staff', key: 'verified', align: 'center' },
          { header: 'Compliance Rate', key: 'complianceRate', align: 'center' },
        ],
        data: deptData,
        filename: `SilverStar_Departmental_Allocation_${new Date().toISOString().split('T')[0]}`,
      }
    }

    if (type === 'Excel') {
      exportToCorporateExcel(options)
      setExportNotice(`Corporate Excel spreadsheet "${options.title}" generated and downloaded!`)
    } else {
      exportToCorporatePdf(options)
      setExportNotice(`Corporate PDF report "${options.title}" generated in print preview!`)
    }
    setTimeout(() => setExportNotice(null), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">HR Compliance & Onboarding Reports</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit-ready onboarding reports, KYC verification logs, and document compliance with date filtering
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] shadow-sm transition-all"
          >
            <Download size={14} /> Export PDF
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-sm transition-all"
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="font-bold underline ml-4 text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#202B75]" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Date Filter:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'today', '7days', 'month', 'custom'] as const).map(preset => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterPreset === preset
                      ? 'bg-[#202B75] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset === 'all' && 'All Records'}
                  {preset === 'today' && 'Today'}
                  {preset === '7days' && 'Last 7 Days'}
                  {preset === 'month' && 'This Month'}
                  {preset === 'custom' && 'Custom Range'}
                </button>
              ))}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={13} className="text-gray-400" />
              <label className="text-gray-500 font-medium">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value)
                  setFilterPreset('custom')
                }}
                className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={13} className="text-gray-400" />
              <label className="text-gray-500 font-medium">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value)
                  setFilterPreset('custom')
                }}
                className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Records in Range</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#202B75]">{filteredEmployees.length}</span>
            <span className="text-[11px] text-gray-400">Staff members</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">KYC Verified</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-700">{verifiedCount}</span>
            <span className="text-[11px] font-medium text-emerald-600">
              {filteredEmployees.length > 0 ? `${Math.round((verifiedCount / filteredEmployees.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-700 uppercase">Pending Verification</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-[11px] text-amber-600">Action required</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-sky-700 uppercase">Total Documents Filed</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#26BCEE]">{totalDocs}</span>
            <span className="text-[11px] text-gray-400">Archived proofs</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'kyc'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 size={14} /> KYC & Onboarding Roster ({filteredEmployees.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'docs'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <FileCheck size={14} /> Document Status Audit
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'departments'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Clock size={14} /> Department Breakdown
        </button>
      </div>

      {/* TAB CONTENT 1: KYC ROSTER */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Showing {filteredEmployees.length} Employees for Period: {startDate} to {endDate}
            </h3>
            <span className="text-[11px] text-gray-400">Real-time HR synchronized</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Joining Date</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Verification Channel</th>
                  <th className="px-4 py-3 text-left">Onboarding</th>
                  <th className="px-4 py-3 text-left">Docs Filed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No employee onboarding records found in selected date range ({startDate} to {endDate}).
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(e => {
                    const docs = EMPLOYEE_DOCUMENTS.filter(d => d.employeeId === e.id)
                    const dept = DEPARTMENTS.find(d => d.id === e.departmentId)
                    return (
                      <tr key={e.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{e.name}</div>
                          <div className="text-[10px] text-gray-400">{e.phone}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#202B75]">{e.employeeCode}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{e.joiningDate || '2024-01-15'}</td>
                        <td className="px-4 py-3 text-gray-600">{dept?.name || 'Operations'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              e.kycStatus === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {e.kycStatus === 'Verified' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                            {e.kycStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{e.kycMethod || 'Manual Physical'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              e.onboardingStatus === 'Approved'
                                ? 'bg-blue-50 text-[#202B75] border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {e.onboardingStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-700">{docs.length}</span>
                          <span className="text-[10px] text-gray-400"> of 5 verified</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DOCUMENTS AUDIT */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Document Compliance Breakdown</h3>
            <span className="text-[11px] text-gray-400">Standard statutory set: Aadhaar, PAN, Police Verification</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Aadhaar Card', 'PAN Card', 'Police Verification', 'Educational Certificate', 'Bank Passbook'].map(docType => {
              const count = EMPLOYEE_DOCUMENTS.filter(d => d.documentType === docType).length
              return (
                <div key={docType} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{docType}</p>
                    <p className="text-[10px] text-gray-400">Statutory proof on file</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#202B75]/10 text-[#202B75] font-bold text-xs rounded-full">
                    {count} Verified
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DEPARTMENTS BREAKDOWN */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Department Intake in Selected Range</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {DEPARTMENTS.map(dept => {
              const inDept = filteredEmployees.filter(e => e.departmentId === dept.id).length
              return (
                <div key={dept.id} className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{dept.id}</p>
                  <h4 className="text-xs font-bold text-[#202B75]">{dept.name}</h4>
                  <div className="mt-2 text-xl font-bold text-gray-900">{inDept} <span className="text-xs font-normal text-gray-400">staff</span></div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
