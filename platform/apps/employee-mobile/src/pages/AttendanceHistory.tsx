import { ATTENDANCE_HISTORY, SITES } from '@mock/mockData'
import { Calendar, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function AttendanceHistory() {
  const empId = 'EMP001'
  const myHistory = ATTENDANCE_HISTORY.filter(a => a.employeeId === empId)

  const presentDays = myHistory.filter(a => a.status === 'Present').length
  const lateDays = myHistory.filter(a => a.status === 'Late').length

  return (
    <div className="p-4 space-y-3.5">
      <div>
        <h2 className="text-sm font-bold text-[#202B75]">My Attendance Muster</h2>
        <p className="text-[11px] text-slate-500">Current billing & pay cycle duty logs</p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400">Total Shifts</p>
          <p className="text-base font-bold text-[#202B75] mt-0.5">{myHistory.length}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400">On Time</p>
          <p className="text-base font-bold text-emerald-600 mt-0.5">{presentDays}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400">Late In</p>
          <p className="text-base font-bold text-amber-500 mt-0.5">{lateDays}</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {myHistory.map(rec => {
          const site = SITES.find(s => s.id === rec.siteId)
          const isPresent = rec.status === 'Present'

          return (
            <div key={rec.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#26BCEE]" />
                  <span className="font-bold text-xs text-slate-900">{rec.date}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{site?.name}</p>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-600 font-semibold">
                  <ShieldCheck size={11} />
                  <span>GPS Geo-Stamped</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {rec.status}
                </span>
                <p className="text-xs font-mono font-medium text-slate-700">
                  {rec.punchIn || '--:--'} → {rec.punchOut || '--:--'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

