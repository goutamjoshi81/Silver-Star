import { useState } from 'react'
import { SITES, EMPLOYEES, ATTENDANCE_HISTORY, ATTENDANCE_TODAY } from '@mock/mockData'
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
          onClick={() => alert('Demo: Downloading Client Muster Roll Report (PDF)...')}
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

