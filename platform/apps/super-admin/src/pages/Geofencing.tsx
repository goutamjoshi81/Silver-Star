import { useState } from 'react'
import { SITES, CLIENTS, EMPLOYEES } from '@mock/mockData'
import { MapPin, Circle, Eye, Edit2, X, Radio } from 'lucide-react'

export default function Geofencing() {
  const [selected, setSelected] = useState<string | null>(null)

  const site = SITES.find(s => s.id === selected)
  const client = site ? CLIENTS.find(c => c.id === site.clientId) : null
  const supervisor = site ? EMPLOYEES.find(e => e.id === site.supervisorId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{SITES.length} active work locations</p>
        <button className="flex items-center gap-2 bg-[#202B75] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#161f56] transition-colors">
          <MapPin size={14} /> Add Site
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#f0f2f8] h-48 flex items-center justify-center relative">
          <div className="text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-[#202B75]/30" />
            <p className="text-sm font-medium text-gray-500">Interactive Map View</p>
            <p className="text-xs text-gray-400">Google Maps integration ready for production</p>
          </div>
          {/* Dummy site pins */}
          {SITES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${s.status === 'Active' ? 'bg-[#26BCEE]' : 'bg-gray-400'}`}
              style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordinates</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Geofence Radius</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Strength</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SITES.map(site => {
              const cli = CLIENTS.find(c => c.id === site.clientId)
              return (
                <tr key={site.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#26BCEE]/10 rounded-lg flex items-center justify-center">
                        <Radio className="w-4 h-4 text-[#26BCEE]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{site.name}</p>
                        <p className="text-xs text-gray-400">{site.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{cli?.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#202B75]/10 text-[#202B75] text-xs font-semibold px-2 py-1 rounded-full">
                      {site.geofenceRadius}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-semibold">{site.sanctionedStrength}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${site.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(site.id)} className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Site Detail Modal */}
      {site && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#202B75]">{site.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 mb-0.5">Client</p><p className="font-medium">{client?.name}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${site.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{site.status}</span>
                </div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Address</p><p className="font-medium">{site.address}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Latitude</p><p className="font-mono text-sm">{site.latitude}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Longitude</p><p className="font-mono text-sm">{site.longitude}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Geofence Radius</p><p className="font-semibold">{site.geofenceRadius} metres</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Sanctioned Strength</p><p className="font-semibold">{site.sanctionedStrength} staff</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Supervisor</p><p className="font-medium">{supervisor?.name} ({supervisor?.employeeCode})</p></div>
              </div>

              {/* Geofence visual */}
              <div className="bg-[#f0f2f8] rounded-xl p-6 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#26BCEE]/40 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#26BCEE]/60 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#26BCEE]" />
                    </div>
                  </div>
                  <span className="absolute -bottom-5 text-xs text-gray-400">{site.geofenceRadius}m radius</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

