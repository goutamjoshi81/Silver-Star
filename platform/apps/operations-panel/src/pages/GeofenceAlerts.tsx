import { useState, useEffect } from 'react'
import { SITES, CLIENTS, EMPLOYEES, api } from '@mock/mockData'
import {
  Radio, AlertTriangle, ShieldCheck, MapPin, Sliders, CheckCircle2,
  X, RefreshCw, Compass, Plus, Save, AlertCircle, Info, ExternalLink, Loader2,
  Search, Check, Building, AlertOctagon, Calendar
} from 'lucide-react'

export default function GeofenceControl() {
  const [sitesList, setSitesList] = useState<any[]>(SITES)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0]?.id || 'SITE001')
  const [activeTab, setActiveTab] = useState<'control' | 'radar' | 'breaches'>('control')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)

  // Top Search State
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Add Manual Geofence Location Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingLocation, setCreatingLocation] = useState(false)
  const [detectingModalGps, setDetectingModalGps] = useState(false)
  const [manualForm, setManualForm] = useState({
    name: '',
    clientId: CLIENTS[0]?.id || 'CLI001',
    address: '',
    latitude: 12.8456,
    longitude: 77.6603,
    geofenceRadius: 150,
    siteType: 'Permanent' as 'Permanent' | 'Temporary' | 'Emergency' | 'Patrol Checkpoint',
    sanctionedStrength: 6,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
  })

  // Fetch live sites from database on mount
  useEffect(() => {
    let isMounted = true
    api.getSites().then(data => {
      if (!isMounted || !data || data.length === 0) return
      setSitesList(data)
      const target = data.find(s => s.id === selectedSiteId) || data[0]
      if (target) {
        setSelectedSiteId(target.id)
        setRadius(target.geofenceRadius || (target as any).geofence_radius || 100)
        setLatitude(Number(target.latitude) || 12.8456)
        setLongitude(Number(target.longitude) || 77.6603)
      }
    }).catch(err => console.warn('Could not fetch sites from API, using fallback:', err))

    return () => { isMounted = false }
  }, [])

  // Selected site settings state
  const currentSite: any = sitesList.find(s => s.id === selectedSiteId) || sitesList[0] || {
    id: 'SITE001',
    name: 'Main Campus',
    geofenceRadius: 100,
    latitude: 12.8456,
    longitude: 77.6603,
    sanctionedStrength: 10,
    clientId: 'CLI001',
    siteType: 'Permanent',
    isEmergency: false,
    status: 'Active'
  }
  const [radius, setRadius] = useState<number>(currentSite?.geofenceRadius || 100)
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
      setRadius(site.geofenceRadius || (site as any).geofence_radius || 100)
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

  // 1-Click GPS capture for new location modal
  const handleDetectModalGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('GPS Geolocation is not supported by this browser.')
      return
    }
    setDetectingModalGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        const acc = Math.round(pos.coords.accuracy)
        setManualForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))
        setDetectingModalGps(false)
        setFeedback(`✓ GPS Centroid captured: ${lat}, ${lng} (±${acc}m)`)
        setTimeout(() => setFeedback(null), 4000)
      },
      (err) => {
        setDetectingModalGps(false)
        alert(`Could not capture location: ${err.message}`)
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

  // Handle Manual Geofence Location Creation
  const handleCreateManualLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.name.trim()) {
      alert('Please enter a location/site name.')
      return
    }

    setCreatingLocation(true)
    try {
      const isEmergency = manualForm.siteType === 'Emergency'
      const payload = {
        name: manualForm.name.trim(),
        clientId: manualForm.clientId,
        address: manualForm.address || `${manualForm.name}, Campus Location`,
        latitude: Number(manualForm.latitude),
        longitude: Number(manualForm.longitude),
        geofenceRadius: Number(manualForm.geofenceRadius),
        sanctionedStrength: Number(manualForm.sanctionedStrength),
        siteType: manualForm.siteType,
        isEmergency,
        emergencyNotes: manualForm.notes,
        validFrom: manualForm.validFrom,
        validUntil: manualForm.validUntil,
        status: 'Active',
      }

      const res = isEmergency
        ? await api.createEmergencyGeofence(payload)
        : await api.createSite(payload)

      const created = res?.site || res || {
        id: `SITE_${Date.now()}`,
        ...payload,
      }

      setSitesList(prev => [created, ...prev])
      setSelectedSiteId(created.id)
      setRadius(created.geofenceRadius || 150)
      setLatitude(Number(created.latitude))
      setLongitude(Number(created.longitude))
      setShowAddModal(false)
      setFeedback(`✓ Successfully created and saved new geofence location: "${manualForm.name}".`)

      // Reset form
      setManualForm({
        name: '',
        clientId: CLIENTS[0]?.id || 'CLI001',
        address: '',
        latitude: 12.8456,
        longitude: 77.6603,
        geofenceRadius: 150,
        siteType: 'Permanent',
        sanctionedStrength: 6,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: '',
      })
    } catch (err: any) {
      console.warn('API error creating site, saving to local state:', err)
      const fallbackSite = {
        id: `SITE_${Date.now()}`,
        name: manualForm.name,
        clientId: manualForm.clientId,
        address: manualForm.address || manualForm.name,
        latitude: Number(manualForm.latitude),
        longitude: Number(manualForm.longitude),
        geofenceRadius: Number(manualForm.geofenceRadius),
        sanctionedStrength: Number(manualForm.sanctionedStrength),
        siteType: manualForm.siteType,
        isEmergency: manualForm.siteType === 'Emergency',
        status: 'Active',
      }
      setSitesList(prev => [fallbackSite, ...prev])
      setSelectedSiteId(fallbackSite.id)
      setShowAddModal(false)
      setFeedback(`✓ Created geofence location: "${manualForm.name}" (Cached).`)
    } finally {
      setCreatingLocation(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: resolution } : a))
    setFeedback(`Alert #${alertId} marked as ${resolution}`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const client = CLIENTS.find(c => c.id === currentSite?.clientId)

  // Filter sites based on top search query
  const filteredSites = sitesList.filter(site => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const nameMatch = site.name?.toLowerCase().includes(q)
    const idMatch = site.id?.toLowerCase().includes(q)
    const addrMatch = site.address?.toLowerCase().includes(q)
    const cl = CLIENTS.find(c => c.id === site.clientId)
    const clientMatch = cl?.name?.toLowerCase().includes(q)
    const typeMatch = site.siteType?.toLowerCase().includes(q)
    return nameMatch || idMatch || addrMatch || clientMatch || typeMatch
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Operations Geofencing Control Hub</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full GPS boundary management, radius calibration, anti-spoofing enforcement, and real-time perimeter breach monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add New Geofence Location Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl text-xs font-bold shadow-md shadow-[#202B75]/20 transition-all cursor-pointer"
          >
            <Plus size={15} />
            + Add New Geofence Location
          </button>

          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#202B75]/10 text-[#202B75] flex items-center gap-1.5">
            <Radio size={14} className="text-[#26BCEE]" />
            <strong>{sitesList.length} Active Sites</strong>
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

      {/* Top Search Bar & Location Finder */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search geofence by location name, corporate client, site ID, or address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#202B75] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => {}}
          className="px-4 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Search size={14} />
          <span>Search</span>
        </button>
      </div>

      {/* Site Selector Cards */}
      {filteredSites.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 space-y-2">
          <MapPin size={32} className="mx-auto text-gray-300 stroke-1" />
          <p className="font-semibold text-gray-700">No geofence location found matching "{searchQuery}"</p>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs"
            >
              Clear Search
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1 bg-[#202B75] text-white rounded-lg font-bold text-xs"
            >
              + Add This Location
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredSites.map(site => {
            const isSelected = site.id === selectedSiteId
            const c = CLIENTS.find(cl => cl.id === site.clientId)
            const isEmergency = site.isEmergency || site.siteType === 'Emergency'
            const isTemp = site.siteType === 'Temporary'

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
                  <div className="flex items-center gap-1">
                    {isEmergency && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 text-red-700">EMG</span>
                    )}
                    {isTemp && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">TEMP</span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {site.geofenceRadius || (site as any).geofence_radius || 100}m Radius
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-gray-900 truncate">{site.name}</h4>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{c?.name || 'Client Site'}</p>
                <div className="mt-2 text-[10px] font-mono text-[#202B75] flex items-center gap-1">
                  <Compass size={11} /> {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Classic 3 Tabs */}
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

      {/* ========================================================================= */}
      {/* TAB 1: CALIBRATION & CONTROL */}
      {/* ========================================================================= */}
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
              <div className="flex items-center gap-1.5">
                {currentSite.isEmergency && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200">
                    EMERGENCY
                  </span>
                )}
                <span className="px-2.5 py-1 bg-blue-50 text-[#202B75] text-xs font-bold rounded-lg border border-blue-200 font-mono">
                  {currentSite.id}
                </span>
              </div>
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
                <span>30m (Strict Gatehouse)</span>
                <span>150m (Standard Campus)</span>
                <span>500m (Large Industrial Park)</span>
              </div>
            </div>

            {/* Coordinates Manual & Device Detection */}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-[#202B75] hover:bg-cyan-100 rounded-lg text-xs font-bold transition-all border border-cyan-200 cursor-pointer"
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
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Center Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={e => setLongitude(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Enforcement & Drift Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">GPS Drift Tolerance</label>
                <select
                  value={driftTolerance}
                  onChange={e => setDriftTolerance(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-800"
                >
                  <option value="strict">Strict (±10m)</option>
                  <option value="standard">Standard (±25m)</option>
                  <option value="relaxed">Relaxed (±50m - Monsoons)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">Anti-Spoofing Hard Lock</label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-500 font-medium">{antiSpoofing ? 'Mock GPS Blocked' : 'Off'}</span>
                  <input
                    type="checkbox"
                    checked={antiSpoofing}
                    onChange={e => setAntiSpoofing(e.target.checked)}
                    className="w-4 h-4 accent-[#202B75] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">Out-of-Fence Punch Policy</label>
                <select
                  value={enforcementMode}
                  onChange={e => setEnforcementMode(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-800"
                >
                  <option value="block">Hard Block (Reject Attendance)</option>
                  <option value="warn">Soft Warn (Flag for Operations)</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#202B75] hover:bg-[#161f56] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
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

          {/* Quick Info & Health Stats */}
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
                  <span className="font-bold text-gray-800">{currentSite.sanctionedStrength || 6} Officers</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Site Classification:</span>
                  <span className="font-bold text-[#202B75]">{currentSite.siteType || 'Permanent'}</span>
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

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE RADAR / MAP VIEW */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* TAB 3: BREACH EXCEPTIONS */}
      {/* ========================================================================= */}
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
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleResolveAlert(a.id, 'Flagged as Unauthorized Absence')}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-semibold hover:bg-red-100 cursor-pointer"
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

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW GEOFENCE LOCATION MANUALLY */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#202B75] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={20} className="text-[#26BCEE]" />
                <div>
                  <h3 className="font-bold text-sm">Add New Geofencing Location</h3>
                  <p className="text-[11px] text-white/80">Configure GPS centroid coordinates, permitted radius, and boundary policy</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualLocation} className="p-6 space-y-4 text-xs">
              {/* Classification */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Location Classification *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Permanent', label: 'Permanent Site', desc: 'Main Campus / Facility' },
                    { type: 'Temporary', label: 'Temporary Event', desc: 'VIP / Short Deployment' },
                    { type: 'Emergency', label: 'Emergency Site', desc: 'Critical / Crisis Post' }
                  ].map(item => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setManualForm(prev => ({ ...prev, siteType: item.type as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        manualForm.siteType === item.type
                          ? 'border-[#202B75] bg-blue-50/70 text-[#202B75] ring-2 ring-[#202B75]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <p className="font-extrabold text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Name & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Geofence Location / Site Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prestige Tech Cloud - Gate 2"
                    value={manualForm.name}
                    onChange={e => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Associated Corporate Client *</label>
                  <select
                    value={manualForm.clientId}
                    onChange={e => setManualForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold bg-white"
                  >
                    {CLIENTS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Physical Address / Gatehouse Description</label>
                <input
                  type="text"
                  placeholder="e.g. Outer Ring Road, Bellandur, Bangalore"
                  value={manualForm.address}
                  onChange={e => setManualForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              {/* Manual Coordinates & 1-Click Detect GPS */}
              <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Compass size={14} className="text-[#202B75]" />
                    Manual Geofence Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectModalGps}
                    disabled={detectingModalGps}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 hover:border-[#202B75] text-[#202B75] font-bold rounded-lg text-[11px] shadow-sm transition-all cursor-pointer"
                  >
                    {detectingModalGps ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-[#202B75]" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Compass size={12} className="text-[#26BCEE]" />
                        🎯 Detect My Device GPS
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Latitude (Decimal)</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={manualForm.latitude}
                      onChange={e => setManualForm(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Longitude (Decimal)</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={manualForm.longitude}
                      onChange={e => setManualForm(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Radius & Sanctioned Officers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-700">Permitted Geofence Radius</label>
                    <span className="font-mono font-bold text-[#202B75]">{manualForm.geofenceRadius} Meters</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    step="5"
                    value={manualForm.geofenceRadius}
                    onChange={e => setManualForm(prev => ({ ...prev, geofenceRadius: Number(e.target.value) }))}
                    className="w-full accent-[#202B75] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>30m (Strict)</span>
                    <span>150m (Standard)</span>
                    <span>500m (Large)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sanctioned Staff Strength</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={manualForm.sanctionedStrength}
                    onChange={e => setManualForm(prev => ({ ...prev, sanctionedStrength: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl p-2 font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Guards & housekeepers sanctioned for post</p>
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location Notes & Perimeter Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Main visitor entry barrier with ANPR camera and turnstiles."
                  value={manualForm.notes}
                  onChange={e => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLocation}
                  className="px-5 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#202B75]/20 cursor-pointer"
                >
                  {creatingLocation ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving Location...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Commit Location to Database
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
