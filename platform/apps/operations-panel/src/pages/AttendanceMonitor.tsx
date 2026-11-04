import { ATTENDANCE_TODAY, EMPLOYEES, SITES } from '@mock/mockData'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
export default function AttendanceMonitor() {
  const present = ATTENDANCE_TODAY.filter(a => a.status === 'Present').length
  const absent = ATTENDANCE_TODAY.filter(a => a.status === 'Absent').length
  const late = ATTENDANCE_TODAY.filter(a => a.status === 'Late').length
  return (
    <div className="space-y-5">
      <div><h2 className="text-base font-semibold text-[#202B75]">Live Attendance Monitor</h2><p className="text-xs text-gray-500">Real-time geo-verified punch-in/out across all active sites</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[{label:'Present',count:present,icon:CheckCircle,color:'text-emerald-500',bg:'bg-emerald-50'},{label:'Absent',count:absent,icon:XCircle,color:'text-red-500',bg:'bg-red-50'},{label:'Late Arrival',count:late,icon:AlertCircle,color:'text-amber-500',bg:'bg-amber-50'}].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center`}><k.icon size={20} className={k.color} /></div>
            <div><p className="text-2xl font-bold text-gray-900">{k.count}</p><p className="text-xs text-gray-500">{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100"><tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Punch In</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">GPS</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {ATTENDANCE_TODAY.map(rec => {
              const emp = EMPLOYEES.find(e => e.id === rec.employeeId)
              const site = SITES.find(s => s.id === rec.siteId)
              return (
                <tr key={rec.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{emp?.name}</p><p className="text-xs text-gray-400">{emp?.employeeCode}</p></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{site?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{rec.punchIn || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${rec.gpsVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{rec.gpsVerified ? 'Verified' : 'N/A'}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rec.status==='Present'?'bg-emerald-50 text-emerald-600':rec.status==='Late'?'bg-amber-50 text-amber-600':'bg-red-50 text-red-500'}`}>{rec.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

