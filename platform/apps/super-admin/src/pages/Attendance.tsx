import { useState } from 'react'
import { ATTENDANCE_TODAY, ATTENDANCE_HISTORY, EMPLOYEES, SITES } from '@mock/mockData'
import { Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'

export default function Attendance() {
  const [tab, setTab] = useState<'today' | 'history'>('today')

  const records = tab === 'today' ? ATTENDANCE_TODAY : ATTENDANCE_HISTORY

  const getEmp = (id: string) => EMPLOYEES.find(e => e.id === id)
  const getSite = (id: string) => SITES.find(s => s.id === id)?.name || '—'

  const present = ATTENDANCE_TODAY.filter(a => a.status === 'Present').length
  const absent = ATTENDANCE_TODAY.filter(a => a.status === 'Absent').length
  const late = ATTENDANCE_TODAY.filter(a => a.status === 'Late').length

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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('today')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'today' ? 'border-[#202B75] text-[#202B75]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Today's Attendance
        </button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'history' ? 'border-[#202B75] text-[#202B75]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          History
        </button>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">GPS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map(rec => {
              const emp = getEmp(rec.employeeId)
              return (
                <tr key={rec.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{emp?.name || rec.employeeId}</p>
                    <p className="text-xs text-gray-400">{emp?.employeeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{getSite(rec.siteId)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{rec.date}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs ${rec.punchIn ? 'text-gray-800' : 'text-gray-300'}`}>
                      {rec.punchIn || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs ${rec.punchOut ? 'text-gray-800' : 'text-gray-300'}`}>
                      {rec.punchOut || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rec.gpsVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {rec.gpsVerified ? 'Verified' : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                      rec.status === 'Late' ? 'bg-amber-50 text-amber-600' :
                      rec.status === 'Absent' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                    }`}>{rec.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

