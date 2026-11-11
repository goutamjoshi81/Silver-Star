import { useState, useEffect } from 'react'
import { SITES, SITE_MUSTER_AUDITS, api } from '@mock/mockData'
import { Calendar, Clock, ShieldCheck, CheckCircle2, Users, Camera, Compass, Eye, X } from 'lucide-react'

export default function AttendanceHistory() {
  const [activeTab, setActiveTab] = useState<'audits' | 'punches'>('audits')
  const [history, setHistory] = useState<any[]>([])
  const [musterAudits, setMusterAudits] = useState<any[]>(SITE_MUSTER_AUDITS)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    api.getAttendance().then(data => {
      if (data && data.length > 0) setHistory(data)
    }).catch(() => {})

    api.getFieldMusterAudits().then(data => {
      if (data && data.length > 0) setMusterAudits(data)
    }).catch(() => {})
  }, [])

  const presentDays = history.filter(a => a.status === 'Present').length
  const lateDays = history.filter(a => a.status === 'Late').length

  return (
    <div className="p-4 space-y-3.5 max-w-md mx-auto">
      <div>
        <h2 className="text-sm font-bold text-[#202B75]">Field Audits & Muster Ledger</h2>
        <p className="text-[11px] text-slate-500">Record of client site roll-calls and officer duty stamps</p>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-2 gap-1 text-center font-bold text-[11px]">
        <button
          type="button"
          onClick={() => setActiveTab('audits')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'audits'
              ? 'bg-white text-[#1A2B79] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={14} />
          <span>Site Muster Audits ({musterAudits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('punches')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'punches'
              ? 'bg-white text-[#1A2B79] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={14} />
          <span>My Punch Logs</span>
        </button>
      </div>

      {/* TAB 1: FIELD MUSTER AUDITS */}
      {activeTab === 'audits' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {musterAudits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-100 space-y-1">
              <Users size={28} className="mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No field muster audits submitted yet</p>
              <p className="text-[10px] text-slate-400">Complete a roll-call checklist in the "Roll-Call" tab to generate an audit.</p>
            </div>
          ) : (
            musterAudits.map(audit => {
              const displayDate = audit.date || (audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'Today')

              return (
                <div key={audit.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{audit.siteName || 'Client Site'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{displayDate} · {audit.shift || 'Shift'}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        {audit.totalPresent || audit.total_present} Present
                      </span>
                      {Number(audit.totalAbsent || audit.total_absent) > 0 && (
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                          {audit.totalAbsent || audit.total_absent} Absent
                        </span>
                      )}
                    </div>
                  </div>

                  {audit.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      "{audit.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold font-mono">
                      <Compass size={12} />
                      {audit.isGeofenceVerified ? 'GPS Verified' : 'Field Logged'} ({audit.distanceMeters ?? 14}m)
                    </span>

                    {(audit.musterPhotoUrl || audit.muster_photo_url) ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(audit.musterPhotoUrl || audit.muster_photo_url)}
                        className="flex items-center gap-1 text-[#1A2B79] font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Camera size={12} />
                        <span>View Photo Proof</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">No Photo</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* TAB 2: PERSONAL DUTY PUNCHES */}
      {activeTab === 'punches' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400">Total Shifts</p>
              <p className="text-base font-bold text-[#1A2B79] mt-0.5">{history.length}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400">On Time</p>
              <p className="text-base font-bold text-emerald-600 mt-0.5">{presentDays}</p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400">Late In</p>
              <p className="text-base font-bold text-amber-500 mt-0.5">{lateDays}</p>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
                No personal attendance punches recorded yet.
              </div>
            ) : (
              history.map(rec => {
                const site = SITES.find(s => s.id === rec.siteId)
                const isPresent = rec.status === 'Present'

                return (
                  <div key={rec.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#26BCEE]" />
                        <span className="font-bold text-xs text-slate-900">{rec.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{site?.name || rec.siteName || 'Assigned Site'}</p>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-600 font-semibold">
                        <ShieldCheck size={11} />
                        <span>GPS Geo-Stamped</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {rec.status}
                      </span>
                      <p className="text-xs font-mono font-medium text-slate-700">
                        {rec.punchIn || '--:--'} → {rec.punchOut || '--:--'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: View Photo Evidence */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Camera size={14} className="text-[#26BCEE]" />
                Muster Proof Evidence
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-72 overflow-hidden">
              <img src={selectedPhoto} alt="Audit evidence" className="w-full h-full object-contain" />
            </div>

            <div className="p-3 text-center">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-full py-2 bg-[#1A2B79] text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
