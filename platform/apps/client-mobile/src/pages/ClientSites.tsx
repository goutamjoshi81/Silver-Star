import { SITES, CLIENTS, EMPLOYEES } from '@mock/mockData'
import { MapPin, Radio, Users, Phone } from 'lucide-react'

export default function ClientSites() {
  const clientId = 'CLI001'
  const clientSites = SITES.filter(s => s.clientId === clientId)

  return (
    <div className="p-4 space-y-3.5">
      <div>
        <h2 className="text-sm font-bold text-[#202B75]">Contracted Campus Sites</h2>
        <p className="text-[11px] text-slate-500">Geofence boundaries & sanctioned workforce strength</p>
      </div>

      <div className="space-y-3">
        {clientSites.map(site => {
          const supervisor = EMPLOYEES.find(e => e.id === site.supervisorId)
          const deployedCount = EMPLOYEES.filter(e => e.deployedSiteId === site.id).length

          return (
            <div key={site.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{site.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{site.address}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                  {site.status}
                </span>
              </div>

              {/* Coordinates & Geofence Box */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Radio size={14} className="text-[#26BCEE]" />
                  <span>Geofence Radius:</span>
                </div>
                <span className="font-bold font-mono text-[#202B75]">{site.geofenceRadius} meters</span>
              </div>

              {/* Headcount Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <p className="text-[10px] text-slate-400">Sanctioned Staff</p>
                  <p className="font-bold text-[#202B75] mt-0.5">{site.sanctionedStrength} positions</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <p className="text-[10px] text-slate-400">Active Deployed</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{deployedCount} staff on-site</p>
                </div>
              </div>

              {/* Site Supervisor Card */}
              {supervisor && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400">Assigned Silver Star Supervisor:</span>
                    <p className="font-semibold text-slate-800">{supervisor.name}</p>
                  </div>
                  <a
                    href={`tel:${supervisor.phone}`}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#202B75] bg-[#202B75]/10 px-2 py-1 rounded-lg"
                  >
                    <Phone size={11} /> Call
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

