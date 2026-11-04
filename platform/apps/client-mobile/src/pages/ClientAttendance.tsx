import { useState } from 'react'
import { SITES, EMPLOYEES, ATTENDANCE_HISTORY, ATTENDANCE_TODAY, exportToCorporatePdf } from '@mock/mockData'
import { Clock, ShieldCheck, CheckCircle2, AlertTriangle, Download } from 'lucide-react'

export default function ClientAttendance() {
  const clientId = 'CLI001'
  const clientSites = SITES.filter(s => s.clientId === clientId)
  const siteIds = clientSites.map(s => s.id)

  const [filterDate, setFilterDate] = useState<'today' | 'history'>('today')

  const attendanceList = (filterDate === 'today' ? ATTENDANCE_TODAY : ATTENDANCE_HISTORY)
    .filter(a => siteIds.includes(a.siteId))

  return (
    <div className="p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#202B75]">Real-Time Attendance</h2>
          <p className="text-[11px] text-slate-500">Geo-verified punch-in & shift attendance logs</p>
        </div>
        <button
          onClick={() => {
            exportToCorporatePdf({
              title: 'Client Facility Attendance Muster Roll',
              subtitle: 'Daily geo-verified biometric punch-in attendance log for client audit',
              category: 'CLIENT MUSTER RECORD',
              kpis: [
                { label: 'Total Punches', value: attendanceList.length },
                { label: 'Present Staff', value: attendanceList.filter(a => a.status === 'Present').length },
                { label: 'Geofence Verified', value: attendanceList.filter(a => a.gpsVerified).length },
              ],
              columns: [
                { header: 'Sl No', key: 'sl_no', align: 'center' },
                { header: 'Employee Code', key: 'employeeId', format: v => EMPLOYEES.find(e => e.id === v)?.employeeCode || v },
                { header: 'Staff Name', key: 'employeeId', format: v => EMPLOYEES.find(e => e.id === v)?.name || 'Staff' },
                { header: 'Facility / Site', key: 'siteId', format: v => SITES.find(s => s.id === v)?.name || v },
                { header: 'Date', key: 'date', align: 'center' },
                { header: 'Punch In', key: 'punchIn', align: 'center', format: v => v || '—' },
                { header: 'Punch Out', key: 'punchOut', align: 'center', format: v => v || '—' },
                { header: 'GPS Verification', key: 'gpsVerified', align: 'center', format: v => v ? 'Verified Geofence' : 'Standard' },
                { header: 'Status', key: 'status', align: 'center' },
              ],
              data: attendanceList,
              filename: `SilverStar_Client_Muster_${filterDate}_${new Date().toISOString().split('T')[0]}`,
            })
          }}
          className="flex items-center gap-1 bg-[#202B75] text-white text-[11px] px-2.5 py-1.5 rounded-lg font-medium hover:bg-[#161f56] transition-colors"
        >
          <Download size={12} /> Muster PDF
        </button>
      </div>

      {/* Date Toggle */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setFilterDate('today')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            filterDate === 'today' ? 'bg-white text-[#202B75] shadow-sm' : 'text-slate-600'
          }`}
        >
          Today's Live Muster
        </button>
        <button
          onClick={() => setFilterDate('history')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            filterDate === 'history' ? 'bg-white text-[#202B75] shadow-sm' : 'text-slate-600'
          }`}
        >
          Past Shifts Log
        </button>
      </div>

      {/* Attendance Stream List */}
      <div className="space-y-2">
        {attendanceList.map(item => {
          const emp = EMPLOYEES.find(e => e.id === item.employeeId)
          const site = SITES.find(s => s.id === item.siteId)
          const isPresent = item.status === 'Present'
          const isLate = item.status === 'Late'

          return (
            <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">{emp?.name}</h4>
                  <span className="font-mono text-[9px] text-slate-400">({emp?.employeeCode})</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{site?.name} · {item.date}</p>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-600 font-medium">
                  <ShieldCheck size={11} />
                  <span>GPS Geofence Verified</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPresent ? 'bg-emerald-50 text-emerald-700' :
                  isLate ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.status}
                </span>
                <p className="text-[11px] font-mono font-medium text-slate-700">
                  {item.punchIn ? `${item.punchIn} → ${item.punchOut || 'On Duty'}` : 'Not Punched'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

