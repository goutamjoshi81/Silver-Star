import { useState, useEffect } from 'react'
import { DAILY_WORK_REPORTS, SITES, CLIENTS, EMPLOYEES, api } from '@mock/mockData'
import {
  FileText, CheckCircle, Clock, Plus, Download, FileSpreadsheet,
  Calendar, Filter, Building2, User, Eye, X, Check
} from 'lucide-react'

export default function DailyWorkReports() {
  const [reports, setReports] = useState<any[]>(DAILY_WORK_REPORTS)
  const [sites, setSites] = useState<any[]>(SITES)
  const [employees, setEmployees] = useState<any[]>(EMPLOYEES)
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedSite, setSelectedSite] = useState<string>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)
  const [viewReport, setViewReport] = useState<any | null>(null)

  // New report form state
  const [newSiteId, setNewSiteId] = useState('SITE001')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newSupervisor, setNewSupervisor] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newConsumables, setNewConsumables] = useState('')

  const loadData = async () => {
    try {
      const [dwrs, sts, emps] = await Promise.all([
        api.getDailyReports().catch(() => []),
        api.getSites().catch(() => []),
        api.getEmployees().catch(() => []),
      ])
      if (dwrs && dwrs.length > 0) setReports(dwrs)
      if (sts && sts.length > 0) {
        setSites(sts)
        setNewSiteId(sts[0].id)
      }
      if (emps && emps.length > 0) {
        setEmployees(emps)
        setNewSupervisor(emps[0].id)
      }
    } catch (err) {
      console.error('Error loading daily reports:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    let matchesDate = true
    if (dateFilter === 'specific') {
      matchesDate = r.date === selectedDate
    } else if (dateFilter === 'today') {
      matchesDate = r.date === today
    } else if (dateFilter === 'yesterday') {
      const y = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      matchesDate = r.date === y
    }

    const matchesSite = selectedSite === 'All' || r.siteId === selectedSite
    return matchesDate && matchesSite
  })

  const handleExport = (format: 'PDF' | 'Excel') => {
    const filterDesc = dateFilter === 'all' ? 'All Dates' : dateFilter === 'specific' ? selectedDate : dateFilter
    setExportNotice(`Generated ${format} Daily Work Report for ${filterDesc} (${filteredReports.length} records). Downloading...`)
    setTimeout(() => setExportNotice(null), 4000)
  }

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSummary.trim()) return

    try {
      await api.createDailyReport({
        siteId: newSiteId,
        date: newDate,
        submittedBy: newSupervisor || null,
        status: 'Approved',
        summary: newSummary,
        consumables: newConsumables || 'Standard cleaning/patrol consumables',
      })
      await loadData()
      setIsModalOpen(false)
      setNewSummary('')
      setNewConsumables('')
      setExportNotice(`Daily Work Report logged and saved to PostgreSQL database!`)
    } catch (err: any) {
      setExportNotice(`Error saving report: ${err.message}`)
    }
    setTimeout(() => setExportNotice(null), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Daily Work Reports (DWR)</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Date-wise site shift summaries, consumables consumption, and supervisor sign-offs
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#26BCEE] text-white text-xs px-3.5 py-2 rounded-lg hover:bg-[#1fa8d8] font-bold shadow-sm transition-all"
          >
            <Plus size={14} /> Submit New DWR
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="font-medium flex items-center gap-2">
            <Check size={14} className="text-emerald-600" /> {exportNotice}
          </span>
          <button onClick={() => setExportNotice(null)} className="text-[11px] underline">Close</button>
        </div>
      )}

      {/* Date-wise Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={15} className="text-[#202B75]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Date Filter:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === 'all' ? 'bg-[#202B75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === 'today' ? 'bg-[#202B75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today (02 Nov)
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === 'yesterday' ? 'bg-[#202B75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yesterday (01 Nov)
            </button>
            <button
              onClick={() => setDateFilter('specific')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === 'specific' ? 'bg-[#202B75] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Select Specific Date
            </button>
          </div>
        </div>

        {/* Date Picker & Site Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {dateFilter === 'specific' && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={13} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-800 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Site:</span>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 font-medium text-gray-700 text-xs focus:outline-none"
            >
              <option value="All">All Active Sites</option>
              {SITES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase">Filtered Reports</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#202B75]">{filteredReports.length}</span>
            <span className="text-[10px] text-gray-400">DWR submissions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">Approved Shift Logs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-700">
              {filteredReports.filter(r => r.status === 'Approved').length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Ready for Billing</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-700 uppercase">Under Review</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">
              {filteredReports.filter(r => r.status === 'Pending').length}
            </span>
            <span className="text-[10px] text-amber-600">Supervisor sign-off</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-[#202B75] uppercase">Reporting Sites</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-[#26BCEE]">
              {new Set(filteredReports.map(r => r.siteId)).size} / {SITES.length}
            </span>
            <span className="text-[10px] text-gray-400">Coverage</span>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Daily Operational Summaries ({filteredReports.length} records)
          </h3>
          <span className="text-[11px] text-gray-400">Synced with GPS Patrol Wand logs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-semibold">
              <tr>
                <th className="text-left px-4 py-3">Report ID</th>
                <th className="text-left px-4 py-3">Work Site & Client</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Submitted By (Supervisor)</th>
                <th className="text-left px-4 py-3">Shift Tasks & Summary</th>
                <th className="text-left px-4 py-3">Consumables Used</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No Daily Work Reports found for selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map(dwr => {
                  const site = SITES.find(s => s.id === dwr.siteId)
                  const client = CLIENTS.find(c => c.id === site?.clientId)
                  const emp = EMPLOYEES.find(e => e.id === dwr.submittedBy)
                  return (
                    <tr key={dwr.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{dwr.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{site?.name || 'Site'}</div>
                        <div className="text-[10px] text-gray-400">{client?.name || 'Client'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-700">{dwr.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{emp?.name || 'Site Supervisor'}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{emp?.phone}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-gray-700 truncate" title={dwr.summary}>
                        {dwr.summary}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600 text-[11px]">
                        {dwr.consumables || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            dwr.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {dwr.status === 'Approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {dwr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewReport({ ...dwr, siteName: site?.name, clientName: client?.name, supervisorName: emp?.name })}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#202B75] hover:text-white text-gray-700 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DWR Details Modal */}
      {viewReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202B75]">DWR Details: {viewReport.id}</h3>
                <p className="text-xs text-gray-400">Date: {viewReport.date} | Site: {viewReport.siteName}</p>
              </div>
              <button onClick={() => setViewReport(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border space-y-1.5">
                <p><span className="text-gray-400 font-semibold">Client Organization:</span> <strong className="text-gray-800">{viewReport.clientName}</strong></p>
                <p><span className="text-gray-400 font-semibold">Supervisor In-Charge:</span> <strong className="text-gray-800">{viewReport.supervisorName}</strong></p>
                <p><span className="text-gray-400 font-semibold">Verification Status:</span> <span className="font-bold text-emerald-700">{viewReport.status}</span></p>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Operational Summary & Completed Tasks:</label>
                <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-800 leading-relaxed font-medium">
                  {viewReport.summary}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Consumables / Materials Consumed:</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono text-[11px]">
                  {viewReport.consumables}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  alert(`Demo: Exporting single DWR PDF for ${viewReport.id}...`)
                }}
                className="px-3 py-1.5 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] flex items-center gap-1.5"
              >
                <Download size={13} /> Download PDF
              </button>
              <button
                onClick={() => setViewReport(null)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New DWR Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAddReport} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202B75]">Log New Daily Work Report</h3>
                <p className="text-xs text-gray-400">Record daily shift activities and facility consumable usage</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deployment Site *</label>
                <select
                  value={newSiteId}
                  onChange={e => setNewSiteId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                >
                  {SITES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Report Date *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Reporting Supervisor *</label>
                <select
                  value={newSupervisor}
                  onChange={e => setNewSupervisor(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                >
                  {EMPLOYEES.slice(0, 5).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Operational Summary & Tasks Completed *</label>
                <textarea
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  rows={3}
                  placeholder="e.g. Completed morning perimeter patrol, waste disposal clearing, CCTV room check..."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#202B75]"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Consumables & Materials Consumed</label>
                <input
                  type="text"
                  value={newConsumables}
                  onChange={e => setNewConsumables(e.target.value)}
                  placeholder="e.g. Disinfectant 2L, Microfiber duster 2 pcs, Trash bags 15 nos"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#202B75] text-white rounded-lg text-xs font-bold hover:bg-[#161f56]"
              >
                Save & Submit DWR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
