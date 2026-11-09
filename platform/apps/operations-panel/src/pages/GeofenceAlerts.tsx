import { useState, useEffect } from 'react'
import { SITES, CLIENTS, EMPLOYEES, api } from '@mock/mockData'
import {
  Radio, AlertTriangle, ShieldCheck, MapPin, Sliders, CheckCircle2,
  X, RefreshCw, Compass, Plus, Save, AlertCircle, Info, ExternalLink, Loader2
} from 'lucide-react'

export default function GeofenceControl() {
  const [sitesList, setSitesList] = useState(SITES)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0]?.id || 'SITE001')
  const [activeTab, setActiveTab] = useState<'control' | 'breaches' | 'radar'>('control')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)

  // Fetch live sites from database on mount
  useEffect(() => {
    let isMounted = true
    api.getSites().then(data => {
      if (!isMounted || !data || data.length === 0) return
      setSitesList(data)
      const target = data.find(s => s.id === selectedSiteId) || data[0]
      if (target) {
        setSelectedSiteId(target.id)
        setRadius(target.geofenceRadius || target.geofence_radius || 100)
        setLatitude(Number(target.latitude) || 12.8456)
        setLongitude(Number(target.longitude) || 77.6603)
      }
    }).catch(err => console.warn('Could not fetch sites from API, using fallback:', err))
    return () => { isMounted = false }
  }, [])

  // Selected site settings state
  const currentSite = sitesList.find(s => s.id === selectedSiteId) || sitesList[0]
  const [radius, setRadius] = useState<number>(currentSite?.geofenceRadius || currentSite?.geofence_radius || 100)
  const [latitude, setLatitude] = useState<number>(Number(currentSite?.latitude) || 12.8456)
  const [longitude, setLongitude] = useState<number>(Number(currentSite?.longitude) || 77.6603)
  const [driftTolerance, setDriftTolerance] = useState<'strict' | 'standard' | 'relaxed'>('standard')
  const [antiSpoofing, setAntiSpoofing] = useState<boolean>(true)
  const [enforcementMode, setEnforcementMode] = useState<'block' | 'warn'>('block')

  // When selected site changes, sync form fields
  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId)
    const site = sitesList.find(s => s.id === siteId)
    if (site) {
      setRadius(site.geofenceRadius || site.geofence_radius || 100)
      setLatitude(Number(site.latitude) || 12.8456)
      setLongitude(Number(site.longitude) || 77.6603)
    }
  }

  // Real device GPS capture for gate centroid
  const handleDetectGateLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('GPS Geolocation is not supported by this browser.')
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        const acc = Math.round(pos.coords.accuracy)
        setLatitude(lat)
        setLongitude(lng)
        setDetectingGps(false)
        setFeedback(`✓ Captured live GPS coordinates: ${lat}, ${lng} (Precision: ±${acc}m). Click "Save" below to commit to database.`)
        setTimeout(() => setFeedback(null), 5000)
      },
      (err) => {
        setDetectingGps(false)
        alert(`Could not capture device location: ${err.message}. Please check device GPS and browser location permissions.`)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  const [alerts, setAlerts] = useState([
    { id: 'ALT001', siteId: 'SITE003', time: '09:14 AM', type: 'Geofence Boundary Breach', distance: '185m (Limit 150m)', employee: 'Deepa Verma (EMP006)', status: 'Pending Review' },
    { id: 'ALT002', siteId: 'SITE001', time: '08:50 AM', type: 'Fake GPS / Mock Location Spoofing', distance: 'Root/Mock App detected', employee: 'Vikramaditya (EMP009)', status: 'Blocked by Anti-Spoof' },
    { id: 'ALT003', siteId: 'SITE002', time: '08:32 AM', type: 'Perimeter Boundary Deviation', distance: '95m (Limit 75m)', employee: 'Suresh Babu (EMP003)', status: 'Approved by Supervisor' },
  ])

  // Save geofence parameters to PostgreSQL database
  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await api.updateGeofence(selectedSiteId, {
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofenceRadius: Number(radius),
      })

      setSitesList(prev => prev.map(s => {
        if (s.id === selectedSiteId) {
          return {
            ...s,
            geofenceRadius: Number(radius),
            geofence_radius: Number(radius),
            latitude: Number(latitude),
            longitude: Number(longitude),
          }
        }
        return s
      }))
      setFeedback(`✓ Saved to PostgreSQL: ${currentSite.name} Geofence radius set to ${radius}m at [${latitude}, ${longitude}].`)
    } catch (err: any) {
      console.warn('API error saving geofence, updated locally:', err)
      setFeedback(`✓ Updated locally (Offline fallback): Radius set to ${radius}m for ${currentSite.name}.`)
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: resolution } : a))
    setFeedback(`Alert #${alertId} marked as ${resolution}`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const client = CLIENTS.find(c => c.id === currentSite?.clientId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Operations Geofencing Control Hub</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full GPS boundary management, radius calibration, anti-spoofing enforcement, and real-time perimeter breach monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#202B75]/10 text-[#202B75] flex items-center gap-1.5">
            <Radio size={14} className="text-[#26BCEE]" />
            <strong>{sitesList.length} Active Sites</strong> Geofenced
          </span>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline">Dismiss</button>
        </div>
      )}

      {/* Site Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {sitesList.map(site => {
          const isSelected = site.id === selectedSiteId
          const c = CLIENTS.find(cl => cl.id === site.clientId)
          return (
            <div
              key={site.id}
              onClick={() => handleSiteSelect(site.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#202B75] bg-[#202B75]/5 ring-2 ring-[#202B75]/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold text-gray-400">{site.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {site.geofenceRadius}m Radius
                </span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 truncate">{site.name}</h4>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{c?.name || 'Client'}</p>
              <div className="mt-2 text-[10px] font-mono text-[#202B75] flex items-center gap-1">
                <Compass size={11} /> {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('control')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'control'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Sliders size={14} /> Boundary & Parameter Calibration
        </button>
        <button
          onClick={() => setActiveTab('radar')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'radar'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Compass size={14} /> Interactive Radar & Map View
        </button>
        <button
          onClick={() => setActiveTab('breaches')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'breaches'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <AlertTriangle size={14} /> Breach & Spoof Exceptions ({alerts.filter(a => a.status.includes('Review') || a.status.includes('Blocked')).length})
        </button>
      </div>

      {/* TAB 1: CALIBRATION & CONTROL */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#202B75]">
                  Geofence Calibration: {currentSite.name}
                </h3>
                <p className="text-xs text-gray-400">Client: {client?.name} | Coordinates: {latitude}, {longitude}</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-[#202B75] text-xs font-bold rounded-lg border border-blue-200 font-mono">
                {currentSite.id}
              </span>
            </div>

            {/* Radius Slider */}
            <div className="space-y-2 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800">Geofence Allowed Radius (Meters)</label>
                <span className="text-sm font-extrabold text-[#202B75] bg-white px-3 py-1 rounded-lg border border-gray-200 font-mono">
                  {radius} Meters
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="5"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-[#202B75] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>30m (Tight Gatehouse)</span>
                <span>100m (Standard Facility)</span>
                <span>250m (Large Tech Park)</span>
                <span>500m (Campus)</span>
              </div>
            </div>

            {/* GPS Latitude and Longitude + Live GPS Capture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Geographic Center Coordinates</label>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <ExternalLink size={12} /> View on Google Maps
                  </a>
                  <button
                    type="button"
                    onClick={handleDetectGateLocation}
                    disabled={detectingGps}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-[#202B75] hover:bg-cyan-100 rounded-lg text-xs font-bold transition-all border border-cyan-200"
                  >
                    <Compass size={13} className={detectingGps ? "animate-spin text-cyan-600" : "text-[#26BCEE]"} />
                    {detectingGps ? "Acquiring GPS..." : "Capture Device GPS"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Center Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={e => setLatitude(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Center Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={e => setLongitude(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* GPS Drift Tolerance */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">GPS Satellite Drift Tolerance</label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'strict', label: 'Strict (±5m)', desc: 'High accuracy chips' },
                  { id: 'standard', label: 'Standard (±15m)', desc: 'Recommended default' },
                  { id: 'relaxed', label: 'Relaxed (±30m)', desc: 'Dense high-rise canopy' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDriftTolerance(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      driftTolerance === opt.id
                        ? 'border-[#202B75] bg-blue-50/50 text-[#202B75] font-bold'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-xs">{opt.label}</p>
                    <p className="text-[10px] text-gray-400 font-normal">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div className="border border-gray-200 rounded-xl p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="antiSpoof"
                  checked={antiSpoofing}
                  onChange={e => setAntiSpoofing(e.target.checked)}
                  className="mt-1 accent-[#202B75]"
                />
                <div>
                  <label htmlFor="antiSpoof" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Mock GPS Anti-Spoofing Detection
                  </label>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Automatically rejects punches originating from developer mode fake location apps.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="blockEnforcement"
                  checked={enforcementMode === 'block'}
                  onChange={e => setEnforcementMode(e.target.checked ? 'block' : 'warn')}
                  className="mt-1 accent-[#202B75]"
                />
                <div>
                  <label htmlFor="blockEnforcement" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Strict Boundary Enforcement
                  </label>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Hard-lock punch button when employee GPS is outside perimeter.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#202B75] hover:bg-[#161f56] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving to PostgreSQL...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save Geofence Parameters
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Info & Statistics */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3 text-xs">
              <h4 className="font-bold text-gray-800 uppercase text-[11px] tracking-wide">Perimeter Health Check</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Live Boundary Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active & Secured
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Sanctioned Manpower:</span>
                  <span className="font-bold text-gray-800">{currentSite.sanctionedStrength} Officers</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Anti-Spoofing:</span>
                  <span className={`font-bold ${antiSpoofing ? 'text-emerald-700' : 'text-red-600'}`}>
                    {antiSpoofing ? 'Armored' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Enforcement Action:</span>
                  <span className="font-mono font-bold text-[#202B75]">
                    {enforcementMode === 'block' ? 'Strict Hard-Lock' : 'Soft Flag'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#202B75] to-[#121a4e] text-white rounded-2xl p-5 shadow-sm space-y-2 text-xs">
              <h4 className="font-bold text-[#26BCEE] flex items-center gap-1.5">
                <ShieldCheck size={16} /> Indian Statutory & Labor Compliance
              </h4>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                All geofence punches record GPS latitude, longitude, reverse-geocoded address, and carrier cell ID to create tamper-proof muster rolls for statutory compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE RADAR / MAP VIEW */}
      {activeTab === 'radar' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#202B75]">Simulated GPS Radar: {currentSite.name}</h3>
              <p className="text-xs text-gray-400">Radius: {radius}m | Center Lat/Lng: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg font-mono">
              GPS Signal: Excellent (12 Sats locked)
            </span>
          </div>

          {/* Interactive Radar Graphic */}
          <div className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Concentric Geofence Rings */}
            <div className="absolute w-64 h-64 border border-[#26BCEE]/20 rounded-full animate-ping duration-1000"></div>
            <div className="absolute w-52 h-52 border border-[#26BCEE]/40 rounded-full"></div>
            <div className="absolute w-36 h-36 border-2 border-emerald-500/60 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                Authorized Zone ({radius}m)
              </span>
            </div>

            {/* Crosshairs */}
            <div className="absolute inset-x-0 h-[1px] bg-white/10"></div>
            <div className="absolute inset-y-0 w-[1px] bg-white/10"></div>

            {/* Center Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 bg-[#26BCEE] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold text-white mt-1 bg-black/70 px-2 py-0.5 rounded">
                Site Center Pin
              </span>
            </div>

            {/* Inside Boundary Officer Pin */}
            <div className="absolute top-28 left-44 z-10 flex flex-col items-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full border border-white shadow flex items-center justify-center text-[9px] font-bold text-white">
                ✓
              </div>
              <span className="text-[9px] font-mono text-emerald-300 bg-slate-950/90 px-1.5 py-0.2 rounded mt-0.5">
                EMP001 (Inside, 35m)
              </span>
            </div>

            {/* Outside Boundary Breach Pin */}
            <div className="absolute top-12 right-24 z-10 flex flex-col items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full border border-white shadow animate-bounce flex items-center justify-center text-[9px] font-bold text-white">
                !
              </div>
              <span className="text-[9px] font-mono text-red-300 bg-red-950/90 px-1.5 py-0.2 rounded mt-0.5">
                EMP006 (Breach, 185m)
              </span>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[10px] text-gray-300 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Authorized Punch
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Boundary Breach (&gt;{radius}m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#26BCEE] inline-block"></span> Center Geo-Coordinate
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BREACH EXCEPTIONS */}
      {activeTab === 'breaches' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Logged Perimeter & Spoofing Exceptions ({alerts.length})
            </h3>
            <span className="text-[11px] text-gray-400">Recorded by Mobile GPS Engine</span>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {alerts.map(a => {
              const site = sitesList.find(s => s.id === a.siteId)
              const isBlocked = a.status.includes('Blocked')
              const isPending = a.status.includes('Review')

              return (
                <div key={a.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/60">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      a.type.includes('Spoof') ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{a.type}</span>
                        <span className="font-mono text-[10px] text-gray-400">{a.time}</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{a.employee} · Recorded at <strong className="text-gray-800">{site?.name}</strong></p>
                      <p className="text-[11px] font-mono text-gray-500 mt-0.5">Deviation Metric: <strong>{a.distance}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isBlocked ? 'bg-red-50 text-red-700 border border-red-200' :
                      isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {a.status}
                    </span>

                    {isPending && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleResolveAlert(a.id, 'Approved as Field Deviation')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleResolveAlert(a.id, 'Flagged as Unauthorized Absence')}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-semibold hover:bg-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
