import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { THIRD_PARTY_CONFIG } from '@mock/mockData';

interface GeofenceMapWidgetProps {
  siteLat: number;
  siteLng: number;
  radiusMeters: number;
  userLat: number | null;
  userLng: number | null;
  distanceMeters: number | null;
  isInside: boolean;
  siteName: string;
  accuracy?: number | null;
  heightClass?: string;
}

export default function GeofenceMapWidget({
  siteLat,
  siteLng,
  radiusMeters = 150,
  userLat,
  userLng,
  distanceMeters,
  isInside,
  siteName,
  accuracy = 12,
  heightClass = 'h-56',
}: GeofenceMapWidgetProps) {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [zoom, setZoom] = useState(17);
  const containerRef = useRef<HTMLDivElement>(null);

  // If user provides a Google Maps API Key, this will load the Google Maps JavaScript API
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const gmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (THIRD_PARTY_CONFIG.googleMapsApiKey && typeof window !== 'undefined') {
      if ((window as any).google?.maps) {
        setGoogleLoaded(true);
      } else {
        const scriptId = 'google-maps-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${THIRD_PARTY_CONFIG.googleMapsApiKey}&libraries=geometry`;
          script.async = true;
          script.onload = () => setGoogleLoaded(true);
          document.head.appendChild(script);
        }
      }
    }
  }, []);

  // When google is loaded, render Google Map
  useEffect(() => {
    if (googleLoaded && gmapRef.current && (window as any).google?.maps) {
      const g = (window as any).google.maps;
      const map = new g.Map(gmapRef.current, {
        center: { lat: siteLat, lng: siteLng },
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Geofence Circle
      new g.Circle({
        strokeColor: isInside ? '#10B981' : '#EF4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: isInside ? '#10B981' : '#EF4444',
        fillOpacity: 0.2,
        map,
        center: { lat: siteLat, lng: siteLng },
        radius: radiusMeters,
      });

      // Site Marker
      new g.Marker({
        position: { lat: siteLat, lng: siteLng },
        map,
        title: siteName,
      });

      // User Marker
      if (userLat && userLng) {
        new g.Marker({
          position: { lat: userLat, lng: userLng },
          map,
          title: 'You are here',
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          },
        });
      }
    }
  }, [googleLoaded, siteLat, siteLng, userLat, userLng, isInside, radiusMeters, siteName]);

  // OpenStreetMap static tile calculation for fallback view
  // Slippy map tile formula
  const n = Math.pow(2, zoom);
  const latRad = (siteLat * Math.PI) / 180;
  const tileX = Math.floor(((siteLng + 180) / 360) * n);
  const tileY = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);

  // If using Google Maps and loaded
  if (googleLoaded) {
    return (
      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-inner`}>
        <div ref={gmapRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow border border-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Google Maps Engine
        </div>
      </div>
    );
  }

  // OpenStreetMap interactive canvas representation
  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 select-none`}
    >
      {/* Background Cartography Tiles */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300 opacity-90"
        style={{
          backgroundImage: `url('https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png')`,
          filter: mapType === 'satellite' ? 'contrast(1.2) brightness(0.85)' : 'none',
        }}
      />

      {/* Grid Pattern Overlay to feel like a high-tech radar HUD */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #26BCEE 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Visual Geofence Perimeter (SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <radialGradient id="geofenceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isInside ? '#10B981' : '#F59E0B'} stopOpacity="0.25" />
            <stop offset="80%" stopColor={isInside ? '#10B981' : '#F59E0B'} stopOpacity="0.10" />
            <stop offset="100%" stopColor={isInside ? '#10B981' : '#EF4444'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center Geofence Circle */}
        <circle
          cx="50%"
          cy="50%"
          r="72"
          fill="url(#geofenceGlow)"
          stroke={isInside ? '#10B981' : '#F59E0B'}
          strokeWidth="2.5"
          strokeDasharray="6 4"
          className="animate-[spin_40s_linear_infinite]"
        />

        {/* Outer boundary buffer */}
        <circle
          cx="50%"
          cy="50%"
          r="92"
          fill="none"
          stroke={isInside ? '#10B981' : '#EF4444'}
          strokeWidth="1"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Site Facility Center Marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
        <div className="w-9 h-9 rounded-2xl bg-[#1A2B79] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#1A2B79]/20">
          <MapPin size={18} className="text-[#26BCEE]" />
        </div>
        <span className="mt-1 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow truncate max-w-[150px]">
          {siteName}
        </span>
      </div>

      {/* User Position Indicator */}
      <div
        className={`absolute z-20 flex flex-col items-center pointer-events-none transition-all duration-500 ${
          isInside ? 'top-[44%] left-[54%]' : 'top-[22%] left-[78%]'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute w-7 h-7 rounded-full bg-blue-500 animate-ping opacity-60" />
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
        <span className="mt-1 bg-blue-900/90 text-blue-100 text-[8px] font-extrabold px-1.5 py-0.2 rounded shadow">
          You ({distanceMeters !== null ? `${distanceMeters}m` : 'Detecting'})
        </span>
      </div>

      {/* Top Left Status Badge */}
      <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
        <div
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md border flex items-center gap-1.5 ${
            isInside
              ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/85 text-amber-300 border-amber-500/40'
          }`}
        >
          {isInside ? (
            <>
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>INSIDE GEOFENCE ({radiusMeters}M RADIUS)</span>
            </>
          ) : (
            <>
              <AlertCircle size={12} className="text-amber-400" />
              <span>OUTSIDE GEOFENCE ({distanceMeters ? `${distanceMeters}m away` : '150m+'})</span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Map Style & Zoom Controls */}
      <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(19, z + 1))}
          className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow text-xs font-bold flex items-center justify-center"
          title="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(14, z - 1))}
          className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow text-xs font-bold flex items-center justify-center"
          title="Zoom Out"
        >
          -
        </button>
      </div>

      {/* Bottom Coordinates & Accuracy Chip */}
      <div className="absolute bottom-2 left-2 right-2 z-30 flex items-center justify-between text-[9px] font-mono font-medium text-slate-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
        <div className="flex items-center gap-1 truncate">
          <Compass size={11} className="text-cyan-400" />
          <span>
            {siteLat.toFixed(5)}, {siteLng.toFixed(5)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] text-cyan-300">
          <span>GPS Accuracy: ±{accuracy || 10}m</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}

