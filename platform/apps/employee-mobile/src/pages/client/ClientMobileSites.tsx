import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { MapPin, Building, ShieldCheck, Users } from 'lucide-react';
import GeofenceMapWidget from '../../components/GeofenceMapWidget';

interface ClientMobileSitesProps {
  currentUser?: any;
}

export default function ClientMobileSites({ currentUser }: ClientMobileSitesProps) {
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const targetClientId = currentUser?.clientId || currentUser?.id || 'CLI001';

    api.getSites(targetClientId)
      .then((data) => {
        if (!isMounted) return;
        setSites(data || []);
        if (data && data.length > 0) setSelectedSite(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => { isMounted = false; };
  }, [currentUser]);

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div>
        <h2 className="text-base font-black text-[#1A2B79]">Authorized Campuses & Sites</h2>
        <p className="text-xs text-slate-500">Geofenced client locations protected by Silver Star</p>
      </div>

      {selectedSite && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Campus Boundary
              </span>
              <h3 className="text-sm font-black text-slate-900">{selectedSite.name}</h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                {selectedSite.address || 'Electronics City, Bangalore'}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
              Radius: {selectedSite.geofenceRadius || 150}m
            </span>
          </div>

          <GeofenceMapWidget
            siteLat={Number(selectedSite.latitude) || 12.845214}
            siteLng={Number(selectedSite.longitude) || 77.660168}
            radiusMeters={selectedSite.geofenceRadius || selectedSite.geofence_radius || 150}
            userLat={(Number(selectedSite.latitude) || 12.845214) + 0.0001}
            userLng={(Number(selectedSite.longitude) || 77.660168) + 0.0001}
            distanceMeters={15}
            isInside={true}
            siteName={selectedSite.name}
            heightClass="h-48"
          />

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-100">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Sanctioned Guards</span>
              <span className="text-base font-black text-[#1A2B79]">{selectedSite.sanctionedStrength || 24}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl">
              <span className="text-[10px] text-emerald-700 block">Status</span>
              <span className="text-base font-black text-emerald-700">24x7 Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Sites list */}
      <div className="space-y-2">
        {sites.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedSite(s)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedSite?.id === s.id
                ? 'bg-blue-50/70 border-[#1A2B79] shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{s.name}</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {s.geofenceRadius || 150}m radius
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.address || 'Bangalore, India'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

