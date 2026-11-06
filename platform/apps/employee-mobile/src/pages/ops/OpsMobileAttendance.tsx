import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { ShieldCheck, Calendar, Clock, MapPin, Search, AlertCircle, RefreshCw } from 'lucide-react';

export default function OpsMobileAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = () => {
    setLoading(true);
    api.getAttendance({ date: selectedDate })
      .then((data) => {
        setRecords(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = records.filter(
    (r) =>
      (r.employeeName && r.employeeName.toLowerCase().includes(search.toLowerCase())) ||
      (r.employeeCode && r.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
      (r.siteName && r.siteName.toLowerCase().includes(search.toLowerCase()))
  );

  const presentCount = records.filter((r) => r.punchIn).length;
  const verifiedCount = records.filter((r) => r.gpsVerified).length;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#1A2B79]">Live Attendance Monitor</h2>
          <p className="text-xs text-slate-500">Real-time GPS geofence verified muster roll</p>
        </div>
        <button
          onClick={loadAttendance}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Date & KPI Summary */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
          />
          <span className="text-[10px] text-slate-400 font-mono">Today's Muster</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-100">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Total Punched In</span>
            <span className="text-base font-black text-[#1A2B79]">{presentCount}</span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <span className="text-[10px] text-emerald-700 block">GPS Verified</span>
            <span className="text-base font-black text-emerald-700">{verifiedCount}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by guard name, badge, or site..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-[#1A2B79]"
        />
        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
      </div>

      {/* Muster List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
            No attendance punches recorded for this date.
          </div>
        ) : (
          filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{rec.employeeName}</span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    {rec.employeeCode}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin size={10} className="text-rose-500" />
                  {rec.siteName || 'Assigned Site'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono pt-0.5">
                  <span className="text-emerald-700 font-bold">In: {rec.punchIn || '--:--'}</span>
                  {rec.punchOut && <span className="text-slate-500">Out: {rec.punchOut}</span>}
                </div>
              </div>

              <div className="text-right space-y-1">
                {rec.gpsVerified ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={11} /> INSIDE GEOFENCE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle size={11} /> OUTSIDE
                  </span>
                )}
                <p className="text-[9px] text-slate-400 font-mono">
                  {rec.punchInLatitude ? `${rec.punchInLatitude.toFixed(3)}, ${rec.punchInLongitude.toFixed(3)}` : 'Logged'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

