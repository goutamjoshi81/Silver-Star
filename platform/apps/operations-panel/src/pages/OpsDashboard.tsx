import { SITES, CLIENTS, EMPLOYEES, ATTENDANCE_TODAY, INCIDENTS, DASHBOARD_KPIS } from '@mock/mockData'
import { MapPin, Users, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react'

export default function OpsDashboard() {
  const deployed = EMPLOYEES.filter(e => e.deployedSiteId !== null).length
  const present = ATTENDANCE_TODAY.filter(a => a.status === 'Present').length
  const openIncidents = INCIDENTS.filter(i => i.status === 'Open').length

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Sites', value: SITES.length, icon: MapPin, color: 'bg-[#202B75]' },
          { label: 'Staff Deployed', value: deployed, icon: Truck, color: 'bg-emerald-600' },
          { label: 'Present Today', value: present, icon: CheckCircle, color: 'bg-[#26BCEE]' },
          { label: 'Open Incidents', value: openIncidents, icon: AlertTriangle, color: 'bg-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}><Icon size={16} className="text-white" /></div>
            <div className="text-2xl font-bold text-[#202B75]">{value}</div>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Site Strength Overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#202B75] mb-4 flex items-center gap-2"><MapPin size={16} /> Live Site Strength Overview</h2>
        <div className="space-y-3">
          {SITES.map(site => {
            const client = CLIENTS.find(c => c.id === site.clientId)
            const present = ATTENDANCE_TODAY.filter(a => a.siteId === site.id && a.status === 'Present').length
            const strength = site.sanctionedStrength
            const pct = Math.round((present / strength) * 100)
            const isLow = present < strength * 0.8
            return (
              <div key={site.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{site.name}</p>
                    <p className="text-xs text-gray-400">{client?.name} · {site.address}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-emerald-600'}`}>{present}/{strength}</span>
                    <p className="text-xs text-gray-400">staff present</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {isLow && <p className="text-xs text-red-500 mt-1.5 font-medium">⚠ Below sanctioned strength — {strength - present} staff shortage</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#202B75] mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Open Incidents</h2>
        {INCIDENTS.filter(i => i.status !== 'Resolved').map(inc => (
          <div key={inc.id} className="border border-gray-100 rounded-xl p-4 mb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{inc.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{inc.description}</p>
                <p className="text-xs text-gray-400 mt-1">{SITES.find(s => s.id === inc.siteId)?.name} · {inc.reportedAt}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inc.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{inc.priority}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${inc.status === 'Open' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{inc.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

