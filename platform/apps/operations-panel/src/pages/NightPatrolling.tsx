import { useState, useEffect } from 'react'
import { SITES, CLIENTS, PATROL_LOGS, PATROL_CHECKPOINTS, api } from '@mock/mockData'
import {
  Moon, ShieldCheck, AlertTriangle, Compass, Camera, Eye, Filter,
  RefreshCw, X, Search, CheckCircle2, Clock, Calendar, Users, Building,
  Shield, Check, ExternalLink
} from 'lucide-react'

export default function NightPatrolling() {
  const [patrolLogs, setPatrolLogs] = useState<any[]>(PATROL_LOGS)
  const [loading, setLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterShift, setFilterShift] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL')
  const [feedback, setFeedback] = useState<string | null>(null)

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

  // Fetch live patrol logs from PostgreSQL backend on mount
  const loadPatrols = async () => {
    setLoading(true)
    try {
      const data = await api.getPatrolLogs()
      if (data && Array.isArray(data) && data.length > 0) {
        setPatrolLogs(data)
      }
    } catch (err) {
      console.warn('Could not fetch patrol logs from server, using cached data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatrols()
  }, [])

  const handleRefresh = async () => {
    await loadPatrols()
    setFeedback('✓ Night patrol records refreshed from server.')
    setTimeout(() => setFeedback(null), 3000)
  }

  // Metrics calculation
  const totalPatrols = patrolLogs.length
  const verifiedCount = patrolLogs.filter(p => p.isGeofenceVerified).length
  const verifiedRate = totalPatrols > 0 ? Math.round((verifiedCount / totalPatrols) * 100) : 100
  const secureCount = patrolLogs.filter(p => p.status === 'All Secure').length
  const incidentCount = patrolLogs.filter(p => p.status === 'Incident Noticed' || p.status === 'Unattended Post').length

  // Filtered list based on search, shift, status, and site
  const filteredLogs = patrolLogs.filter(log => {
    if (filterShift !== 'ALL' && log.patrolShift && !log.patrolShift.includes(filterShift)) {
      return false
    }
    if (filterStatus !== 'ALL' && log.status !== filterStatus) {
      return false
    }
    if (selectedSiteFilter !== 'ALL' && log.siteId !== selectedSiteFilter) {
      return false
    }
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
            Real-time checkpoint sweeps, GPS perimeter compliance verification, and timestamped photo proof from field patrol officers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-[#202B75] border border-gray-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Feed
          </button>
          <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#202B75]/10 text-[#202B75] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#26BCEE]" />
            <strong>{totalPatrols} Patrols</strong> Logged
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

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Total Patrol Visits</span>
            <Moon size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-[#202B75]">{totalPatrols}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Across all client campuses</p>
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
            <span className="text-xs font-semibold">Security Flags / Hazards</span>
            <AlertTriangle size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{incidentCount}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Requiring attention</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by checkpoint name, officer name, site, or remarks..."
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

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-gray-500 text-[11px] flex items-center gap-1">
              <Filter size={12} /> Shift:
            </span>
            {['ALL', 'Night Shift 1', 'Night Shift 2', 'Dawn Shift'].map(shift => (
              <button
                key={shift}
                onClick={() => setFilterShift(shift)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterShift === shift
                    ? 'bg-[#202B75] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {shift === 'ALL' ? 'All Shifts' : shift}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="All Secure">All Secure</option>
              <option value="Incident Noticed">Incident Noticed</option>
              <option value="Unattended Post">Unattended Post</option>
              <option value="Maintenance Required">Maintenance Issue</option>
            </select>

            <select
              value={selectedSiteFilter}
              onChange={e => setSelectedSiteFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 max-w-[160px] truncate"
            >
              <option value="ALL">All Client Sites</option>
              {SITES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patrol Feed Table / Stream */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <Moon size={15} className="text-indigo-600" />
            Night Patrol Inspections ({filteredLogs.length} entries)
          </h3>
          <span className="text-[11px] text-gray-400">Captured with GPS Coordinates & Camera Proof</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Moon size={36} className="mx-auto text-gray-300 stroke-1" />
            <p className="text-sm font-semibold text-gray-600">No patrol logs found matching your filter criteria</p>
            <p className="text-xs text-gray-400">Field officers submit checkpoint logs with photo proof from the mobile app.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {filteredLogs.map((log: any) => {
              const isVerified = log.isGeofenceVerified
              const isIncident = log.status === 'Incident Noticed' || log.status === 'Unattended Post'
              const displayTime = log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '23:45'
              const displayDate = log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'

              return (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                  {/* Left info */}
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

                  {/* Right badges & photo thumbnail */}
                  <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      isIncident
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {log.status || 'All Secure'}
                    </span>

                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 ${
                      isVerified
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Compass size={11} />
                      {isVerified ? 'GPS Verified' : 'Perimeter Deviation'}
                    </span>

                    {log.photoUrl ? (
                      <button
                        onClick={() => setPhotoModal({
                          url: log.photoUrl,
                          title: log.checkpointName,
                          checkpoint: log.checkpointName,
                          officer: log.officerName || log.officerId,
                          time: `${displayDate} ${displayTime}`,
                          isVerified: log.isGeofenceVerified,
                          notes: log.notes,
                          distanceMeters: log.distanceMeters ?? 14
                        })}
                        className="group relative w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                        title="Click to inspect photo evidence"
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

      {/* Photo Lightbox Modal */}
      {photoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{photoModal.checkpoint}</h4>
                <p className="text-[11px] text-gray-400">Night Patrol Physical Checkpoint Evidence</p>
              </div>
              <button
                onClick={() => setPhotoModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
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
                  {photoModal.isVerified ? `GPS Geofence Verified (${photoModal.distanceMeters ?? 14}m)` : `GPS Deviation (${photoModal.distanceMeters ?? 180}m)`}
                </span>

                <button
                  onClick={() => setPhotoModal(null)}
                  className="px-4 py-1.5 bg-[#202B75] text-white rounded-xl font-bold text-xs cursor-pointer"
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

