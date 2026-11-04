import { useState } from 'react'
import { NOTIFICATIONS } from '@mock/mockData'
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Check } from 'lucide-react'

export default function Notifications() {
  const [list, setList] = useState(NOTIFICATIONS)

  const markAllRead = () => {
    setList(list.map(n => ({ ...n, read: true })))
  }

  const toggleRead = (id: string) => {
    setList(list.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#202B75]">System Alerts & Broadcasts</h2>
          <p className="text-xs text-gray-500">Real-time geofence breaches, KYC alerts, compliance deadlines & operational notifications</p>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
        >
          <Check size={14} /> Mark All as Read
        </button>
      </div>

      <div className="space-y-2.5">
        {list.map(n => {
          const isError = n.type === 'error'
          const isWarning = n.type === 'warning'
          return (
            <div
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                n.read
                  ? 'bg-white border-gray-100 opacity-70'
                  : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isError ? 'bg-red-50 text-red-600' :
                isWarning ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#26BCEE]'
              }`}>
                {isError ? <AlertCircle size={16} /> :
                 isWarning ? <AlertTriangle size={16} /> : <Info size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-[#26BCEE] self-center flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
