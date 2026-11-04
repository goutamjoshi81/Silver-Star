import { useState } from 'react'
import {
  ATTENDANCE_HISTORY, EMPLOYEES, SITES, CLIENTS,
  EMPLOYEE_DOCUMENTS, DAILY_WORK_REPORTS, DEPARTMENTS
} from '@mock/mockData'
import {
  Download, FileSpreadsheet, BarChart2, Filter, Calendar,
  Users, CheckCircle2, AlertTriangle, ShieldCheck, FileText,
  Clock, Building2, Radio
} from 'lucide-react'

type ReportSection =
  | 'ops_attendance'
  | 'ops_dwr'
  | 'ops_geofence'
  | 'ops_deployment'
  | 'hr_onboarding'
  | 'hr_kyc'
  | 'hr_documents'

export default function Reports() {
  const [activeSection, setActiveSection] = useState<ReportSection>('ops_attendance')
  const [filterPreset, setFilterPreset] = useState<'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom'>('all')
  const [startDate, setStartDate] = useState<string>('2024-01-01')
  const [endDate, setEndDate] = useState<string>('2026-12-31')
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const applyPreset = (preset: 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom') => {
    setFilterPreset(preset)
    const today = '2026-11-02'
    if (preset === 'all') {
      setStartDate('2024-01-01')
      setEndDate('2026-12-31')
    } else if (preset === 'today') {
      setStartDate(today)
      setEndDate(today)
    } else if (preset === 'yesterday') {
      setStartDate('2026-11-01')
      setEndDate('2026-11-01')
    } else if (preset === '7days') {
      setStartDate('2026-10-26')
      setEndDate(today)
    } else if (preset === 'month') {
      setStartDate('2026-11-01')
      setEndDate('2026-11-30')
    }
  }

  // Filtered Datasets based on Date Filter
  const filteredAttendance = ATTENDANCE_HISTORY.filter(a => {
    if (filterPreset === 'all') return true
    return a.date >= startDate && a.date <= endDate
  })

  const filteredDWR = DAILY_WORK_REPORTS.filter(d => {
    if (filterPreset === 'all') return true
    return d.date >= startDate && d.date <= endDate
  })

  const filteredEmployees = EMPLOYEES.filter(e => {
    if (filterPreset === 'all') return true
    return e.joiningDate >= startDate && e.joiningDate <= endDate
  })

  const handleExport = (format: 'PDF' | 'Excel') => {
    setExportNotice(`Exported ${activeSection.toUpperCase()} (${startDate} to ${endDate}) in ${format} format. Demo report downloaded!`)
    setTimeout(() => setExportNotice(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Executive Reports & Analytics Engine</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Unified cross-departmental reporting: HR Onboarding & KYC compliance alongside Operations attendance, DWR shift logs & geofence SLAs
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {exportNotice}
          </span>
          <button onClick={() => setExportNotice(null)} className="text-[11px] underline">Dismiss</button>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={15} className="text-[#202B75]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Date Filter:</span>
          <div className="flex flex-wrap gap-1">
            {(['all', 'today', 'yesterday', '7days', 'month', 'custom'] as const).map(p => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterPreset === p ? 'bg-[#202B75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'all' && 'All Records'}
                {p === 'today' && 'Today'}
                {p === 'yesterday' && 'Yesterday'}
                {p === '7days' && 'Last 7 Days'}
                {p === 'month' && 'This Month'}
                {p === 'custom' && 'Custom Date'}
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
              className="bg-transparent border-none text-xs font-bold text-gray-800 focus:outline-none"
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
              className="bg-transparent border-none text-xs font-bold text-gray-800 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cross-Departmental Category Tabs */}
      <div className="space-y-3">
        {/* Operations Reports Shelf */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Radio size={12} className="text-[#26BCEE]" /> Operations Management Reports:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setActiveSection('ops_attendance')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'ops_attendance'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 mb-1 text-[#202B75]" />
              <p className="text-xs font-bold text-gray-900">Attendance Muster Roll</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{filteredAttendance.length} punch records</p>
            </button>

            <button
              onClick={() => setActiveSection('ops_dwr')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'ops_dwr'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 mb-1 text-emerald-600" />
              <p className="text-xs font-bold text-gray-900">Daily Work Reports (DWR)</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{filteredDWR.length} shift summaries</p>
            </button>

            <button
              onClick={() => setActiveSection('ops_geofence')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'ops_geofence'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Radio className="w-4 h-4 mb-1 text-amber-600" />
              <p className="text-xs font-bold text-gray-900">Geofence SLA & Breaches</p>
              <p className="text-[10px] text-gray-500 mt-0.5">3 GPS breach incidents</p>
            </button>

            <button
              onClick={() => setActiveSection('ops_deployment')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'ops_deployment'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 mb-1 text-[#26BCEE]" />
              <p className="text-xs font-bold text-gray-900">Site Staffing & Fulfillment</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{SITES.length} work locations</p>
            </button>
          </div>
        </div>

        {/* HR Management Reports Shelf */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Users size={12} className="text-[#202B75]" /> Human Resources & Compliance Reports:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveSection('hr_onboarding')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'hr_onboarding'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 mb-1 text-[#202B75]" />
              <p className="text-xs font-bold text-gray-900">Onboarding & Staff Intake</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{filteredEmployees.length} staff records</p>
            </button>

            <button
              onClick={() => setActiveSection('hr_kyc')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'hr_kyc'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
              <p className="text-xs font-bold text-gray-900">eKYC & Identity Audit</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Aadhaar QR & DigiLocker</p>
            </button>

            <button
              onClick={() => setActiveSection('hr_documents')}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeSection === 'hr_documents'
                  ? 'border-[#202B75] bg-blue-50/50 shadow-sm ring-1 ring-[#202B75]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mb-1 text-sky-600" />
              <p className="text-xs font-bold text-gray-900">Statutory Documents Dossier</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{EMPLOYEE_DOCUMENTS.length} verified files</p>
            </button>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT PREVIEW */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#202B75] uppercase tracking-wide">
              {activeSection.replace('_', ' — ')} Report Preview
            </h3>
            <p className="text-xs text-gray-400">Date Range Applied: {startDate} to {endDate}</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">
            Real-Time Operational Audit Record
          </span>
        </div>

        {/* SECTION 1: OPS ATTENDANCE */}
        {activeSection === 'ops_attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Record ID</th>
                  <th className="px-4 py-3 text-left">Employee Name & Code</th>
                  <th className="px-4 py-3 text-left">Work Site</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Punch In / Out</th>
                  <th className="px-4 py-3 text-left">GPS Distance</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.map((rec, idx) => {
                  const emp = EMPLOYEES.find(e => e.id === rec.employeeId)
                  const site = SITES.find(s => s.id === rec.siteId)
                  return (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{rec.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{emp?.name || rec.employeeId}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{emp?.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{site?.name || rec.siteId}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-600">{rec.date}</td>
                      <td className="px-4 py-3 font-mono text-gray-800">
                        {rec.punchIn ? `${rec.punchIn} → ${rec.punchOut || '--:--'}` : 'Absent'}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">{rec.distanceMeters || 12}m (In Bounds)</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          rec.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 2: OPS DWR */}
        {activeSection === 'ops_dwr' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Report ID</th>
                  <th className="px-4 py-3 text-left">Work Site</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Supervisor</th>
                  <th className="px-4 py-3 text-left">Operational Summary</th>
                  <th className="px-4 py-3 text-left">Consumables Log</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDWR.map(dwr => {
                  const site = SITES.find(s => s.id === dwr.siteId)
                  const sup = EMPLOYEES.find(e => e.id === dwr.submittedBy)
                  return (
                    <tr key={dwr.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{dwr.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{site?.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{dwr.date}</td>
                      <td className="px-4 py-3 text-gray-800">{sup?.name || 'Supervisor'}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-sm truncate">{dwr.summary}</td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">{dwr.consumables}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {dwr.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 3: OPS GEOFENCE */}
        {activeSection === 'ops_geofence' && (
          <div className="p-4 space-y-3">
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs">
              <strong>Geofence Exception Log:</strong> Displays perimeter violations where GPS coordinates exceeded authorized site boundary limits.
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">EMP006 (Deepa Verma) — 185m from MedPlus Main Campus</p>
                  <p className="text-gray-500 text-[11px]">Authorized Limit: 150m · Punch flagged and supervisor review required.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Breach Flagged
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">EMP009 (Vikramaditya) — Mock Location Detected</p>
                  <p className="text-gray-500 text-[11px]">Developer Mode Spoofing blocked by Mobile Security Sandbox.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  Spoof Blocked
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: OPS DEPLOYMENT */}
        {activeSection === 'ops_deployment' && (
          <div className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SITES.map(s => {
                const emps = EMPLOYEES.filter(e => e.deployedSiteId === s.id)
                return (
                  <div key={s.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50/60 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{s.name}</h4>
                      <p className="text-[11px] text-gray-500">{s.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-[#202B75]">{emps.length} / {s.sanctionedStrength}</span>
                      <p className="text-[10px] text-gray-400">Deployed Staff</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: HR ONBOARDING */}
        {activeSection === 'hr_onboarding' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Joining Date</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Onboarding Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map(e => {
                  const dept = DEPARTMENTS.find(d => d.id === e.departmentId)
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{e.name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{e.employeeCode}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{e.joiningDate}</td>
                      <td className="px-4 py-3 text-gray-700">{dept?.name || 'Operations'}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{e.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {e.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#202B75] border border-blue-200">
                          {e.onboardingStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 6: HR KYC */}
        {activeSection === 'hr_kyc' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Verification Method</th>
                  <th className="px-4 py-3 text-left">Statutory Aadhaar/PAN Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EMPLOYEES.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{e.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{e.employeeCode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        e.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {e.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.kycMethod || 'Manual Physical'}</td>
                    <td className="px-4 py-3 text-gray-500">Verified & Encrypted</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 7: HR DOCUMENTS */}
        {activeSection === 'hr_documents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">Document Type</th>
                  <th className="px-4 py-3 text-left">Employee Attached</th>
                  <th className="px-4 py-3 text-left">File Name</th>
                  <th className="px-4 py-3 text-left">Upload Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EMPLOYEE_DOCUMENTS.map(doc => {
                  const emp = EMPLOYEES.find(e => e.id === doc.employeeId)
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{doc.documentType}</td>
                      <td className="px-4 py-3">{emp?.name} ({emp?.employeeCode})</td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-[11px]">{doc.fileName}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{doc.uploadDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
