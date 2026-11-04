import { useState, useEffect } from 'react'
import { EMPLOYEES, SITES, api, exportToCorporateExcel, exportToCorporatePdf } from '@mock/mockData'
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, Download, FileSpreadsheet } from 'lucide-react'

export default function Attendance() {
  const [tab, setTab] = useState<'today' | 'history'>('today')
  const [todayRecords, setTodayRecords] = useState<any[]>([])
  const [historyRecords, setHistoryRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>(EMPLOYEES)
  const [sites, setSites] = useState<any[]>(SITES)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      api.getAttendance({ date: today }).catch(() => []),
      api.getAttendance().catch(() => []),
      api.getEmployees().catch(() => []),
      api.getSites().catch(() => []),
    ]).then(([td, hist, emps, sts]) => {
      setTodayRecords(td || [])
      setHistoryRecords(hist || [])
      if (emps && emps.length > 0) setEmployees(emps)
      if (sts && sts.length > 0) setSites(sts)
    })
  }, [])

  const records = tab === 'today' ? todayRecords : historyRecords

  const getEmp = (id: string) => employees.find(e => e.id === id) || EMPLOYEES.find(e => e.id === id)
  const getSite = (id: string) => sites.find(s => s.id === id)?.name || SITES.find(s => s.id === id)?.name || '—'

  const present = todayRecords.filter(a => a.status === 'Present').length
  const absent = todayRecords.filter(a => a.status === 'Absent').length
  const late = todayRecords.filter(a => a.status === 'Late').length

  const handleExportAttendance = (format: 'PDF' | 'Excel') => {
    const isToday = tab === 'today'
    const title = isToday ? "Today's Live Geofenced Attendance Muster" : "Historical Facility Attendance Muster Roll"
    const options = {
      title,
      subtitle: `Certified muster report for ${isToday ? 'current operational shift' : 'past billing cycles'}`,
      category: 'STATUTORY MUSTER AUDIT',
      kpis: [
        { label: 'Total Records', value: records.length },
        { label: 'Present Staff', value: records.filter(r => r.status === 'Present').length },
        { label: 'Late Arrivals', value: records.filter(r => r.status === 'Late').length },
        { label: 'Absent Staff', value: records.filter(r => r.status === 'Absent').length },
      ],
      columns: [
        { header: 'Sl No', key: 'sl_no', align: 'center' as const },
        { header: 'Emp Code', key: 'employeeId', format: (v: any) => getEmp(v)?.employeeCode || v },
        { header: 'Employee Name', key: 'employeeId', format: (v: any) => getEmp(v)?.name || 'Staff' },
        { header: 'Work Location / Site', key: 'siteId', format: (v: any) => getSite(v) },
        { header: 'Date', key: 'date', align: 'center' as const },
        { header: 'Punch In', key: 'punchIn', align: 'center' as const, format: (v: any) => v || '—' },
        { header: 'Punch Out', key: 'punchOut', align: 'center' as const, format: (v: any) => v || '—' },
        { header: 'GPS Verification', key: 'gpsVerified', align: 'center' as const, format: (v: any) => v ? 'Verified Geofence' : 'Standard' },
        { header: 'Status', key: 'status', align: 'center' as const },
      ],
      data: records,
      filename: `SilverStar_Attendance_${tab}_${new Date().toISOString().split('T')[0]}`,
    }

    if (format === 'Excel') {
      exportToCorporateExcel(options)
    } else {
      exportToCorporatePdf(options)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{present}</p><p className="text-xs text-gray-500">Present Today</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><XCircle className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{absent}</p><p className="text-xs text-gray-500">Absent Today</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{late}</p><p className="text-xs text-gray-500">Late Arrivals</p></div>
        </div>
      </div>

      {/* Tabs and Action Buttons */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-2">
          <button onClick={() => setTab('today')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'today' ? 'border-[#202B75] text-[#202B75]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Today's Attendance
          </button>
          <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'history' ? 'border-[#202B75] text-[#202B75]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Historical Records
          </button>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => handleExportAttendance('PDF')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] transition-colors shadow-sm"
          >
            <Download size={13} /> Export Muster PDF
          </button>
          <button
            onClick={() => handleExportAttendance('Excel')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={13} /> Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Punch In</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Punch Out</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">GPS Verified</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No attendance records recorded yet. Punch in from Employee Mobile to record attendance.
                </td>
              </tr>
            ) : (
              records.map(rec => {
                const emp = getEmp(rec.employeeId)
                return (
                  <tr key={rec.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{emp?.name || rec.employeeName || rec.employeeId}</p>
                      <p className="text-xs text-gray-400">{emp?.employeeCode || rec.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{getSite(rec.siteId)}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{rec.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{rec.punchIn || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{rec.punchOut || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.gpsVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {rec.gpsVerified ? '✓ Geofence Verified' : '✗ Failed Geofence'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                        rec.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                      }`}>{rec.status}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
