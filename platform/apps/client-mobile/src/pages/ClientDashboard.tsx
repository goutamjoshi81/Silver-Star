import { CLIENTS, SITES, EMPLOYEES, ATTENDANCE_TODAY } from '@mock/mockData'
import type { TabType } from '../App'
import { Users, UserCheck, UserX, Building2, Clock, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function ClientDashboard({ onNavigate }: { onNavigate: (tab: TabType) => void }) {
  const clientId = 'CLI001' // InfoSys Tech Park
  const client = CLIENTS.find(c => c.id === clientId)
  const clientSites = SITES.filter(s => s.clientId === clientId)
  const siteIds = clientSites.map(s => s.id)

  // Personnel deployed at client premises
  const clientEmployees = EMPLOYEES.filter(e => e.deployedSiteId && siteIds.includes(e.deployedSiteId))
  const clientAttendance = ATTENDANCE_TODAY.filter(a => siteIds.includes(a.siteId))

  const presentCount = clientAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length
  const totalSanctioned = clientSites.reduce((sum, s) => sum + s.sanctionedStrength, 0)
  const totalAssigned = clientEmployees.length
  const absentCount = totalAssigned - presentCount

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#202B75] to-[#2d3d9e] rounded-2xl p-4 text-white shadow-md">
        <p className="text-[11px] text-[#26BCEE] font-medium tracking-wide uppercase">Facility Partner Portal</p>
        <h2 className="text-base font-bold mt-0.5">{client?.name}</h2>
        <p className="text-[11px] text-white/80 mt-1">Electronics City Campus · Bangalore</p>
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-medium">
          <CheckCircle2 size={13} />
          <span>Active Contract: SS-INF-2024-01</span>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => onNavigate('deployment')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#202B75] flex items-center justify-center mb-2">
            <Users size={16} />
          </div>
          <div className="text-xl font-bold text-[#202B75]">{totalAssigned}</div>
          <p className="text-[11px] text-slate-500 font-medium">Deployed Staff</p>
          <p className="text-[9px] text-slate-400 mt-0.5">{totalSanctioned} Sanctioned</p>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <UserCheck size={16} />
          </div>
          <div className="text-xl font-bold text-emerald-600">{presentCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">Present Today</p>
          <p className="text-[9px] text-emerald-600 font-medium mt-0.5">
            {Math.round((presentCount / (totalAssigned || 1)) * 100)}% Coverage
          </p>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2">
            <UserX size={16} />
          </div>
          <div className="text-xl font-bold text-rose-500">{absentCount > 0 ? absentCount : 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Absent Staff</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Relief Available</p>
        </div>

        <div
          onClick={() => onNavigate('sites')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#26BCEE] flex items-center justify-center mb-2">
            <Building2 size={16} />
          </div>
          <div className="text-xl font-bold text-[#202B75]">{clientSites.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Active Locations</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Block A & B</p>
        </div>
      </div>

      {/* Site Strength Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#202B75] uppercase tracking-wider">Campus Locations</h3>
          <button
            onClick={() => onNavigate('sites')}
            className="text-[11px] text-[#26BCEE] font-semibold flex items-center"
          >
            Details <ChevronRight size={12} />
          </button>
        </div>

        {clientSites.map(site => {
          const siteStaff = clientEmployees.filter(e => e.deployedSiteId === site.id)
          const siteAttendance = clientAttendance.filter(a => a.siteId === site.id && (a.status === 'Present' || a.status === 'Late'))
          const pct = Math.round((siteAttendance.length / site.sanctionedStrength) * 100)

          return (
            <div key={site.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{site.name}</span>
                <span className="font-bold text-[#202B75]">
                  {siteAttendance.length} / {site.sanctionedStrength} staff
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#26BCEE] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Radius: {site.geofenceRadius}m GPS</span>
                <span className="font-medium text-emerald-600">{pct}% strength</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Punch Feed Snippet */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#202B75] uppercase tracking-wider">Live Punch Activity</h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Live
          </span>
        </div>

        {clientAttendance.slice(0, 3).map(att => {
          const emp = EMPLOYEES.find(e => e.id === att.employeeId)
          const site = SITES.find(s => s.id === att.siteId)
          return (
            <div key={att.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
              <div>
                <p className="font-semibold text-slate-800">{emp?.name}</p>
                <p className="text-[10px] text-slate-400">{site?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium text-slate-700">{att.punchIn || '--:--'}</p>
                <span className="text-[9px] text-emerald-600 font-semibold">✓ GPS Verified</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
