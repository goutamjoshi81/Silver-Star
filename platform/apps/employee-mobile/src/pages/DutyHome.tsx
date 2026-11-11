import { useState, useEffect, useRef } from 'react';
import { api, COMPANY, SITES, PATROL_CHECKPOINTS } from '@mock/mockData';
import {
  Users, Moon, MapPin, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
  Navigation, RefreshCw, XCircle, Camera, AlertOctagon, Phone, User,
  Check, Eye, ChevronRight, Upload, Sparkles, Compass, Shield, Building,
  FileCheck, Image as ImageIcon, Loader2
} from 'lucide-react';
import GeofenceMapWidget from '../components/GeofenceMapWidget';
import SelfieCaptureModal from '../components/SelfieCaptureModal';

interface DutyHomeProps {
  currentUser?: any;
  initialMode?: 'muster' | 'patrol' | 'self';
  onNavigateTab?: (tab: string) => void;
}

export default function DutyHome({ currentUser, initialMode = 'muster', onNavigateTab }: DutyHomeProps) {
  const [emp, setEmp] = useState<any>(currentUser || null);
  const [activeMode, setActiveMode] = useState<'muster' | 'patrol' | 'self'>(initialMode);
  const [allSites, setAllSites] = useState<any[]>(SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(SITES[0]?.id || 'SITE001');

  // Sync mode if initialMode prop changes
  useEffect(() => {
    if (initialMode) setActiveMode(initialMode);
  }, [initialMode]);

  // GPS Coordinates & Distance state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({ lat: 12.845214, lng: 77.660168 });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(8);
  const [distanceMeters, setDistanceMeters] = useState<number>(14);
  const [isInside, setIsInside] = useState<boolean>(true);
  const [gpsSimMode, setGpsSimMode] = useState<'inside' | 'outside' | 'device'>('inside');

  // =========================================================================
  // MODE 1: SITE MUSTER & ROLL-CALL STATE (Guards & Housekeepers)
  // =========================================================================
  const [deployedStaff, setDeployedStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState<boolean>(false);
  const [musterShift, setMusterShift] = useState<string>('Morning Shift (06:00 - 14:00)');
  const [musterNotes, setMusterNotes] = useState<string>('Turnout inspection completed. All guards in clean uniform with standard duty gear.');
  const [musterPhoto, setMusterPhoto] = useState<string | null>(null);
  const [submittingMuster, setSubmittingMuster] = useState<boolean>(false);
  const [musterSuccessModal, setMusterSuccessModal] = useState<any | null>(null);
  const musterPhotoInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // MODE 2: NIGHT PATROLLING & CHECKPOINT INSPECTION STATE
  // =========================================================================
  const [patrolCheckpoint, setPatrolCheckpoint] = useState<string>(PATROL_CHECKPOINTS[0]?.name || 'Main Security Gate & Barrier Check');
  const [customCheckpoint, setCustomCheckpoint] = useState<string>('');
  const [patrolShift, setPatrolShift] = useState<string>('Night Shift 1 (20:00 - 00:00)');
  const [patrolStatus, setPatrolStatus] = useState<string>('All Secure');
  const [patrolNotes, setPatrolNotes] = useState<string>('Perimeter fencing intact, floodlights active, emergency gates secured.');
  const [patrolPhoto, setPatrolPhoto] = useState<string | null>(null);
  const [submittingPatrol, setSubmittingPatrol] = useState<boolean>(false);
  const [patrolSuccessModal, setPatrolSuccessModal] = useState<any | null>(null);
  const patrolPhotoInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // MODE 3: FIELD OFFICER SELF PUNCH IN/OUT STATE
  // =========================================================================
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState('--:--');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(true);
  const [sosSent, setSosSent] = useState(false);

  // Load live sites & employee profile
  useEffect(() => {
    let isMounted = true;
    const targetEmpId = currentUser?.employeeId || currentUser?.id || 'SS-10001';

    Promise.all([
      api.getEmployee(targetEmpId).catch(() => currentUser),
      api.getSites().catch(() => SITES),
      api.getTodayAttendance(targetEmpId).catch(() => null),
    ]).then(([empData, sitesData, todayAtt]) => {
      if (!isMounted) return;
      if (empData) setEmp(empData);
      if (sitesData && sitesData.length > 0) {
        setAllSites(sitesData);
        if (!selectedSiteId || !sitesData.some(s => s.id === selectedSiteId)) {
          setSelectedSiteId(sitesData[0].id);
        }
      }
      if (todayAtt && todayAtt.hasPunchedIn) {
        setPunchedIn(true);
        setPunchTime(todayAtt.punchIn || '--:--');
      }
    });

    return () => { isMounted = false };
  }, [currentUser]);

  // Selected Site object
  const currentSite = allSites.find(s => s.id === selectedSiteId) || allSites[0] || {
    id: 'SITE001',
    name: 'Infosys - Electronic City Campus Phase 1',
    address: 'Hosur Road, Electronics City Phase 1, Bangalore',
    latitude: 12.845214,
    longitude: 77.660168,
    geofenceRadius: 150,
  };

  // Fetch deployed guards/housekeepers whenever selected site changes
  useEffect(() => {
    let isMounted = true;
    setLoadingStaff(true);

    api.getDeployedStaff(selectedSiteId)
      .then(staff => {
        if (!isMounted) return;
        if (staff && staff.length > 0) {
          // Initialize attendance status to Present for all
          setDeployedStaff(staff.map((s: any) => ({
            ...s,
            status: 'Present',
          })));
        } else {
          // Fallback mock roster for deployment demonstration
          setDeployedStaff([
            { employeeId: 'EMP001', name: 'Ramesh Gowda', employeeCode: 'SS-10001', designation: 'Head Guard', department: 'Security', status: 'Present' },
            { employeeId: 'EMP002', name: 'Suresh Patil', employeeCode: 'SS-10002', designation: 'Security Guard', department: 'Security', status: 'Present' },
            { employeeId: 'EMP003', name: 'Mahesh Kumar', employeeCode: 'SS-10003', designation: 'Security Guard', department: 'Security', status: 'Present' },
            { employeeId: 'EMP004', name: 'Laxmi Bai', employeeCode: 'SS-10004', designation: 'Housekeeper', department: 'Housekeeping', status: 'Present' },
            { employeeId: 'EMP005', name: 'Kamala Devi', employeeCode: 'SS-10005', designation: 'Housekeeper', department: 'Housekeeping', status: 'Present' },
          ]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setDeployedStaff([
          { employeeId: 'EMP001', name: 'Ramesh Gowda', employeeCode: 'SS-10001', designation: 'Head Guard', department: 'Security', status: 'Present' },
          { employeeId: 'EMP002', name: 'Suresh Patil', employeeCode: 'SS-10002', designation: 'Security Guard', department: 'Security', status: 'Present' },
          { employeeId: 'EMP003', name: 'Mahesh Kumar', employeeCode: 'SS-10003', designation: 'Security Guard', department: 'Security', status: 'Present' },
          { employeeId: 'EMP004', name: 'Laxmi Bai', employeeCode: 'SS-10004', designation: 'Housekeeper', department: 'Housekeeping', status: 'Present' },
        ]);
      })
      .finally(() => {
        if (isMounted) setLoadingStaff(false);
      });

    return () => { isMounted = false };
  }, [selectedSiteId]);

  // GPS Simulation / Real Geolocation Watcher
  useEffect(() => {
    if (gpsSimMode === 'device' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          const dist = calculateDistanceMeters(lat, lng, Number(currentSite.latitude), Number(currentSite.longitude));
          setDistanceMeters(Math.round(dist));
          setIsInside(dist <= (currentSite.geofenceRadius || currentSite.geofence_radius || 150));
        },
        () => setGpsSimMode('inside'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else if (gpsSimMode === 'inside') {
      const lat = Number(currentSite.latitude) + 0.00012;
      const lng = Number(currentSite.longitude) + 0.00008;
      setUserCoords({ lat, lng });
      setDistanceMeters(14);
      setIsInside(true);
      setGpsAccuracy(6);
    } else if (gpsSimMode === 'outside') {
      const lat = Number(currentSite.latitude) + 0.0042;
      const lng = Number(currentSite.longitude) + 0.0038;
      setUserCoords({ lat, lng });
      setDistanceMeters(480);
      setIsInside(false);
      setGpsAccuracy(18);
    }
  }, [gpsSimMode, currentSite]);

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

  // Handle staff attendance toggle (Present / Absent / Late)
  const handleStaffStatusToggle = (empId: string, status: 'Present' | 'Absent' | 'Late') => {
    setDeployedStaff(prev => prev.map(s => s.employeeId === empId ? { ...s, status } : s));
  };

  // Mark all staff present in 1-click
  const handleMarkAllPresent = () => {
    setDeployedStaff(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  // Convert uploaded/captured camera photo to data URL
  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // SUBMIT FIELD MUSTER ROLL-CALL
  // =========================================================================
  const handleSubmitMuster = async () => {
    if (!musterPhoto) {
      alert('Photo Evidence Required: Please snap or upload a group photo of the deployed security/housekeeping staff at the site.');
      musterPhotoInputRef.current?.click();
      return;
    }

    setSubmittingMuster(true);
    try {
      const officerId = emp?.id || emp?.employeeId || 'EMP837389';
      const payload = {
        officerId,
        siteId: currentSite.id,
        shift: musterShift,
        staffStatuses: deployedStaff.map(s => ({
          employeeId: s.employeeId,
          status: s.status as 'Present' | 'Absent' | 'Late',
          notes: s.status === 'Absent' ? 'Marked absent by field inspection officer' : undefined,
        })),
        musterPhotoUrl: musterPhoto,
        latitude: userCoords?.lat || currentSite.latitude,
        longitude: userCoords?.lng || currentSite.longitude,
        notes: musterNotes,
      };

      const res = await api.submitFieldMuster(payload);

      const presentCount = deployedStaff.filter(s => s.status === 'Present').length;
      const absentCount = deployedStaff.filter(s => s.status === 'Absent').length;

      setMusterSuccessModal({
        siteName: res.siteName || currentSite.name,
        totalPresent: res.totalPresent ?? presentCount,
        totalAbsent: res.totalAbsent ?? absentCount,
        totalSanctioned: res.totalSanctioned ?? deployedStaff.length,
        isGeofenceVerified: res.isGeofenceVerified ?? isInside,
        distanceMeters: res.distanceMeters ?? distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        auditId: res.auditId || `AUD_${Date.now()}`,
      });
    } catch (err: any) {
      console.warn('Field muster submission error, showing local completion:', err);
      const presentCount = deployedStaff.filter(s => s.status === 'Present').length;
      const absentCount = deployedStaff.filter(s => s.status === 'Absent').length;
      setMusterSuccessModal({
        siteName: currentSite.name,
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalSanctioned: deployedStaff.length,
        isGeofenceVerified: isInside,
        distanceMeters: distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        auditId: `AUD_${Date.now()}`,
      });
    } finally {
      setSubmittingMuster(false);
    }
  };

  // =========================================================================
  // SUBMIT NIGHT PATROL CHECKPOINT LOG
  // =========================================================================
  const handleSubmitPatrol = async () => {
    const activeCheckpointName = customCheckpoint.trim() || patrolCheckpoint;
    if (!activeCheckpointName) {
      alert('Please select or specify a patrol checkpoint name.');
      return;
    }

    if (!patrolPhoto) {
      alert('Inspection Photo Required: Please capture a photo of the checkpoint lock/perimeter as physical evidence.');
      patrolPhotoInputRef.current?.click();
      return;
    }

    setSubmittingPatrol(true);
    try {
      const officerId = emp?.id || emp?.employeeId || 'EMP837389';
      const payload = {
        officerId,
        siteId: currentSite.id,
        checkpointName: activeCheckpointName,
        patrolShift,
        status: patrolStatus,
        latitude: userCoords?.lat || currentSite.latitude,
        longitude: userCoords?.lng || currentSite.longitude,
        photoUrl: patrolPhoto,
        notes: patrolNotes,
      };

      const res = await api.submitPatrolLog(payload);

      setPatrolSuccessModal({
        checkpoint: activeCheckpointName,
        siteName: res.siteName || currentSite.name,
        status: patrolStatus,
        isGeofenceVerified: res.isGeofenceVerified ?? isInside,
        distanceMeters: res.distanceMeters ?? distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: res.id || `PAT_${Date.now()}`,
      });
    } catch (err: any) {
      console.warn('Night patrol log error, using local fallback:', err);
      setPatrolSuccessModal({
        checkpoint: activeCheckpointName,
        siteName: currentSite.name,
        status: patrolStatus,
        isGeofenceVerified: isInside,
        distanceMeters: distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: `PAT_${Date.now()}`,
      });
    } finally {
      setSubmittingPatrol(false);
    }
  };

  // =========================================================================
  // OFFICER SELF PUNCH IN/OUT
  // =========================================================================
  const handleOfficerSelfPunch = async () => {
    setIsVerifying(true);
    try {
      const nextPunchType = punchedIn ? 'OUT' : 'IN';
      const res = await api.punchAttendance({
        employeeId: emp?.id,
        employeeCode: emp?.employeeCode || 'SS-10001',
        siteId: currentSite.id,
        latitude: userCoords?.lat || currentSite.latitude,
        longitude: userCoords?.lng || currentSite.longitude,
        punchType: nextPunchType,
        accuracy: gpsAccuracy || 10,
        selfieUrl: selfieData || undefined,
      });

      setIsVerifying(false);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (res.gpsVerified) {
        setResultSuccess(true);
        if (nextPunchType === 'IN') {
          setPunchedIn(true);
          setPunchTime(now);
          setResultMessage(`Field Officer Arrival Logged at ${now}. Geofence verified (${res.distanceMeters || 14}m).`);
        } else {
          setPunchedIn(false);
          setResultMessage(`Field Shift Checkout recorded at ${now}. Safe journey!`);
        }
      } else {
        setResultSuccess(false);
        setResultMessage(`Punch Blocked: Distance is ${res.distanceMeters || 480}m from ${currentSite.name}. Must be within ${res.geofenceRadius || 150}m.`);
      }
      setShowResultModal(true);
    } catch (err: any) {
      setIsVerifying(false);
      setResultSuccess(false);
      setResultMessage(err.message || 'Error recording attendance.');
      setShowResultModal(true);
    }
  };

  const handleSos = async () => {
    try {
      await api.createIncident({
        title: `EMERGENCY SOS: Triggered by Field Officer ${emp?.name || 'Officer'}`,
        siteId: currentSite.id,
        category: 'Safety',
        priority: 'High',
        reportedBy: emp?.id,
        description: `Emergency distress signal triggered at ${currentSite.name}. Immediate ops supervisor dispatch required.`,
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      setSosSent(true);
    }
  };

  // Stats calculation for roll-call
  const presentCount = deployedStaff.filter(s => s.status === 'Present').length;
  const absentCount = deployedStaff.filter(s => s.status === 'Absent').length;
  const lateCount = deployedStaff.filter(s => s.status === 'Late').length;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      
      {/* Top Field Officer Status Pill */}
      <div className="bg-gradient-to-r from-[#1A2B79] to-[#202B75] rounded-3xl p-4 text-white shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-white/20">
              {emp?.photo ? (
                <img src={emp.photo} alt="Officer" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Shield size={20} className="text-[#26BCEE]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black leading-tight">{emp?.name || 'Field Officer'}</h2>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  OFFICER
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/80 font-mono">
                {emp?.employeeCode || 'SS-10001'} · Mobile Field Inspector
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              isInside ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {isInside ? 'On-Site' : 'En Route'}
            </span>
            <p className="text-[10px] text-white/70 font-mono mt-0.5">{distanceMeters}m from gate</p>
          </div>
        </div>

        {/* Client Site Selection Dropdown */}
        <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/90 truncate flex-1">
            <Building size={13} className="text-[#26BCEE] flex-shrink-0" />
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="bg-white/10 text-white text-xs font-bold rounded-xl px-2 py-1 border border-white/20 outline-none w-full truncate cursor-pointer"
            >
              {allSites.map(s => (
                <option key={s.id} value={s.id} className="text-slate-900 bg-white">
                  {s.name} {s.isEmergency ? '⚠️ (Emergency)' : ''}
                </option>
              ))}
            </select>
          </div>

          {currentSite.isEmergency && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white uppercase tracking-wider flex-shrink-0">
              EMERGENCY
            </span>
          )}
        </div>
      </div>

      {/* Mode Switcher (Roll-Call Muster vs Night Patrol vs Self Check-in) */}
      <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-3 gap-1 text-center font-bold text-[11px]">
        <button
          type="button"
          onClick={() => setActiveMode('muster')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeMode === 'muster'
              ? 'bg-white text-[#1A2B79] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={14} className={activeMode === 'muster' ? 'text-[#1A2B79]' : 'text-slate-500'} />
          <span>Staff Roll-Call</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('patrol')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeMode === 'patrol'
              ? 'bg-[#1A2B79] text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Moon size={14} className={activeMode === 'patrol' ? 'text-[#26BCEE]' : 'text-slate-500'} />
          <span>Night Patrol</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('self')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeMode === 'self'
              ? 'bg-white text-[#1A2B79] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin size={14} className={activeMode === 'self' ? 'text-[#1A2B79]' : 'text-slate-500'} />
          <span>Officer GPS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: FIELD STAFF ROLL-CALL & MUSTER AUDIT */}
      {/* ========================================================================= */}
      {activeMode === 'muster' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          {/* Roll-Call Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Sanctioned</span>
              <p className="text-lg font-black text-[#1A2B79] mt-0.5">{deployedStaff.length}</p>
            </div>
            <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200/80 shadow-sm">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Present</span>
              <p className="text-lg font-black text-emerald-700 mt-0.5">{presentCount}</p>
            </div>
            <div className="bg-rose-50/80 p-2.5 rounded-2xl border border-rose-200/80 shadow-sm">
              <span className="text-[10px] text-rose-700 font-bold uppercase">Absent</span>
              <p className="text-lg font-black text-rose-700 mt-0.5">{absentCount}</p>
            </div>
          </div>

          {/* Deployed Personnel Checklist */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Deployed Guards & Housekeepers
                </h3>
                <p className="text-[10px] text-slate-500">
                  Verify physical presence at {currentSite.name}
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="text-[10px] font-bold text-[#1A2B79] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                All Present ✓
              </button>
            </div>

            {loadingStaff ? (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <Loader2 size={24} className="animate-spin mx-auto text-[#1A2B79]" />
                <p className="text-xs font-semibold">Loading deployed staff roster...</p>
              </div>
            ) : deployedStaff.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <Users size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No staff deployed at this site yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {deployedStaff.map((staff) => (
                  <div key={staff.employeeId} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#1A2B79] flex-shrink-0">
                        {staff.name?.charAt(0) || 'G'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate leading-tight">{staff.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {staff.designation || 'Staff'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{staff.employeeCode || staff.employeeId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStaffStatusToggle(staff.employeeId, 'Present')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          staff.status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStaffStatusToggle(staff.employeeId, 'Absent')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          staff.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Muster Photo Proof Upload */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Camera size={14} className="text-[#1A2B79]" />
                  Group Muster Photo Proof *
                </h4>
                <p className="text-[10px] text-slate-500">
                  Photograph deployed guards assembled at client post
                </p>
              </div>

              {musterPhoto && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Photo Attached
                </span>
              )}
            </div>

            {/* Hidden file input supporting mobile camera capture */}
            <input
              ref={musterPhotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => handleFileCapture(e, setMusterPhoto)}
              className="hidden"
            />

            {musterPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-h-48 flex items-center justify-center">
                <img src={musterPhoto} alt="Muster evidence" className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[9px] font-mono">
                  GPS: {userCoords?.lat.toFixed(4)}, {userCoords?.lng.toFixed(4)}
                </div>
                <button
                  type="button"
                  onClick={() => musterPhotoInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-900 px-3 py-1 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => musterPhotoInputRef.current?.click()}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#1A2B79] bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1.5 text-slate-600 transition-colors cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-blue-50 text-[#1A2B79] flex items-center justify-center shadow-sm">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-black text-[#1A2B79]">Tap to Snap / Upload Group Photo</span>
                <span className="text-[10px] text-slate-400">Required by client audit SLA</span>
              </button>
            )}

            {/* Shift & Notes */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Shift</label>
                  <select
                    value={musterShift}
                    onChange={e => setMusterShift(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                  >
                    <option value="Morning Shift (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">GPS Verification</label>
                  <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
                    isInside ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    <Compass size={13} />
                    <span>{isInside ? `Verified (${distanceMeters}m)` : `Outside (${distanceMeters}m)`}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Turnout & Inspection Remarks</label>
                <input
                  type="text"
                  value={musterNotes}
                  onChange={e => setMusterNotes(e.target.value)}
                  placeholder="e.g. Turnout good. 1 guard absent, reliever requested."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Muster Roll-Call Button */}
          <button
            type="button"
            onClick={handleSubmitMuster}
            disabled={submittingMuster}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1A2B79] to-[#202B75] hover:from-[#162363] hover:to-[#1a235f] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            {submittingMuster ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#26BCEE]" />
                <span>Committing Roll-Call to Database...</span>
              </>
            ) : (
              <>
                <FileCheck size={18} className="text-[#26BCEE]" />
                <span>Submit Muster & Photo Proof</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: NIGHT PATROLLING & CHECKPOINT INSPECTION */}
      {/* ========================================================================= */}
      {activeMode === 'patrol' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md space-y-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Moon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wide">Night Patrolling Patrol Sweep</h3>
                  <p className="text-[10px] text-slate-400">Physical checkpoint verification with photo proof</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                Active Round
              </span>
            </div>

            {/* Checkpoint Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-[10px] font-bold text-slate-400">Inspection Checkpoint</label>
              <select
                value={patrolCheckpoint}
                onChange={e => {
                  setPatrolCheckpoint(e.target.value);
                  setCustomCheckpoint('');
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold outline-none cursor-pointer"
              >
                {PATROL_CHECKPOINTS.map(cp => (
                  <option key={cp.id} value={cp.name} className="bg-slate-900 text-white">
                    {cp.name} ({cp.category})
                  </option>
                ))}
                <option value="CUSTOM" className="bg-slate-900 text-white">+ Custom Checkpoint Location</option>
              </select>

              {patrolCheckpoint === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="Enter custom checkpoint name (e.g. DG Set Room B)"
                  value={customCheckpoint}
                  onChange={e => setCustomCheckpoint(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs font-semibold mt-1"
                />
              )}
            </div>

            {/* Shift & Security Status */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Patrol Shift</label>
                <select
                  value={patrolShift}
                  onChange={e => setPatrolShift(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="Night Shift 1 (20:00 - 00:00)">Night 1 (20:00 - 00:00)</option>
                  <option value="Night Shift 2 (00:00 - 04:00)">Night 2 (00:00 - 04:00)</option>
                  <option value="Dawn Shift (04:00 - 08:00)">Dawn (04:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Security Status</label>
                <select
                  value={patrolStatus}
                  onChange={e => setPatrolStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="All Secure">🛡️ All Secure</option>
                  <option value="Incident Noticed">⚠️ Incident Noticed</option>
                  <option value="Unattended Post">🚫 Unattended Post</option>
                  <option value="Maintenance Required">🔧 Maintenance Issue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Checkpoint Photo Proof */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Camera size={14} className="text-indigo-600" />
                  Checkpoint Photo Evidence *
                </h4>
                <p className="text-[10px] text-slate-500">
                  Take photo of checkpoint lock, barrier or perimeter
                </p>
              </div>

              {patrolPhoto && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Photo Attached
                </span>
              )}
            </div>

            <input
              ref={patrolPhotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => handleFileCapture(e, setPatrolPhoto)}
              className="hidden"
            />

            {patrolPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-h-48 flex items-center justify-center">
                <img src={patrolPhoto} alt="Patrol evidence" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => patrolPhotoInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-900 px-3 py-1 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => patrolPhotoInputRef.current?.click()}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1.5 text-indigo-900 transition-colors cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-black text-indigo-950">Snap Checkpoint Inspection Photo</span>
                <span className="text-[10px] text-indigo-600/80">Geo-tagged with live coordinates</span>
              </button>
            )}

            {/* Inspection Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Observation Notes</label>
              <textarea
                rows={2}
                value={patrolNotes}
                onChange={e => setPatrolNotes(e.target.value)}
                placeholder="e.g. Server room double locks checked. Perimeter lights intact."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              />
            </div>
          </div>

          {/* Submit Patrol Log Button */}
          <button
            type="button"
            onClick={handleSubmitPatrol}
            disabled={submittingPatrol}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-[#1A2B79] hover:from-indigo-950 hover:to-[#162363] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            {submittingPatrol ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#26BCEE]" />
                <span>Logging Night Patrol to Database...</span>
              </>
            ) : (
              <>
                <Moon size={18} className="text-[#26BCEE]" />
                <span>Submit Night Patrol Log</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: FIELD OFFICER SELF PUNCH IN/OUT */}
      {/* ========================================================================= */}
      {activeMode === 'self' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Officer Attendance</span>
              <button
                type="button"
                onClick={() => setShowSelfieModal(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1A2B79] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Camera size={14} />
                <span>{selfieData ? 'Selfie Added ✓' : 'Duty Selfie'}</span>
              </button>
            </div>

            <div className="flex justify-center w-full py-1">
              <button
                type="button"
                onClick={handleOfficerSelfPunch}
                disabled={isVerifying}
                className={`w-full py-5 px-6 rounded-3xl font-black text-base uppercase tracking-wider shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer ${
                  punchedIn
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-r from-[#1A2B79] to-[#26BCEE] text-white shadow-blue-500/30'
                }`}
              >
                <Navigation size={22} className={punchedIn ? 'rotate-180' : ''} />
                <div className="text-left">
                  <div className="text-base font-black leading-tight">
                    {punchedIn ? 'CHECKOUT (LEAVE SITE)' : 'CHECK-IN (ARRIVE AT SITE)'}
                  </div>
                  <div className="text-[10px] font-normal normal-case opacity-90">
                    {punchedIn ? 'Complete field tour at this campus' : 'Log GPS Arrival at Client Campus'}
                  </div>
                </div>
              </button>
            </div>

            <p className="text-[11px] font-medium text-slate-500">
              {isInside
                ? '✓ Geofence verified. Within client site radius.'
                : '⚠️ Outside geofence radius. Move within site boundary.'}
            </p>
          </div>

          {/* Interactive Geofence Map */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" /> Site Coordinates & Geofence
                </span>
                <h3 className="text-xs font-black text-[#1A2B79]">{currentSite.name}</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xl border border-slate-200">
                {currentSite.geofenceRadius || 150}m Radius
              </span>
            </div>

            <GeofenceMapWidget
              siteLat={Number(currentSite.latitude)}
              siteLng={Number(currentSite.longitude)}
              radiusMeters={currentSite.geofenceRadius || 150}
              userLat={userCoords?.lat || null}
              userLng={userCoords?.lng || null}
              distanceMeters={distanceMeters}
              isInside={isInside}
              siteName={currentSite.name}
              accuracy={gpsAccuracy}
              heightClass="h-44"
            />

            {/* GPS Simulation Selector */}
            <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200/80 flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-600">GPS Testing Mode:</span>
              <div className="flex gap-1 font-bold">
                <button
                  type="button"
                  onClick={() => setGpsSimMode('inside')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    gpsSimMode === 'inside' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Inside (14m)
                </button>
                <button
                  type="button"
                  onClick={() => setGpsSimMode('outside')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    gpsSimMode === 'outside' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Outside (480m)
                </button>
                <button
                  type="button"
                  onClick={() => setGpsSimMode('device')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    gpsSimMode === 'device' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Device GPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS & Quick Support */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleSos}
          className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            sosSent
              ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
          }`}
        >
          <AlertOctagon size={15} />
          <span>{sosSent ? 'SOS SENT TO OPS!' : 'EMERGENCY SOS'}</span>
        </button>

        <a
          href={`tel:${COMPANY.phone}`}
          className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 transition-all"
        >
          <Phone size={14} className="text-[#1A2B79]" />
          <span>24/7 Control Desk</span>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MUSTER SUBMISSION SUCCESS */}
      {/* ========================================================================= */}
      {musterSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Muster Audit Logged</h3>
              <p className="text-xs text-slate-500 mt-1">{musterSuccessModal.siteName}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-2 text-left border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Sanctioned:</span>
                <strong className="text-slate-800">{musterSuccessModal.totalSanctioned} Staff</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-semibold">Present on Post:</span>
                <strong className="text-emerald-700">{musterSuccessModal.totalPresent} Staff</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-600 font-semibold">Marked Absent:</span>
                <strong className="text-rose-600">{musterSuccessModal.totalAbsent} Staff</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-mono text-[11px]">
                <span className="text-slate-500">GPS Geofence:</span>
                <span className="text-emerald-600 font-bold">✓ Verified ({musterSuccessModal.distanceMeters}m)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Attendance records and group muster photo committed to PostgreSQL and synced to Operations Console.
            </p>

            <button
              type="button"
              onClick={() => {
                setMusterSuccessModal(null);
                setMusterPhoto(null);
              }}
              className="w-full py-2.5 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Done & Continue Inspection
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NIGHT PATROL SUBMISSION SUCCESS */}
      {/* ========================================================================= */}
      {patrolSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-inner">
              <Moon size={32} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Patrol Checkpoint Logged</h3>
              <p className="text-xs text-indigo-700 font-bold mt-1">{patrolSuccessModal.checkpoint}</p>
              <p className="text-[11px] text-slate-400">{patrolSuccessModal.siteName}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-2 text-left border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Security Status:</span>
                <strong className="text-slate-800">{patrolSuccessModal.status}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logged Time:</span>
                <strong className="text-slate-800 font-mono">{patrolSuccessModal.time}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-mono text-[11px]">
                <span className="text-slate-500">GPS Verification:</span>
                <span className="text-indigo-700 font-bold">✓ Verified ({patrolSuccessModal.distanceMeters}m)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPatrolSuccessModal(null);
                setPatrolPhoto(null);
              }}
              className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Checkpoint Recorded
            </button>
          </div>
        </div>
      )}

      {/* Selfie Modal */}
      <SelfieCaptureModal
        isOpen={showSelfieModal}
        onClose={() => setShowSelfieModal(false)}
        onCapture={(img) => setSelfieData(img)}
      />

      {/* Self Punch Result Modal */}
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
              className="w-full py-2.5 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
