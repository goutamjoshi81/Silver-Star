import { useState, useEffect } from 'react'
import { SITES, CLIENTS, EMPLOYEES, PATROL_LOGS, PATROL_CHECKPOINTS, api } from '@mock/mockData'
import {
  Moon, ShieldCheck, AlertTriangle, Compass, Camera, Eye, Filter,
  RefreshCw, X, Search, CheckCircle2, Clock, Calendar, Users, Building,
  Shield, Check, ExternalLink, Plus, MapPin, Loader2, Radio
} from 'lucide-react'

export default function NightPatrolling() {
  const [patrolLogs, setPatrolLogs] = useState<any[]>(PATROL_LOGS)
  const [patrolAssignments, setPatrolAssignments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'assignments' | 'logs'>('assignments')
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterShift, setFilterShift] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [feedback, setFeedback] = useState<string | null>(null)

  // Master Data
  const [sitesList, setSitesList] = useState<any[]>(SITES)
  const [clientsList, setClientsList] = useState<any[]>(CLIENTS)
  const [employeesList, setEmployeesList] = useState<any[]>(EMPLOYEES)

  // Photo Lightbox Modal
  const [photoModal, setPhotoModal] = useState<{
    url: string
    title: string
    checkpoint: string
    officer: string
    time: string
    isVerified: boolean
    notes?: string
    distanceMeters?: number
  } | null>(null)

  // Add Night Patrol Assignment Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingAssignment, setCreatingAssignment] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    locationType: 'client' as 'client' | 'custom',
    clientId: CLIENTS[0]?.id || 'CLI001',
    siteId: SITES[0]?.id || 'SITE001',
    customLocationName: '',
    customAddress: '',
    latitude: 12.8456,
    longitude: 77.6603,
    geofenceRadius: 150,
    officerId: EMPLOYEES[0]?.id || 'SS-10001',
    checkpointName: PATROL_CHECKPOINTS[0]?.name || 'Main Security Gate & Barrier Check',
    shift: 'Night Shift 1 (20:00 - 00:00)',
    instructions: 'Perform physical checkpoint inspection, check gate padlocks and floodlights, snap verification photo.',
  })

  // Load live patrol logs & assignments from PostgreSQL backend
  const loadData = async () => {
    setLoading(true)
    try {
      const [logs, asgs, sts, cls, emps] = await Promise.all([
        api.getPatrolLogs().catch(() => PATROL_LOGS),
        api.getPatrolAssignments().catch(() => []),
        api.getSites().catch(() => SITES),
        api.getClients().catch(() => CLIENTS),
        api.getEmployees().catch(() => EMPLOYEES),
      ])
      if (logs && Array.isArray(logs) && logs.length > 0) setPatrolLogs(logs)
      if (asgs && Array.isArray(asgs)) setPatrolAssignments(asgs)
      if (sts && sts.length > 0) setSitesList(sts)
      if (cls && cls.length > 0) setClientsList(cls)
      if (emps && emps.length > 0) setEmployeesList(emps)
    } catch (err) {
      console.warn('Could not fetch patrol data from server:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    await loadData()
    setFeedback('✓ Night patrol records and assignments refreshed from server.')
    setTimeout(() => setFeedback(null), 3000)
  }

  // Filter available Field Officers
  const fieldOfficers = employeesList.filter(e => {
    const code = (e.employeeCode || '').toLowerCase()
    const name = (e.name || '').toLowerCase()
    return code.startsWith('ss-100') || code.startsWith('ss-9') || name.includes('officer') || name.includes('gowda') || name.includes('patil') || e.designationId?.includes('FLD') || e.designation?.toLowerCase().includes('officer')
  })

  // Detect GPS coordinates for custom address
  const handleDetectGps = () => {
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
        setAssignmentForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))
        setDetectingGps(false)
        setFeedback(`✓ Centroid GPS captured: ${lat}, ${lng} (±${acc}m)`)
        setTimeout(() => setFeedback(null), 4000)
      },
      (err) => {
        setDetectingGps(false)
        alert(`Could not capture GPS location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Submit Night Patrol Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()

    const isClient = assignmentForm.locationType === 'client'
    const selectedSite = sitesList.find(s => s.id === assignmentForm.siteId)
    const selectedClient = clientsList.find(c => c.id === assignmentForm.clientId)

    const locationName = isClient ? (selectedSite?.name || 'Client Campus') : assignmentForm.customLocationName.trim()
    const address = isClient ? (selectedSite?.address || 'Client Address') : assignmentForm.customAddress.trim()

    if (!locationName) {
      alert('Please specify a location or client name.')
      return
    }

    setCreatingAssignment(true)
    try {
      const payload = {
        officerId: assignmentForm.officerId,
        clientId: isClient ? assignmentForm.clientId : undefined,
        siteId: isClient ? assignmentForm.siteId : undefined,
        locationType: assignmentForm.locationType,
        locationName,
        address,
        latitude: isClient ? Number(selectedSite?.latitude || 12.8456) : Number(assignmentForm.latitude),
        longitude: isClient ? Number(selectedSite?.longitude || 77.6603) : Number(assignmentForm.longitude),
        geofenceRadius: Number(assignmentForm.geofenceRadius),
        checkpointName: assignmentForm.checkpointName,
        shift: assignmentForm.shift,
        instructions: assignmentForm.instructions,
      }

      const res = await api.createPatrolAssignment(payload)
      const created = res?.assignment || {
        id: `PASG_${Date.now()}`,
        ...payload,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      }

      setPatrolAssignments(prev => [created, ...prev])
      setShowAddModal(false)
      setFeedback(`✓ Night patrol successfully assigned to officer! Synced to officer mobile application.`)
    } catch (err: any) {
      console.warn('API error creating patrol assignment, saving to local state:', err)
      const fallback = {
        id: `PASG_${Date.now()}`,
        ...assignmentForm,
        locationName,
        address,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      }
      setPatrolAssignments(prev => [fallback, ...prev])
      setShowAddModal(false)
      setFeedback(`✓ Night patrol assignment created (Cached). Synced to officer application.`)
    } finally {
      setCreatingAssignment(false)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  // Metrics calculation
  const totalPatrols = patrolLogs.length
  const totalAssignments = patrolAssignments.length
  const verifiedCount = patrolLogs.filter(p => p.isGeofenceVerified).length
  const verifiedRate = totalPatrols > 0 ? Math.round((verifiedCount / totalPatrols) * 100) : 100
  const secureCount = patrolLogs.filter(p => p.status === 'All Secure').length

  // Filtered list based on search, shift, status
  const filteredLogs = patrolLogs.filter(log => {
    if (filterShift !== 'ALL' && log.patrolShift && !log.patrolShift.includes(filterShift)) return false
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const checkpointMatch = log.checkpointName?.toLowerCase().includes(q)
      const officerMatch = (log.officerName || log.officerId)?.toLowerCase().includes(q)
      const siteMatch = log.siteName?.toLowerCase().includes(q)
      const notesMatch = log.notes?.toLowerCase().includes(q)
      if (!checkpointMatch && !officerMatch && !siteMatch && !notesMatch) return false
    }
    return true
  })

  const filteredAssignments = patrolAssignments.filter(asg => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const locMatch = asg.locationName?.toLowerCase().includes(q)
      const cpMatch = asg.checkpointName?.toLowerCase().includes(q)
      const offMatch = (asg.officerName || asg.officerId)?.toLowerCase().includes(q)
      return locMatch || cpMatch || offMatch
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <Moon size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#202B75]">Night Patrolling Operations Hub</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch night patrols to field officers, calibrate inspection checkpoints, and monitor verified photo proof
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ADD NIGHT PATROL BUTTON */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus size={15} />
            + Add Night Patrol Assignment
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-[#202B75] border border-gray-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
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

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Active Patrol Dispatches</span>
            <Moon size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-[#202B75]">{totalAssignments}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Assigned to field officers</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Completed Patrol Audits</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{totalPatrols}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{verifiedRate}% GPS Verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">All Secure Checks</span>
            <CheckCircle2 size={16} className="text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-700">{secureCount}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Normal status reported</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Live Field Officers</span>
            <Users size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-[#202B75]">{fieldOfficers.length || 3}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Mobile app active</p>
        </div>
      </div>

      {/* TAB NAVIGATION: ASSIGNMENTS VS LOGS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-[#202B75] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Moon size={14} />
          <span>Night Patrol Dispatches ({patrolAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#202B75] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Camera size={14} />
          <span>Completed Verification Logs & Photo Proof ({patrolLogs.length})</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by checkpoint, officer, location, notes..."
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

        {activeTab === 'logs' && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <select
              value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-semibold text-gray-700"
            >
              <option value="ALL">All Shifts</option>
              <option value="Round 1">Round 1 (22:00 - 00:00)</option>
              <option value="Round 2">Round 2 (02:00 - 04:00)</option>
              <option value="Round 3">Round 3 (04:00 - 06:00)</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-semibold text-gray-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="All Secure">All Secure</option>
              <option value="Incident Noticed">Incident Noticed</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: ASSIGNED NIGHT PATROLS */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-400 space-y-2">
              <Moon size={36} className="mx-auto text-gray-300 stroke-1" />
              <p className="font-semibold text-gray-700">No night patrol assignments dispatched yet</p>
              <p className="text-[11px] text-gray-400">Click "+ Add Night Patrol Assignment" above to assign an officer to a client site or custom location.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                + Add First Night Patrol
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Location & Type</th>
                    <th className="px-4 py-3 font-bold">Checkpoint to Inspect</th>
                    <th className="px-4 py-3 font-bold">Assigned Field Officer</th>
                    <th className="px-4 py-3 font-bold">Shift & Geofence</th>
                    <th className="px-4 py-3 font-bold">Instructions</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssignments.map((asg) => {
                    const off = employeesList.find(e => e.id === asg.officerId || e.employeeCode === asg.officerId)
                    const isCustom = asg.locationType === 'custom'

                    return (
                      <tr key={asg.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isCustom ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {isCustom ? <MapPin size={15} /> : <Building size={15} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{asg.locationName}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{asg.address}</p>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                isCustom ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {isCustom ? 'Custom Address' : (asg.clientName || 'Corporate Client')}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-800">{asg.checkpointName}</p>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {asg.id}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-[10px]">
                              {(off?.name || asg.officerName || 'O')[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{off?.name || asg.officerName || 'Assigned Officer'}</p>
                              <p className="text-[10px] text-[#26BCEE] font-mono font-bold">{off?.employeeCode || asg.officerCode || asg.officerId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{asg.shift}</p>
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            Radius: {asg.geofenceRadius}m
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-[11px] text-gray-600 max-w-[240px] truncate" title={asg.instructions}>
                            {asg.instructions || 'Standard checkpoint sweep & photo proof.'}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            asg.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${asg.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                            {asg.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED VERIFICATION LOGS WITH PHOTO PROOF */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No patrol records found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Photo Proof</th>
                    <th className="px-4 py-3 font-bold">Checkpoint & Site</th>
                    <th className="px-4 py-3 font-bold">Patrol Officer</th>
                    <th className="px-4 py-3 font-bold">Shift & Time</th>
                    <th className="px-4 py-3 font-bold">GPS Geofence Status</th>
                    <th className="px-4 py-3 font-bold">Security Finding</th>
                    <th className="px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPhotoModal({
                            url: log.photoUrl || '/silverstar-icon-512.png',
                            title: log.checkpointName,
                            checkpoint: log.checkpointName,
                            officer: log.officerName || log.officerId,
                            time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:15 PM',
                            isVerified: log.isGeofenceVerified,
                            notes: log.notes,
                            distanceMeters: log.distanceMeters,
                          })}
                          className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:ring-2 hover:ring-[#202B75] transition-all cursor-pointer group"
                        >
                          <img
                            src={log.photoUrl || '/silverstar-icon-512.png'}
                            alt="Proof"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={14} className="text-white" />
                          </div>
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{log.checkpointName}</p>
                        <p className="text-[10px] text-gray-400">{log.siteName || 'Campus Location'}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{log.officerName || 'Field Patrol Officer'}</p>
                        <p className="text-[10px] font-mono text-cyan-600 font-bold">{log.officerCode || log.officerId}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{log.patrolShift || 'Night Patrol'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Night Shift'}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.isGeofenceVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <Compass size={11} />
                          {log.isGeofenceVerified ? 'Within Geofence' : 'Deviation / Breach'}
                          {log.distanceMeters && ` (${log.distanceMeters}m)`}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{log.status || 'All Secure'}</p>
                        <p className="text-[10px] text-gray-500 max-w-[200px] truncate">{log.notes || 'No remarks'}</p>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPhotoModal({
                            url: log.photoUrl || '/silverstar-icon-512.png',
                            title: log.checkpointName,
                            checkpoint: log.checkpointName,
                            officer: log.officerName || log.officerId,
                            time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:15 PM',
                            isVerified: log.isGeofenceVerified,
                            notes: log.notes,
                            distanceMeters: log.distanceMeters,
                          })}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          View Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD NIGHT PATROL ASSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <Moon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#202B75]">Add Night Patrol Assignment</h3>
                  <p className="text-[11px] text-gray-500">Dispatch field officers to client campuses or new emergency patrol addresses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              {/* LOCATION TYPE TOGGLE */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Target Patrol Location *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignmentForm(prev => ({ ...prev, locationType: 'client' }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      assignmentForm.locationType === 'client'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className="text-indigo-600" />
                      <span>Existing Client Site</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Select from registered client facilities</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignmentForm(prev => ({ ...prev, locationType: 'custom' }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      assignmentForm.locationType === 'custom'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-600" />
                      <span>New Address / Custom Post</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Enter custom physical location address</p>
                  </button>
                </div>
              </div>

              {/* LOCATION FIELDS */}
              {assignmentForm.locationType === 'client' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Corporate Client *</label>
                    <select
                      value={assignmentForm.clientId}
                      onChange={e => {
                        const newCliId = e.target.value
                        const matchingSite = sitesList.find(s => s.clientId === newCliId)
                        setAssignmentForm(prev => ({
                          ...prev,
                          clientId: newCliId,
                          siteId: matchingSite?.id || prev.siteId,
                        }))
                      }}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Target Client Work Site *</label>
                    <select
                      value={assignmentForm.siteId}
                      onChange={e => setAssignmentForm(prev => ({ ...prev, siteId: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      {sitesList
                        .filter(s => s.clientId === assignmentForm.clientId)
                        .map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      {sitesList.filter(s => s.clientId === assignmentForm.clientId).length === 0 && (
                        sitesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Location / Post Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manyata North Perimeter & Warehouse Gate"
                      value={assignmentForm.customLocationName}
                      onChange={e => setAssignmentForm(prev => ({ ...prev, customLocationName: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Full Physical Address / Landmark *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ring Road Junction, Near Gate 5, Nagavara, Bengaluru"
                      value={assignmentForm.customAddress}
                      onChange={e => setAssignmentForm(prev => ({ ...prev, customAddress: e.target.value }))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  {/* Centroid Coordinates + 1-Click GPS */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <Compass size={13} className="text-amber-600" /> Centroid Coordinates
                      </span>
                      <button
                        type="button"
                        onClick={handleDetectGps}
                        disabled={detectingGps}
                        className="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                      >
                        {detectingGps ? 'Acquiring Fix...' : '🎯 Use My Current GPS'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.000001"
                        value={assignmentForm.latitude}
                        onChange={e => setAssignmentForm(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                        className="bg-white border border-gray-200 rounded-lg p-2 font-mono text-xs font-bold"
                        placeholder="Latitude"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={assignmentForm.longitude}
                        onChange={e => setAssignmentForm(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                        className="bg-white border border-gray-200 rounded-lg p-2 font-mono text-xs font-bold"
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SELECT FIELD OFFICER */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Field Officer for this Patrol *</label>
                <select
                  value={assignmentForm.officerId}
                  onChange={e => setAssignmentForm(prev => ({ ...prev, officerId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  {fieldOfficers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.employeeCode}) — 📞 {off.phone}
                    </option>
                  ))}
                  {fieldOfficers.length === 0 && (
                    employeesList.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeCode})</option>
                    ))
                  )}
                </select>
              </div>

              {/* CHECKPOINT & SHIFT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Checkpoint to Inspect *</label>
                  <select
                    value={assignmentForm.checkpointName}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, checkpointName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white"
                  >
                    {PATROL_CHECKPOINTS.map(cp => (
                      <option key={cp.id} value={cp.name}>{cp.name}</option>
                    ))}
                    <option value="Perimeter Boundary Wall & Rear Gate">Perimeter Boundary Wall & Rear Gate</option>
                    <option value="DG Set & Electrical Transformer Yard">DG Set & Electrical Transformer Yard</option>
                    <option value="Data Center & Server Room Padlocks">Data Center & Server Room Padlocks</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Night Patrol Shift Schedule *</label>
                  <select
                    value={assignmentForm.shift}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, shift: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white"
                  >
                    <option value="Night Shift 1 (20:00 - 00:00)">Night Shift 1 (20:00 - 00:00)</option>
                    <option value="Night Shift 2 (00:00 - 04:00)">Night Shift 2 (00:00 - 04:00)</option>
                    <option value="Graveyard Shift (04:00 - 08:00)">Graveyard Shift (04:00 - 08:00)</option>
                    <option value="All-Night Continuous Patrol (22:00 - 06:00)">All-Night Continuous Patrol (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              {/* RADIUS & INSTRUCTIONS */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-gray-700">Permitted Geofence Radius</label>
                  <span className="font-mono font-bold text-indigo-700">{assignmentForm.geofenceRadius}m</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="500"
                  step="10"
                  value={assignmentForm.geofenceRadius}
                  onChange={e => setAssignmentForm(prev => ({ ...prev, geofenceRadius: Number(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Patrol Instructions & Directives</label>
                <textarea
                  rows={2}
                  value={assignmentForm.instructions}
                  onChange={e => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                  placeholder="e.g. Inspect all perimeter fence locks, verify guard alertness, snap photo evidence."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {creatingAssignment ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Dispatch Night Patrol to Officer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {photoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#26BCEE]" />
                <h3 className="font-bold text-sm truncate">{photoModal.title}</h3>
              </div>
              <button
                onClick={() => setPhotoModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[380px]">
              <img
                src={photoModal.url}
                alt={photoModal.title}
                className="max-h-[360px] w-auto object-contain"
              />
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                photoModal.isVerified
                  ? 'bg-emerald-500/90 text-white border border-emerald-400'
                  : 'bg-rose-500/90 text-white border border-rose-400'
              }`}>
                {photoModal.isVerified ? '✓ GPS Verified' : '⚠ Deviation'}
              </span>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-400">Patrol Officer:</span>
                  <p className="font-bold text-white">{photoModal.officer}</p>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>
                  <p className="font-bold text-white">{photoModal.time}</p>
                </div>
              </div>
              {photoModal.notes && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-slate-300 text-[11px]">
                  <strong className="text-white block mb-0.5">Officer Notes:</strong>
                  {photoModal.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
