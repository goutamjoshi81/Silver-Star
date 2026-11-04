import { useState } from 'react'
import { COMPANY, BRANCHES, SHIFTS, DEPARTMENTS } from '@mock/mockData'
import { Settings as SettingsIcon, Building, Clock, MapPin, Save, Shield } from 'lucide-react'

export default function Settings() {
  const [company, setCompany] = useState(COMPANY)
  const [defaultRadius, setDefaultRadius] = useState(100)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#202B75]">System & Organization Settings</h2>
        <p className="text-xs text-gray-500">Corporate identity, branches, shift configurations & global geofence thresholds</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Building className="w-4 h-4 text-[#202B75]" />
            <h3 className="font-semibold text-gray-900 text-sm">Company Corporate Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Company Full Legal Name</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Short Brand Name</label>
              <input
                type="text"
                value={company.shortName}
                onChange={e => setCompany({ ...company, shortName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Support Official Email</label>
              <input
                type="text"
                value={company.email}
                onChange={e => setCompany({ ...company, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={company.phone}
                onChange={e => setCompany({ ...company, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">GSTIN Number</label>
              <input
                type="text"
                value={company.gstin}
                onChange={e => setCompany({ ...company, gstin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Corporate CIN</label>
              <input
                type="text"
                value={company.cin}
                onChange={e => setCompany({ ...company, cin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#202B75]"
              />
            </div>
          </div>
        </div>

        {/* Global Geofence & Shift Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <MapPin className="w-4 h-4 text-[#202B75]" />
              <h3 className="font-semibold text-gray-900 text-sm">Default GPS Geofencing Rule</h3>
            </div>
            <p className="text-xs text-gray-500">
              Base radial tolerance applied when registering new client work sites.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Default Radius (Meters)</label>
              <input
                type="number"
                value={defaultRadius}
                onChange={e => setDefaultRadius(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Clock className="w-4 h-4 text-[#202B75]" />
              <h3 className="font-semibold text-gray-900 text-sm">Standard Working Shifts</h3>
            </div>
            <div className="space-y-1.5">
              {SHIFTS.map(s => (
                <div key={s.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-500 font-mono">{s.startTime} - {s.endTime} (±{s.gracePeriodMins}m)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              ✓ Settings Updated (Demo)
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] transition-colors shadow-sm"
          >
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
