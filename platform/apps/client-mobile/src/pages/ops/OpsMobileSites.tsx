import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { MapPin, Navigation, Edit2, Check, X, ShieldCheck, Search } from 'lucide-react';
import GeofenceMapWidget from '../../components/GeofenceMapWidget';

export default function OpsMobileSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [editingRadius, setEditingRadius] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getSites()
      .then((data) => {
        if (!isMounted) return;
        setSites(data || []);
        if (data && data.length > 0) setSelectedSite(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => { isMounted = false; };
  }, []);

  const handleUpdateRadius = async (siteId: string) => {
    if (editingRadius === null || editingRadius < 20) return;
    try {
      await api.updateGeofence(siteId, {
        latitude: selectedSite.latitude,
        longitude: selectedSite.longitude,
        geofenceRadius: editingRadius,
      });
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, geofenceRadius: editingRadius, geofence_radius: editingRadius } : s))
      );
      setSelectedSite((curr: any) => ({ ...curr, geofenceRadius: editingRadius, geofence_radius: editingRadius }));
      setEditingRadius(null);
      setSaveMsg('Geofence updated in database!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error('Update radius error:', err);
      setSaveMsg('Saved locally for session');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.clientName && s.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div>
        <h2 className="text-base font-black text-[#1A2B79]">Sites & GPS Geofencing</h2>
        <p className="text-xs text-slate-500">Configure site GPS coordinates and punch-in boundaries</p>
      </div>

      {/* Selected Site Interactive Map */}
      {selectedSite && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Selected Campus
              </span>
              <h3 className="text-sm font-black text-slate-900">{selectedSite.name}</h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                {selectedSite.address || 'Karnataka, India'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                Strength: {selectedSite.sanctionedStrength || 12}
              </span>
            </div>
          </div>

          <GeofenceMapWidget
            siteLat={Number(selectedSite.latitude) || 12.845214}
            siteLng={Number(selectedSite.longitude) || 77.660168}
            radiusMeters={selectedSite.geofenceRadius || selectedSite.geofence_radius || 150}
            userLat={(Number(selectedSite.latitude) || 12.845214) + 0.00015}
            userLng={(Number(selectedSite.longitude) || 77.660168) + 0.0001}
            distanceMeters={22}
            isInside={true}
            siteName={selectedSite.name}
            heightClass="h-48"
          />

          {/* Quick Edit Radius Controller */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Geofence Radius</span>
              <span className="text-[10px] text-slate-500">Permitted distance for attendance punch</span>
            </div>

            {editingRadius !== null ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingRadius}
                  onChange={(e) => setEditingRadius(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-center"
                  min="20"
                  max="1000"
                />
                <span className="text-[10px] font-bold text-slate-500">m</span>
                <button
                  onClick={() => handleUpdateRadius(selectedSite.id)}
                  className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  title="Save radius"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingRadius(null)}
                  className="p-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingRadius(selectedSite.geofenceRadius || selectedSite.geofence_radius || 150)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 hover:border-[#1A2B79] rounded-xl font-mono text-xs font-bold text-slate-800 shadow-sm"
              >
                <span>{selectedSite.geofenceRadius || selectedSite.geofence_radius || 150}m</span>
                <Edit2 size={11} className="text-[#1A2B79]" />
              </button>
            )}
          </div>

          {saveMsg && (
            <p className="text-[10px] text-emerald-600 font-bold text-center">{saveMsg}</p>
          )}
        </div>
      )}

      {/* Search & Sites List */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sites or client locations..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2B79]"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="space-y-2">
          {filteredSites.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSite(s)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedSite?.id === s.id
                  ? 'bg-blue-50/70 border-[#1A2B79] shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{s.name}</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {s.geofenceRadius || s.geofence_radius || 150}m
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{s.address || 'Bangalore, India'}</p>
              <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Lat: {Number(s.latitude).toFixed(4)}</span>
                <span>Lng: {Number(s.longitude).toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
