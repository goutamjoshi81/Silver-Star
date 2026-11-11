import { useState, useEffect } from 'react'
import { SITES, CLIENTS, EMPLOYEES, PATROL_LOGS, PATROL_CHECKPOINTS, api } from '@mock/mockData'
import {
  Radio, AlertTriangle, ShieldCheck, MapPin, Sliders, CheckCircle2,
  X, RefreshCw, Compass, Plus, Save, AlertCircle, Info, ExternalLink, Loader2,
  Moon, Camera, AlertOctagon, Calendar, Eye, Shield, Users, Check, Filter,
  Clock, Navigation
} from 'lucide-react'

export default function GeofenceControl() {
  const [sitesList, setSitesList] = useState<any[]>(SITES)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0]?.id || 'SITE001')
  const [activeTab, setActiveTab] = useState<'control' | 'breaches' | 'radar' | 'patrols'>('control')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)

  // Night Patrol Logs State
  const [patrolLogs, setPatrolLogs] = useState<any[]>(PATROL_LOGS)
  const [patrolFilterShift, setPatrolFilterShift] = useState<string>('ALL')
  const [patrolFilterStatus, setPatrolFilterStatus] = useState<string>('ALL')
  const [loadingPatrols, setLoadingPatrols] = useState<boolean>(false)

  // Photo Lightbox Modal
  const [photoModal, setPhotoModal] = useState<{
    url: string
    title: string
    checkpoint: string
    officer: string
    time: string
    isVerified: boolean
    notes?: string
  } | null>(null)

  // Emergency / Temporary Geofence Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [creatingSite, setCreatingSite] = useState(false)
  const [detectingModalGps, setDetectingModalGps] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    clientId: CLIENTS[0]?.id || 'CLI001',
    address: '',
    latitude: 12.8456,
    longitude: 77.6603,
    geofenceRadius: 150,
    siteType: 'Emergency' as 'Emergency' | 'Temporary' | 'Patrol Checkpoint',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    emergencyNotes: '',
    sanctionedStrength: 4,
  })

  // Fetch live sites and patrol logs from database on mount
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

    // Fetch live patrol logs
    api.getPatrolLogs().then(data => {
      if (!isMounted || !data || data.length === 0) return
      setPatrolLogs(data)
    }).catch(err => console.warn('Could not fetch patrol logs:', err))

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

  // Real device GPS capture for new emergency/temp geofence
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
        setEmergencyForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))
        setDetectingModalGps(false)
        setFeedback(`✓ Centroid GPS locked: ${lat}, ${lng} (±${acc}m)`)
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

  // Create Emergency / Temporary Geofence
  const handleCreateEmergencyGeofence = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emergencyForm.name) {
      alert('Please enter a location/site name.')
      return
    }

    setCreatingSite(true)
    try {
      const payload = {
        name: emergencyForm.name,
        clientId: emergencyForm.clientId,
        address: emergencyForm.address || `${emergencyForm.name}, Field Location`,
        latitude: Number(emergencyForm.latitude),
        longitude: Number(emergencyForm.longitude),
        geofenceRadius: Number(emergencyForm.geofenceRadius),
        sanctionedStrength: Number(emergencyForm.sanctionedStrength),
        emergencyNotes: emergencyForm.emergencyNotes,
        validFrom: emergencyForm.validFrom,
        validUntil: emergencyForm.validUntil,
        siteType: emergencyForm.siteType,
        isEmergency: emergencyForm.siteType === 'Emergency',
      }

      const res = await api.createEmergencyGeofence(payload)
      const created = res?.site || res || {
        id: `SITE_EMG_${Date.now()}`,
        ...payload,
      }

      setSitesList(prev => [created, ...prev])
      setSelectedSiteId(created.id)
      setRadius(created.geofenceRadius || 150)
      setLatitude(Number(created.latitude))
      setLongitude(Number(created.longitude))
      setShowEmergencyModal(false)
      setFeedback(`✓ Created ${emergencyForm.siteType} Geofence: "${emergencyForm.name}" saved to database.`)
      
      // Reset form
      setEmergencyForm({
        name: '',
        clientId: CLIENTS[0]?.id || 'CLI001',
        address: '',
        latitude: 12.8456,
        longitude: 77.6603,
        geofenceRadius: 150,
        siteType: 'Emergency',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        emergencyNotes: '',
        sanctionedStrength: 4,
      })
    } catch (err: any) {
      console.warn('API error creating emergency geofence, saving locally:', err)
      const fallbackSite = {
        id: `SITE_EMG_${Date.now()}`,
        name: emergencyForm.name,
        clientId: emergencyForm.clientId,
        address: emergencyForm.address || emergencyForm.name,
        latitude: Number(emergencyForm.latitude),
        longitude: Number(emergencyForm.longitude),
        geofenceRadius: Number(emergencyForm.geofenceRadius),
        sanctionedStrength: Number(emergencyForm.sanctionedStrength),
        siteType: emergencyForm.siteType,
        isEmergency: emergencyForm.siteType === 'Emergency',
        status: 'Active',
      }
      setSitesList(prev => [fallbackSite, ...prev])
      setSelectedSiteId(fallbackSite.id)
      setShowEmergencyModal(false)
      setFeedback(`✓ Created ${emergencyForm.siteType} Geofence: "${emergencyForm.name}" (Local cache fallback).`)
    } finally {
      setCreatingSite(false)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: resolution } : a))
    setFeedback(`Alert #${alertId} marked as ${resolution}`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const refreshPatrols = async () => {
    setLoadingPatrols(true)
    try {
      const data = await api.getPatrolLogs()
      if (data && data.length > 0) setPatrolLogs(data)
      setFeedback('✓ Night patrol records refreshed from server.')
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      console.warn('Could not refresh patrol logs:', err)
    } finally {
      setLoadingPatrols(false)
    }
  }

  const client = CLIENTS.find(c => c.id === currentSite?.clientId)

  // Filtered Patrol Logs
  const filteredPatrols = patrolLogs.filter(p => {
    if (patrolFilterShift !== 'ALL' && p.patrolShift && !p.patrolShift.includes(patrolFilterShift)) return false
    if (patrolFilterStatus !== 'ALL' && p.status !== patrolFilterStatus) return false
    return true
  })

  // Patrol Metrics
  const totalPatrols = patrolLogs.length
  const verifiedCount = patrolLogs.filter(p => p.isGeofenceVerified).length
  const verifiedRate = totalPatrols > 0 ? Math.round((verifiedCount / totalPatrols) * 100) : 100
  const secureCount = patrolLogs.filter(p => p.status === 'All Secure').length
  const incidentCount = patrolLogs.filter(p => p.status === 'Incident Noticed' || p.status === 'Unattended Post').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Operations Geofencing & Night Patrol Hub</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full GPS boundary management, emergency geofences, night patrolling photo audits, and perimeter breach monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <AlertOctagon size={14} />
            + New Emergency / Temp Geofence
          </button>
          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#202B75]/10 text-[#202B75] flex items-center gap-1.5">
            <Radio size={14} className="text-[#26BCEE]" />
            <strong>{sitesList.length} Sites</strong> Active
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
          const isEmergency = site.isEmergency || site.siteType === 'Emergency'
          const isTemp = site.siteType === 'Temporary'
          const isPatrolCP = site.siteType === 'Patrol Checkpoint'

          return (
            <div
              key={site.id}
              onClick={() => handleSiteSelect(site.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                isSelected
                  ? 'border-[#202B75] bg-[#202B75]/5 ring-2 ring-[#202B75]/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold text-gray-400">{site.id}</span>
                <div className="flex items-center gap-1">
                  {isEmergency && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 uppercase">
                      Emergency
                    </span>
                  )}
                  {isTemp && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 uppercase">
                      Temporary
                    </span>
                  )}
                  {isPatrolCP && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">
                      Patrol CP
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {site.geofenceRadius || (site as any).geofence_radius || 100}m
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('control')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'control'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Sliders size={14} /> Boundary & Parameter Calibration
        </button>

        <button
          onClick={() => setActiveTab('patrols')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'patrols'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Moon size={14} className="text-indigo-600" /> Night Patrol Tracker ({patrolLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'radar'
              ? 'border-[#202B75] text-[#202B75]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Compass size={14} /> Interactive Radar & Map View
        </button>

        <button
          onClick={() => setActiveTab('breaches')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
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
              <div className="flex items-center gap-2">
                {currentSite.isEmergency && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200">
                    EMERGENCY SITE
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gate Centroid Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={e => setLatitude(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-[#202B75] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gate Centroid Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={e => setLongitude(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-[#202B75] bg-gray-50"
                />
              </div>
            </div>

            {/* 1-Click Device GPS Centroid Button */}
            <button
              onClick={handleDetectGateLocation}
              disabled={detectingGps}
              className="w-full py-2.5 px-4 rounded-xl border border-[#202B75]/30 bg-blue-50/70 hover:bg-blue-100/70 text-[#202B75] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {detectingGps ? (
                <>
                  <Loader2 size={14} className="animate-spin text-[#202B75]" />
                  <span>Locking High-Precision Device GPS Centroid...</span>
                </>
              ) : (
                <>
                  <Compass size={14} className="text-[#26BCEE]" />
                  <span>🎯 Capture Current Device Location as Site Centroid</span>
                </>
              )}
            </button>

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
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#202B75]/20 transition-all cursor-pointer"
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
                  <span className="font-bold text-gray-800">{currentSite.sanctionedStrength || 6} Officers</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Site Type:</span>
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
                <ShieldCheck size={16} /> Cost-Cutting Field Operations
              </h4>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                Security guards and housekeepers are verified on-site by travelling Field Officers. Field Officers log GPS arrival, conduct muster roll-calls with group photos, and execute night patrolling checkpoint sweeps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NIGHT PATROL TRACKER */}
      {activeTab === 'patrols' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Night Patrol Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Total Patrol Visits</span>
                <Moon size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-[#202B75]">{totalPatrols}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Logged across client campuses</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Geofence Compliance</span>
                <Compass size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{verifiedRate}%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{verifiedCount} of {totalPatrols} inside perimeter</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">All Secure Checks</span>
                <ShieldCheck size={16} className="text-[#26BCEE]" />
              </div>
              <p className="text-2xl font-black text-[#202B75]">{secureCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Zero security deviations</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Security Hazards / Flags</span>
                <AlertTriangle size={16} className="text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-600">{incidentCount}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Requiring supervisor attention</p>
            </div>
          </div>

          {/* Filters & Refresh Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Filter size={14} className="text-[#202B75]" /> Filter Shifts:
              </span>
              <div className="flex gap-1.5">
                {['ALL', 'Night Shift 1', 'Night Shift 2', 'Dawn Shift'].map(shift => (
                  <button
                    key={shift}
                    onClick={() => setPatrolFilterShift(shift)}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      patrolFilterShift === shift
                        ? 'bg-[#202B75] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {shift}
                  </button>
                ))}
              </div>

              <span className="font-bold text-gray-700 flex items-center gap-1 ml-2">
                Status:
              </span>
              <select
                value={patrolFilterStatus}
                onChange={e => setPatrolFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="All Secure">All Secure</option>
                <option value="Incident Noticed">Incident Noticed</option>
                <option value="Unattended Post">Unattended Post</option>
              </select>
            </div>

            <button
              onClick={refreshPatrols}
              disabled={loadingPatrols}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs transition-colors self-end sm:self-auto cursor-pointer"
            >
              <RefreshCw size={13} className={loadingPatrols ? 'animate-spin' : ''} />
              Refresh Feed
            </button>
          </div>

          {/* Patrol Logs Feed */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <Moon size={15} className="text-indigo-600" />
                Live Night Patrolling Log Stream ({filteredPatrols.length} entries)
              </h3>
              <span className="text-[11px] text-gray-400">Captured with GPS & Photo Proof</span>
            </div>

            {filteredPatrols.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Moon size={36} className="mx-auto text-gray-300 stroke-1" />
                <p className="text-sm font-semibold text-gray-600">No patrol logs found for selected filters</p>
                <p className="text-xs text-gray-400">Field officers will submit inspection logs with photo proof from their mobile app.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {filteredPatrols.map((log: any) => {
                  const isVerified = log.isGeofenceVerified
                  const isIncident = log.status === 'Incident Noticed' || log.status === 'Unattended Post'
                  const displayTime = log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '23:45'
                  const displayDate = log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'

                  return (
                    <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                      {/* Left: Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700">
                          <Moon size={18} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-gray-900 text-xs">{log.checkpointName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#202B75]/10 text-[#202B75]">
                              {log.siteName || 'Client Site'}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">{displayDate} · {displayTime}</span>
                          </div>

                          <div className="text-[11px] text-gray-600 flex items-center gap-2">
                            <span>Officer: <strong className="text-gray-900">{log.officerName || 'Field Patrol Officer'}</strong> ({log.officerCode || log.officerId || 'SS-10001'})</span>
                            <span>•</span>
                            <span className="font-medium text-indigo-700">{log.patrolShift || 'Night Shift'}</span>
                          </div>

                          {log.notes && (
                            <p className="text-[11px] text-gray-700 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                              "{log.notes}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-0.5 text-[10px] font-mono text-gray-500">
                            <span>GPS: {Number(log.latitude || 12.8452).toFixed(4)}, {Number(log.longitude || 77.6601).toFixed(4)}</span>
                            <span>•</span>
                            <span>Distance from Post: <strong>{log.distanceMeters ?? 14}m</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges & Photo Thumbnail */}
                      <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isIncident
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {log.status || 'All Secure'}
                        </span>

                        {/* GPS Geofence Badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isVerified
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Compass size={11} />
                          {isVerified ? 'GPS Verified' : 'Perimeter Deviation'}
                        </span>

                        {/* Photo Evidence Thumbnail Button */}
                        {log.photoUrl ? (
                          <button
                            onClick={() => setPhotoModal({
                              url: log.photoUrl,
                              title: log.checkpointName,
                              checkpoint: log.checkpointName,
                              officer: log.officerName || log.officerId,
                              time: `${displayDate} ${displayTime}`,
                              isVerified: log.isGeofenceVerified,
                              notes: log.notes
                            })}
                            className="group relative w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                            title="Click to view photo proof"
                          >
                            <img src={log.photoUrl} alt="Patrol evidence" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center">
                              <Eye size={14} className="text-white drop-shadow" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                            <Camera size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE RADAR / MAP VIEW */}
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

      {/* TAB 4: BREACH EXCEPTIONS */}
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
      {/* MODAL: CREATE TEMPORARY / EMERGENCY GEOFENCE */}
      {/* ========================================================================= */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertOctagon size={20} className="text-white" />
                <div>
                  <h3 className="font-bold text-sm">Create Temporary / Emergency Geofence</h3>
                  <p className="text-[11px] text-white/80">Establish perimeter boundaries for emergency deployments and event patrols</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmergencyGeofence} className="p-6 space-y-4 text-xs">
              {/* Type Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Geofence Location Classification *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Emergency', label: 'Emergency Site', desc: 'Crisis / Immediate Post' },
                    { type: 'Temporary', label: 'Temporary Event', desc: 'VIP / Short Visit' },
                    { type: 'Patrol Checkpoint', label: 'Patrol Checkpoint', desc: 'Night Patrol Route' }
                  ].map(item => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setEmergencyForm(prev => ({ ...prev, siteType: item.type as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        emergencyForm.siteType === item.type
                          ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-600/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <p className="font-extrabold text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Location / Site Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Conclave - Grand Ballroom"
                    value={emergencyForm.name}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Associated Corporate Client *</label>
                  <select
                    value={emergencyForm.clientId}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold bg-white"
                  >
                    {CLIENTS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Physical Landmark / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Gate 4, Electronic City Expressway"
                  value={emergencyForm.address}
                  onChange={e => setEmergencyForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              {/* GPS Coordinates & 1-Click Centroid Capture */}
              <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Compass size={14} className="text-red-600" />
                    GPS Centroid Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectModalGps}
                    disabled={detectingModalGps}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 hover:border-red-600 text-red-700 font-bold rounded-lg text-[11px] shadow-sm transition-all"
                  >
                    {detectingModalGps ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-red-600" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Compass size={12} className="text-red-600" />
                        🎯 Use My Current GPS
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={emergencyForm.latitude}
                      onChange={e => setEmergencyForm(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={emergencyForm.longitude}
                      onChange={e => setEmergencyForm(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Radius & Sanctioned Officers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-700">Perimeter Radius</label>
                    <span className="font-mono font-bold text-red-600">{emergencyForm.geofenceRadius}m</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    step="10"
                    value={emergencyForm.geofenceRadius}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, geofenceRadius: Number(e.target.value) }))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sanctioned Officers</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={emergencyForm.sanctionedStrength}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, sanctionedStrength: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl p-2 font-semibold"
                  />
                </div>
              </div>

              {/* Validity Window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={emergencyForm.validFrom}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, validFrom: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid Until (Expiry)</label>
                  <input
                    type="date"
                    value={emergencyForm.validUntil}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2"
                  />
                </div>
              </div>

              {/* Emergency Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Emergency Operations Brief / Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP delegation visiting tech park. Night patrol post established at rear gate."
                  value={emergencyForm.emergencyNotes}
                  onChange={e => setEmergencyForm(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSite}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  {creatingSite ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving Geofence...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Commit Geofence to Database
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PHOTO EVIDENCE LIGHTBOX */}
      {/* ========================================================================= */}
      {photoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{photoModal.checkpoint}</h4>
                <p className="text-[11px] text-gray-400">Patrol Checkpoint Inspection Photo</p>
              </div>
              <button
                onClick={() => setPhotoModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={photoModal.url}
                alt="Enlarged evidence"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-5 space-y-3 text-xs bg-white">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Patrol Officer</span>
                  <span className="font-bold text-gray-900">{photoModal.officer}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Timestamp</span>
                  <span className="font-mono text-gray-700">{photoModal.time}</span>
                </div>
              </div>

              {photoModal.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                  "{photoModal.notes}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  photoModal.isVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Compass size={11} />
                  {photoModal.isVerified ? 'GPS Geofence Verified' : 'GPS Deviation Logged'}
                </span>

                <button
                  onClick={() => setPhotoModal(null)}
                  className="px-4 py-1.5 bg-[#202B75] text-white rounded-xl font-bold text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
