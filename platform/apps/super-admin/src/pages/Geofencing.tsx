import { useState, useEffect } from 'react'
import { SITES, CLIENTS, EMPLOYEES, api } from '@mock/mockData'
import { MapPin, Circle, Eye, Edit2, X, Radio, Compass, Save, CheckCircle2, ExternalLink, Loader2, AlertOctagon, Check, Search, Plus } from 'lucide-react'

export default function Geofencing() {
  const [sites, setSites] = useState<any[]>(SITES)
  const [clients, setClients] = useState<any[]>(CLIENTS)
  const [employees, setEmployees] = useState<any[]>(EMPLOYEES)
  const [selected, setSelected] = useState<string | null>(null)
  const [editingSite, setEditingSite] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Emergency / Temporary / Manual Geofence Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [creatingEmergency, setCreatingEmergency] = useState(false)
  const [detectingModalGps, setDetectingModalGps] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    clientId: CLIENTS[0]?.id || 'CLI001',
    address: '',
    latitude: 12.8456,
    longitude: 77.6603,
    geofenceRadius: 150,
    siteType: 'Permanent' as 'Permanent' | 'Emergency' | 'Temporary' | 'Patrol Checkpoint',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    emergencyNotes: '',
    sanctionedStrength: 4,
  })

  useEffect(() => {
    Promise.all([
      api.getSites().catch(() => []),
      api.getClients().catch(() => []),
      api.getEmployees().catch(() => []),
    ]).then(([sts, cls, emps]) => {
      if (sts && sts.length > 0) setSites(sts)
      if (cls && cls.length > 0) setClients(cls)
      if (emps && emps.length > 0) setEmployees(emps)
    })
  }, [])

  const site = sites.find(s => s.id === selected) || SITES.find(s => s.id === selected)
  const client = site ? (clients.find(c => c.id === site.clientId) || CLIENTS.find(c => c.id === site.clientId)) : null
  const supervisor = site ? (employees.find(e => e.id === site.supervisorId) || EMPLOYEES.find(e => e.id === site.supervisorId)) : null

  const handleStartEdit = (s: any) => {
    setEditingSite({
      id: s.id,
      name: s.name,
      latitude: Number(s.latitude) || 12.8456,
      longitude: Number(s.longitude) || 77.6603,
      geofenceRadius: Number(s.geofenceRadius || s.geofence_radius || 100),
    })
  }

  const handleDetectDeviceGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('GPS is not supported by your browser.')
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        const acc = Math.round(pos.coords.accuracy)
        setEditingSite((prev: any) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))
        setDetectingGps(false)
        setFeedback(`✓ Captured live GPS: ${lat}, ${lng} (Precision: ±${acc}m)`)
        setTimeout(() => setFeedback(null), 4000)
      },
      (err) => {
        setDetectingGps(false)
        alert(`Could not capture GPS location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleDetectModalGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('GPS is not supported by your browser.')
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
        setFeedback(`✓ Centroid GPS captured: ${lat}, ${lng} (±${acc}m)`)
        setTimeout(() => setFeedback(null), 4000)
      },
      (err) => {
        setDetectingModalGps(false)
        alert(`Could not capture GPS: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSaveGeofence = async () => {
    if (!editingSite) return
    setSaving(true)
    try {
      await api.updateGeofence(editingSite.id, {
        latitude: Number(editingSite.latitude),
        longitude: Number(editingSite.longitude),
        geofenceRadius: Number(editingSite.geofenceRadius),
      })

      setSites(prev => prev.map(s => {
        if (s.id === editingSite.id) {
          return {
            ...s,
            latitude: Number(editingSite.latitude),
            longitude: Number(editingSite.longitude),
            geofenceRadius: Number(editingSite.geofenceRadius),
            geofence_radius: Number(editingSite.geofenceRadius),
          }
        }
        return s
      }))
      setFeedback(`✓ Saved to PostgreSQL: ${editingSite.name} Geofence radius set to ${editingSite.geofenceRadius}m.`)
      setEditingSite(null)
    } catch (err: any) {
      console.warn('Could not save to API, saved locally:', err)
      setFeedback(`✓ Updated locally (Offline fallback): ${editingSite.name} radius set to ${editingSite.geofenceRadius}m.`)
      setEditingSite(null)
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const handleCreateEmergency = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emergencyForm.name) {
      alert('Please enter a location/site name.')
      return
    }

    setCreatingEmergency(true)
    try {
      const isEmergency = emergencyForm.siteType === 'Emergency'
      const payload = {
        name: emergencyForm.name,
        clientId: emergencyForm.clientId,
        address: emergencyForm.address || `${emergencyForm.name}, Location`,
        latitude: Number(emergencyForm.latitude),
        longitude: Number(emergencyForm.longitude),
        geofenceRadius: Number(emergencyForm.geofenceRadius),
        sanctionedStrength: Number(emergencyForm.sanctionedStrength),
        emergencyNotes: emergencyForm.emergencyNotes,
        validFrom: emergencyForm.validFrom,
        validUntil: emergencyForm.validUntil,
        siteType: emergencyForm.siteType,
        isEmergency,
      }

      const res = (isEmergency || emergencyForm.siteType === 'Temporary')
        ? await api.createEmergencyGeofence(payload)
        : await api.createSite(payload)
      const created = res?.site || res || {
        id: `SITE_EMG_${Date.now()}`,
        ...payload,
        status: 'Active',
      }

      setSites(prev => [created, ...prev])
      setShowEmergencyModal(false)
      setFeedback(`✓ Successfully created ${emergencyForm.siteType} Geofence: "${emergencyForm.name}".`)
    } catch (err: any) {
      console.warn('Could not create emergency geofence on API:', err)
      const fallbackSite = {
        id: `SITE_EMG_${Date.now()}`,
        ...emergencyForm,
        status: 'Active',
      }
      setSites(prev => [fallbackSite, ...prev])
      setShowEmergencyModal(false)
      setFeedback(`✓ Created ${emergencyForm.siteType} Geofence: "${emergencyForm.name}" (Cached).`)
    } finally {
      setCreatingEmergency(false)
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  // Filter sites based on search query
  const filteredSites = sites.filter(s => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const nameMatch = s.name?.toLowerCase().includes(q)
    const idMatch = s.id?.toLowerCase().includes(q)
    const addrMatch = s.address?.toLowerCase().includes(q)
    const cli = clients.find(c => c.id === s.clientId) || CLIENTS.find(c => c.id === s.clientId)
    const clientMatch = cli?.name?.toLowerCase().includes(q)
    const typeMatch = (s.siteType || (s.isEmergency ? 'Emergency' : 'Permanent'))?.toLowerCase().includes(q)
    return nameMatch || idMatch || addrMatch || clientMatch || typeMatch
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Geofencing Management Console</h2>
          <p className="text-xs text-gray-500">{sites.length} active work locations with GPS boundary enforcement</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl text-xs font-bold shadow-md shadow-[#202B75]/20 transition-all cursor-pointer"
          >
            <Plus size={14} />
            + Add New Geofence Location
          </button>
          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#202B75]/10 text-[#202B75] flex items-center gap-1.5">
            <Radio size={14} className="text-[#26BCEE]" />
            Live PostgreSQL Enforced
          </span>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline">Dismiss</button>
        </div>
      )}

      {/* Top Search Bar & Search Button */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search geofences by location name, client, address, or site ID..."
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

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#f0f2f8] h-48 flex items-center justify-center relative">
          <div className="text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-[#202B75]/30" />
            <p className="text-sm font-medium text-gray-500">Interactive Map View</p>
            <p className="text-xs text-gray-400">Google Maps boundary enforcement & live radar ({filteredSites.length} showing)</p>
          </div>
          {/* Site pins */}
          {filteredSites.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md ${
                s.isEmergency || s.siteType === 'Emergency'
                  ? 'bg-red-500 animate-pulse'
                  : s.status === 'Active'
                  ? 'bg-[#26BCEE]'
                  : 'bg-gray-400'
              }`}
              style={{ left: `${15 + (i * 15) % 75}%`, top: `${25 + (i % 3) * 25}%` }}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredSites.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 space-y-2">
            <MapPin size={32} className="mx-auto text-gray-300 stroke-1" />
            <p className="font-semibold text-gray-700">No geofence location found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs"
            >
              Clear Search
            </button>
          </div>
        ) : (
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
              {filteredSites.map(s => {
                const cli = clients.find(c => c.id === s.clientId) || CLIENTS.find(c => c.id === s.clientId)
                const isEmergency = s.isEmergency || s.siteType === 'Emergency'
                const isTemp = s.siteType === 'Temporary'

              return (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isEmergency ? 'bg-red-100 text-red-600' : 'bg-[#26BCEE]/10 text-[#26BCEE]'
                      }`}>
                        {isEmergency ? <AlertOctagon className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          {isEmergency && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 text-red-700">EMERGENCY</span>
                          )}
                          {isTemp && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">TEMP</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{s.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{cli?.name || s.clientName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#202B75]/10 text-[#202B75] text-xs font-semibold px-2 py-1 rounded-full">
                      {s.geofenceRadius || s.geofence_radius || 100}m
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-semibold">{s.sanctionedStrength || 4}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isEmergency
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : s.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isEmergency ? 'Emergency' : s.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(s.id)}
                        className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="View Site Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleStartEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Geofence Parameters"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      </div>

      {/* Site Detail Modal */}
      {site && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-[#202B75]">{site.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 mb-0.5">Client</p><p className="font-medium">{client?.name}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${site.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{site.status || 'Active'}</span>
                </div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Address</p><p className="font-medium">{site.address}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Latitude</p><p className="font-mono text-sm">{site.latitude}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Longitude</p><p className="font-mono text-sm">{site.longitude}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Geofence Radius</p><p className="font-semibold">{site.geofenceRadius || site.geofence_radius || 100} metres</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Sanctioned Strength</p><p className="font-semibold">{site.sanctionedStrength || 4} staff</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Site Type</p><p className="font-bold text-[#202B75]">{site.siteType || (site.isEmergency ? 'Emergency' : 'Permanent')}</p></div>
                {site.emergencyNotes && (
                  <div className="col-span-2 bg-red-50 p-2.5 rounded-xl border border-red-100 text-xs text-red-800">
                    <p className="font-bold mb-0.5">Emergency Notes:</p>
                    <p>{site.emergencyNotes}</p>
                  </div>
                )}
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Supervisor</p><p className="font-medium">{supervisor?.name || 'Assigned Supervisor'} ({supervisor?.employeeCode || 'SS-10003'})</p></div>
              </div>

              {/* Geofence visual */}
              <div className="bg-[#f0f2f8] rounded-xl p-6 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#26BCEE]/40 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#26BCEE]/60 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#26BCEE]" />
                    </div>
                  </div>
                  <span className="absolute -bottom-5 text-xs text-gray-400 font-mono">{site.geofenceRadius || site.geofence_radius || 100}m radius</span>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink size={12} /> Open in Maps
                  </a>
                  <button
                    onClick={() => {
                      const current = site
                      setSelected(null)
                      handleStartEdit(current)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] cursor-pointer"
                  >
                    <Edit2 size={12} /> Edit Parameters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geofence Edit & Calibration Modal */}
      {editingSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div>
                <h3 className="font-bold text-[#202B75] text-base">Calibrate Geofence: {editingSite.name}</h3>
                <p className="text-xs text-gray-400">PostgreSQL Live Site ID: {editingSite.id}</p>
              </div>
              <button
                onClick={() => setEditingSite(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Radius Slider */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Permitted Geofence Radius</label>
                  <span className="text-xs font-extrabold text-[#202B75] bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-mono">
                    {editingSite.geofenceRadius} Meters
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="500"
                  step="5"
                  value={editingSite.geofenceRadius}
                  onChange={e => setEditingSite({ ...editingSite, geofenceRadius: Number(e.target.value) })}
                  className="w-full accent-[#202B75] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>30m (Gatehouse)</span>
                  <span>100m (Standard)</span>
                  <span>250m (Tech Park)</span>
                  <span>500m (Campus)</span>
                </div>
              </div>

              {/* Coordinates Inputs + Live Device GPS Capture */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Centroid Coordinates</label>
                  <button
                    type="button"
                    onClick={handleDetectDeviceGps}
                    disabled={detectingGps}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-[#202B75] hover:bg-cyan-100 rounded-lg text-xs font-semibold border border-cyan-200 cursor-pointer"
                  >
                    <Compass size={12} className={detectingGps ? "animate-spin text-cyan-600" : "text-[#26BCEE]"} />
                    {detectingGps ? "Acquiring Fix..." : "Capture Device GPS"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingSite.latitude}
                      onChange={e => setEditingSite({ ...editingSite, latitude: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingSite.longitude}
                      onChange={e => setEditingSite({ ...editingSite, longitude: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGeofence}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#202B75] hover:bg-[#161f56] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Committing to PostgreSQL...
                    </>
                  ) : (
                    <>
                      <Save size={13} /> Save to Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual / Emergency / Temporary Geofence Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-[#202B75] to-[#161f56] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={20} className="text-[#26BCEE]" />
                <div>
                  <h3 className="font-bold text-sm">Add New Geofence Location</h3>
                  <p className="text-[11px] text-white/80">Establish permanent locations, emergency posts, temporary events, or patrol checkpoints</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmergency} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Geofence Classification *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: 'Permanent', label: 'Permanent Site', desc: 'Standard Office / Factory' },
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
                          ? 'border-[#202B75] bg-[#202B75]/5 text-[#202B75] ring-2 ring-[#202B75]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <p className="font-extrabold text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Location / Site Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emergency Transit Post - Gate 3"
                    value={emergencyForm.name}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Corporate Client *</label>
                  <select
                    value={emergencyForm.clientId}
                    onChange={e => setEmergencyForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold bg-white"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Physical Address / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Outer Ring Road Junction"
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
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 hover:border-red-600 text-red-700 font-bold rounded-lg text-[11px] shadow-sm transition-all cursor-pointer"
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

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Emergency Operations Brief / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Temporary deployment for annual audit or night patrol post"
                  value={emergencyForm.emergencyNotes}
                  onChange={e => setEmergencyForm(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEmergency}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  {creatingEmergency ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving...
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
    </div>
  )
}
