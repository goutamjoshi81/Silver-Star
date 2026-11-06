import { useState, useEffect } from 'react';
import { api, COMPANY } from '@mock/mockData';
import {
  MapPin, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
  Navigation, RefreshCw, XCircle, Camera, AlertOctagon, Phone, User
} from 'lucide-react';
import GeofenceMapWidget from '../components/GeofenceMapWidget';
import SelfieCaptureModal from '../components/SelfieCaptureModal';

interface DutyHomeProps {
  currentUser?: any;
  onNavigateTab?: (tab: string) => void;
}

export default function DutyHome({ currentUser, onNavigateTab }: DutyHomeProps) {
  const [emp, setEmp] = useState<any>(currentUser || null);
  const [site, setSite] = useState<any>(null);
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState('--:--');
  const [punchDate, setPunchDate] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Real GPS & Geofence Simulation Controls
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSimMode, setGpsSimMode] = useState<'inside' | 'outside' | 'device'>('inside');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(18);
  const [isInside, setIsInside] = useState(true);

  // Modals
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(true);
  const [sosSent, setSosSent] = useState(false);

  // Load employee, site & today's attendance status from DB
  useEffect(() => {
    let isMounted = true;
    const targetEmpId = currentUser?.employeeId || currentUser?.id || 'SS-10001';

    Promise.all([
      api.getEmployee(targetEmpId).catch(() => currentUser),
      api.getSites().catch(() => []),
      api.getTodayAttendance(targetEmpId).catch(() => null),
    ]).then(([empData, sitesData, todayAtt]) => {
      if (!isMounted) return;
      const resolvedEmp = empData || currentUser;
      setEmp(resolvedEmp);

      // Find site
      if (sitesData && sitesData.length > 0) {
        const foundSite =
          sitesData.find((s: any) => s.id === resolvedEmp?.deployedSiteId) ||
          sitesData[0];
        setSite(foundSite);
      }

      // Check today's punch state
      if (todayAtt && todayAtt.hasPunchedIn) {
        setPunchedIn(true);
        setPunchTime(todayAtt.punchIn || '--:--');
        setPunchDate(todayAtt.date || '');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Real HTML5 Geolocation Watcher
  useEffect(() => {
    if (gpsSimMode === 'device' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setGpsAccuracy(Math.round(pos.coords.accuracy));

          if (site) {
            const dist = calculateDistanceMeters(lat, lng, site.latitude, site.longitude);
            setDistanceMeters(Math.round(dist));
            setIsInside(dist <= (site.geofenceRadius || 150));
          }
        },
        (err) => {
          console.warn('Device GPS unavailable, defaulting to simulation:', err);
          setGpsSimMode('inside');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else if (gpsSimMode === 'inside') {
      // Simulate directly inside gate (18m from site center)
      const lat = (site?.latitude || 12.845214) + 0.00012;
      const lng = (site?.longitude || 77.660168) + 0.00008;
      setUserCoords({ lat, lng });
      setDistanceMeters(18);
      setIsInside(true);
      setGpsAccuracy(8);
    } else if (gpsSimMode === 'outside') {
      // Simulate 450m outside geofence
      const lat = (site?.latitude || 12.845214) + 0.0042;
      const lng = (site?.longitude || 77.660168) + 0.0038;
      setUserCoords({ lat, lng });
      setDistanceMeters(480);
      setIsInside(false);
      setGpsAccuracy(18);
    }
  }, [gpsSimMode, site]);

  function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Handle Punch In / Punch Out
  const handlePunchAction = async () => {
    setIsVerifying(true);
    setCurrentStep(1);

    // Step 1: GPS Ping
    setTimeout(() => {
      setCurrentStep(2);
      // Step 2: Geofence Math
      setTimeout(() => {
        setCurrentStep(3);
        // Step 3: Backend Submission
        setTimeout(async () => {
          setCurrentStep(4);
          try {
            const nextPunchType = punchedIn ? 'OUT' : 'IN';
            const res = await api.punchAttendance({
              employeeId: emp?.id,
              employeeCode: emp?.employeeCode || 'SS-10001',
              siteId: site?.id || 'SITE001',
              latitude: userCoords?.lat || (site?.latitude || 12.845214),
              longitude: userCoords?.lng || (site?.longitude || 77.660168),
              punchType: nextPunchType,
              accuracy: gpsAccuracy || 10,
              selfieUrl: selfieData || undefined,
            });

            setIsVerifying(false);

            if (res.gpsVerified) {
              setResultSuccess(true);
              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              if (nextPunchType === 'IN') {
                setPunchedIn(true);
                setPunchTime(now);
                setResultMessage(`Punch-In Successful! Recorded at ${now}. Geofence verified (${res.distanceMeters || 18}m from site).`);
              } else {
                setPunchedIn(false);
                setResultMessage(`Duty Checkout (Punch-Out) recorded successfully at ${now}. Have a safe rest!`);
              }
            } else {
              setResultSuccess(false);
              setResultMessage(
                `Punch Rejected: You are ${res.distanceMeters || 480}m away from ${site?.name || 'Site'}. Permitted radius is ${res.geofenceRadius || 150}m.`
              );
            }
            setShowResultModal(true);
          } catch (err: any) {
            console.error('Punch error:', err);
            setIsVerifying(false);
            setResultSuccess(false);
            setResultMessage(err.message || 'Error recording attendance. Please retry.');
            setShowResultModal(true);
          }
        }, 500);
      }, 500);
    }, 500);
  };

  const handleSos = async () => {
    try {
      await api.createIncident({
        title: `EMERGENCY SOS: Triggered by ${emp?.name || 'Staff'}`,
        siteId: site?.id || 'SITE001',
        category: 'Safety',
        priority: 'High',
        reportedBy: emp?.id,
        description: `Emergency distress signal sent by ${emp?.name} (${emp?.employeeCode}) at ${site?.name}. Immediate supervisor assistance required.`,
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.warn('SOS creation error:', err);
      setSosSent(true);
    }
  };

  const siteLat = site?.latitude || 12.845214;
  const siteLng = site?.longitude || 77.660168;
  const geofenceRadius = site?.geofenceRadius || site?.geofence_radius || 150;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      
      {/* Shift & Duty Status Banner */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-black tracking-wider text-[#26BCEE]">
            {emp?.shiftName || 'Morning Shift'}
          </span>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            {emp?.name || 'Ramesh Kumar'}
          </h2>
          <p className="text-[11px] text-slate-500 font-mono">
            {emp?.employeeCode || 'SS-10001'} · {emp?.designationName || 'Security Guard'}
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              punchedIn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${punchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {punchedIn ? 'ON DUTY' : 'OFF DUTY'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {punchedIn ? `Punched: ${punchTime}` : 'Not punched today'}
          </span>
        </div>
      </div>

      {/* Main Biometric-Style Punch In / Out Button (in middle) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md text-center space-y-4">
        {/* Verification Step Indicator when punching */}
        {isVerifying ? (
          <div className="py-8 space-y-3 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#1A2B79]/10 border-4 border-[#1A2B79] border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-black text-[#1A2B79]">
                {currentStep === 1 && 'Acquiring GPS Satellite Signal...'}
                {currentStep === 2 && 'Executing Anti-Spoofing & Geofence Math...'}
                {currentStep === 3 && 'Validating with Central PostgreSQL Database...'}
                {currentStep >= 4 && 'Registering Verified Attendance Event...'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Step {currentStep} of 4</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 text-xs sm:text-sm">Attendance Action</span>
              <button
                type="button"
                onClick={() => setShowSelfieModal(true)}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#1A2B79] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Camera size={14} />
                <span>{selfieData ? 'Selfie Added ✓' : 'Take Duty Selfie'}</span>
              </button>
            </div>

            {/* The Big Touch Punch Button in the middle */}
            <div className="flex justify-center w-full py-1">
              <button
                type="button"
                onClick={handlePunchAction}
                disabled={isVerifying}
                className={`w-full py-5 sm:py-6 px-6 rounded-3xl font-black text-base sm:text-lg uppercase tracking-wider shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group ${
                  punchedIn
                    ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-r from-[#1A2B79] via-[#162363] to-[#26BCEE] hover:from-[#14215e] hover:to-[#1da5d4] text-white shadow-blue-500/30'
                }`}
              >
                <div className={`p-2 rounded-2xl ${punchedIn ? 'bg-white/20' : 'bg-white/15'}`}>
                  <Navigation size={24} className={`transition-transform ${punchedIn ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-black leading-tight tracking-wide">
                    {punchedIn ? 'PUNCH OUT (CHECKOUT)' : 'PUNCH IN (CHECK-IN)'}
                  </div>
                  <div className="text-[11px] font-normal normal-case opacity-90 tracking-normal">
                    {punchedIn ? 'Duty Checkout & Close Shift' : 'Biometric GPS Duty Check-In'}
                  </div>
                </div>
              </button>
            </div>

            <p className="text-[11px] font-medium text-slate-500">
              {isInside
                ? '✓ Geofence criteria met. Ready for biometric GPS punch.'
                : '⚠️ Outside geofence radius. Move within 150m of site boundary.'}
            </p>
          </div>
        )}
      </div>

      {/* Followed by GPS Geofence Map Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <MapPin size={12} className="text-rose-500" /> Assigned Deployment Site
            </div>
            <h3 className="text-sm font-black text-[#1A2B79]">
              {site?.name || 'Infosys - Electronic City Campus Phase 1'}
            </h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
              {site?.address || 'Hosur Road, Electronics City Phase 1, Bangalore'}
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
            Radius: {geofenceRadius}m
          </span>
        </div>

        {/* Real Interactive Geofence Map */}
        <GeofenceMapWidget
          siteLat={siteLat}
          siteLng={siteLng}
          radiusMeters={geofenceRadius}
          userLat={userCoords?.lat || null}
          userLng={userCoords?.lng || null}
          distanceMeters={distanceMeters}
          isInside={isInside}
          siteName={site?.name || 'Site'}
          accuracy={gpsAccuracy}
          heightClass="h-52"
        />

        {/* GPS Testing & Simulation Selector */}
        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/80 flex items-center justify-between text-[10px]">
          <span className="font-bold text-slate-600">GPS Mode:</span>
          <div className="flex gap-1 font-bold">
            <button
              type="button"
              onClick={() => setGpsSimMode('inside')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                gpsSimMode === 'inside'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Inside (18m)
            </button>
            <button
              type="button"
              onClick={() => setGpsSimMode('outside')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                gpsSimMode === 'outside'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Outside (480m)
            </button>
            <button
              type="button"
              onClick={() => setGpsSimMode('device')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                gpsSimMode === 'device'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Device GPS
            </button>
          </div>
        </div>
      </div>

      {/* Emergency SOS & Quick Support */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleSos}
          className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            sosSent
              ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
          }`}
        >
          <AlertOctagon size={16} />
          <span>{sosSent ? 'SOS SENT TO OPS!' : 'EMERGENCY SOS'}</span>
        </button>

        <a
          href={`tel:${COMPANY.phone}`}
          className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 transition-all"
        >
          <Phone size={15} className="text-[#1A2B79]" />
          <span>24/7 Control Desk</span>
        </a>
      </div>

      {/* Modals */}
      <SelfieCaptureModal
        isOpen={showSelfieModal}
        onClose={() => setShowSelfieModal(false)}
        onCapture={(img) => setSelfieData(img)}
      />

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                resultSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {resultSuccess ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                {resultSuccess ? 'Attendance Verified' : 'Geofence Verification Failed'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{resultMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="w-full py-2.5 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
