import { useState } from 'react'
import { INCIDENTS, SITES, EMPLOYEES, CLIENTS } from '@mock/mockData'
import { AlertTriangle, Plus } from 'lucide-react'
export default function IncidentManagement() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.status.toLowerCase() === filter)
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-base font-semibold text-[#202B75]">Incident Management</h2><p className="text-xs text-gray-500">Security breaches, equipment faults, safety events</p></div>
        <button onClick={() => alert('Demo: Log new incident dialog')} className="flex items-center gap-2 bg-[#202B75] text-white text-xs px-4 py-2.5 rounded-lg hover:bg-[#161f56] font-semibold">
          <Plus size={13} /> Log New Incident
        </button>
      </div>
      <div className="flex gap-2">
        {['all','open','in progress','resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${filter===s?'bg-[#202B75] text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(inc => {
          const site = SITES.find(s => s.id === inc.siteId)
          const reporter = EMPLOYEES.find(e => e.id === inc.reportedBy)
          const client = CLIENTS.find(c => c.id === site?.clientId)
          return (
            <div key={inc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${inc.priority==='High'?'bg-red-50':'bg-amber-50'}`}>
                    <AlertTriangle size={16} className={inc.priority==='High'?'text-red-500':'text-amber-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{inc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inc.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{site?.name} · {client?.name} · Reported by: {reporter?.name} · {inc.reportedAt}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inc.priority==='High'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-600'}`}>{inc.priority}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inc.status==='Open'?'bg-red-50 text-red-500':inc.status==='In Progress'?'bg-amber-50 text-amber-600':'bg-emerald-50 text-emerald-600'}`}>{inc.status}</span>
                  <span className="text-[10px] text-gray-400">{inc.category}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {inc.status !== 'Resolved' && <button onClick={() => alert('Demo: Escalating incident...')} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-semibold">Escalate</button>}
                {inc.status !== 'Resolved' && <button onClick={() => alert('Demo: Marking as resolved...')} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-semibold">Mark Resolved</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

