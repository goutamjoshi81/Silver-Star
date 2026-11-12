import { useState, useEffect, useRef } from 'react';
import { api, COMPANY, SITES, PATROL_CHECKPOINTS } from '@mock/mockData';
import {
  Users, Moon, MapPin, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
  Navigation, RefreshCw, XCircle, Camera, AlertOctagon, Phone, User,
  Check, Eye, ChevronRight, Upload, Sparkles, Compass, Shield, Building,
  FileCheck, Image as ImageIcon, Loader2, Info, ChevronDown
} from 'lucide-react';

interface DutyHomeProps {
  currentUser?: any;
  onNavigateTab?: (tab: string) => void;
}

export default function DutyHome({ currentUser, onNavigateTab }: DutyHomeProps) {
  const [emp, setEmp] = useState<any>(currentUser || null);
  const [loadingDuties, setLoadingDuties] = useState<boolean>(true);
  const [assignedClients, setAssignedClients] = useState<any[]>([]);
  const [assignedPatrols, setAssignedPatrols] = useState<any[]>([]);
  const [selectedSiteIndex, setSelectedSiteIndex] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // GPS state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({ lat: 12.845214, lng: 77.660168 });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(8);
  const [distanceMeters, setDistanceMeters] = useState<number>(14);
  const [isInside, setIsInside] = useState<boolean>(true);
  const [gpsSimMode, setGpsSimMode] = useState<'inside' | 'outside' | 'device'>('inside');

  // Roll-Call & Muster State for Active Assigned Client
  const [deployedStaff, setDeployedStaff] = useState<any[]>([]);
  const [musterShift, setMusterShift] = useState<string>('Morning Shift (06:00 - 14:00)');
  const [musterNotes, setMusterNotes] = useState<string>('Turnout inspection completed. Guards & housekeepers alert and in full uniform.');
  const [musterPhoto, setMusterPhoto] = useState<string | null>(null);
  const [submittingMuster, setSubmittingMuster] = useState<boolean>(false);
  const [musterSuccessModal, setMusterSuccessModal] = useState<any | null>(null);
  const musterPhotoInputRef = useRef<HTMLInputElement>(null);

  // Night Patrol State for Active Assigned Patrol
  const [selectedPatrolIndex, setSelectedPatrolIndex] = useState<number>(0);
  const [patrolStatus, setPatrolStatus] = useState<string>('All Secure');
  const [patrolNotes, setPatrolNotes] = useState<string>('Perimeter fencing intact, floodlights active, emergency gates secured.');
  const [patrolPhoto, setPatrolPhoto] = useState<string | null>(null);
  const [submittingPatrol, setSubmittingPatrol] = useState<boolean>(false);
  const [patrolSuccessModal, setPatrolSuccessModal] = useState<any | null>(null);
  const patrolPhotoInputRef = useRef<HTMLInputElement>(null);

  // Fetch only assigned duties for this specific officer
  const loadOfficerDuties = async () => {
    setLoadingDuties(true);
    const targetEmpId = currentUser?.id || currentUser?.employeeId || currentUser?.employeeCode || 'SS-10001';

    try {
      const [dutiesRes, empRes] = await Promise.all([
        api.getOfficerDuties(targetEmpId).catch(() => null),
        api.getEmployee(targetEmpId).catch(() => currentUser),
      ]);

      if (empRes) setEmp(empRes);

      if (dutiesRes) {
        setAssignedClients(dutiesRes.assignedClients || []);
        setAssignedPatrols(dutiesRes.assignedPatrols || []);
      } else {
        // Fallback: check sites where this officer is supervisor
        const allSites = await api.getSites().catch(() => SITES);
        const mySites = allSites.filter((s: any) => s.supervisorId === targetEmpId || s.supervisorId === currentUser?.employeeCode);
        setAssignedClients(mySites);
      }
    } catch (err) {
      console.warn('Error loading officer duties:', err);
    } finally {
      setLoadingDuties(false);
    }
  };

  useEffect(() => {
    loadOfficerDuties();
  }, [currentUser]);

  // Active Assigned Client Site (if assigned)
  const activeClientSite = assignedClients[selectedSiteIndex] || null;

  // When active client site changes, sync deployed staff
  useEffect(() => {
    if (!activeClientSite) {
      setDeployedStaff([]);
      return;
    }

    if (activeClientSite.deployedStaff && activeClientSite.deployedStaff.length > 0) {
      setDeployedStaff(
        activeClientSite.deployedStaff.map((s: any) => ({
          ...s,
          status: s.status || 'Present',
        }))
      );
    } else {
      // Fetch from API for this site
      api.getDeployedStaff(activeClientSite.id)
        .then(staff => {
          if (staff && staff.length > 0) {
            setDeployedStaff(staff.map((s: any) => ({ ...s, status: 'Present' })));
          } else {
            // Default mock roster if site was newly created
            setDeployedStaff([
              { employeeId: 'EMP001', name: 'Ramesh Gowda', employeeCode: 'SS-10001', designation: 'Head Guard', department: 'Security', status: 'Present' },
              { employeeId: 'EMP002', name: 'Suresh Patil', employeeCode: 'SS-10002', designation: 'Security Guard', department: 'Security', status: 'Present' },
              { employeeId: 'EMP003', name: 'Mahesh Kumar', employeeCode: 'SS-10003', designation: 'Security Guard', department: 'Security', status: 'Present' },
              { employeeId: 'EMP004', name: 'Laxmi Bai', employeeCode: 'SS-10004', designation: 'Housekeeper', department: 'Housekeeping', status: 'Present' },
            ]);
          }
        })
        .catch(() => {
          setDeployedStaff([
            { employeeId: 'EMP001', name: 'Ramesh Gowda', employeeCode: 'SS-10001', designation: 'Head Guard', department: 'Security', status: 'Present' },
            { employeeId: 'EMP002', name: 'Suresh Patil', employeeCode: 'SS-10002', designation: 'Security Guard', department: 'Security', status: 'Present' },
            { employeeId: 'EMP003', name: 'Mahesh Kumar', employeeCode: 'SS-10003', designation: 'Security Guard', department: 'Security', status: 'Present' },
          ]);
        });
    }
  }, [activeClientSite]);

  // Active Assigned Night Patrol (if assigned)
  const activePatrol = assignedPatrols[selectedPatrolIndex] || null;

  // Target Location for GPS Calculations (prioritizing active client or active patrol)
  const targetLocation = activeClientSite || activePatrol || {
    latitude: 12.845214,
    longitude: 77.660168,
    geofenceRadius: 150,
    name: 'Assigned Post',
  };

  // GPS Simulation & Device Tracking
  useEffect(() => {
    const lat = Number(targetLocation.latitude) || 12.845214;
    const lng = Number(targetLocation.longitude) || 77.660168;
    const radius = Number(targetLocation.geofenceRadius) || 150;

    if (gpsSimMode === 'device' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserCoords({ lat: userLat, lng: userLng });
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          const dist = calculateDistanceMeters(userLat, userLng, lat, lng);
          setDistanceMeters(Math.round(dist));
          setIsInside(dist <= radius);
        },
        () => setGpsSimMode('inside'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else if (gpsSimMode === 'inside') {
      setUserCoords({ lat: lat + 0.0001, lng: lng + 0.0001 });
      setDistanceMeters(14);
      setIsInside(true);
      setGpsAccuracy(6);
    } else if (gpsSimMode === 'outside') {
      setUserCoords({ lat: lat + 0.0042, lng: lng + 0.0038 });
      setDistanceMeters(480);
      setIsInside(false);
      setGpsAccuracy(18);
    }
  }, [gpsSimMode, targetLocation]);

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

  // Handle staff attendance toggle
  const handleStaffStatusToggle = (empId: string, status: 'Present' | 'Absent' | 'Late') => {
    setDeployedStaff(prev => prev.map(s => s.employeeId === empId ? { ...s, status } : s));
  };

  const handleMarkAllPresent = () => {
    setDeployedStaff(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Field Muster Roll-Call
  const handleSubmitMuster = async () => {
    if (!activeClientSite) return;
    if (!musterPhoto) {
      alert('Photo Evidence Required: Please snap or upload a group photo of the deployed security/housekeeping staff at the site.');
      musterPhotoInputRef.current?.click();
      return;
    }

    setSubmittingMuster(true);
    try {
      const officerId = emp?.id || emp?.employeeId || 'SS-10001';
      const payload = {
        officerId,
        siteId: activeClientSite.id,
        shift: musterShift,
        staffStatuses: deployedStaff.map(s => ({
          employeeId: s.employeeId,
          status: s.status as 'Present' | 'Absent' | 'Late',
          notes: s.status === 'Absent' ? 'Marked absent by field inspection officer' : undefined,
        })),
        musterPhotoUrl: musterPhoto,
        latitude: userCoords?.lat || activeClientSite.latitude,
        longitude: userCoords?.lng || activeClientSite.longitude,
        notes: musterNotes,
      };

      const res = await api.submitFieldMuster(payload);

      const presentCount = deployedStaff.filter(s => s.status === 'Present').length;
      const absentCount = deployedStaff.filter(s => s.status === 'Absent').length;

      setMusterSuccessModal({
        siteName: res.siteName || activeClientSite.name,
        totalPresent: res.totalPresent ?? presentCount,
        totalAbsent: res.totalAbsent ?? absentCount,
        totalSanctioned: res.totalSanctioned ?? deployedStaff.length,
        isGeofenceVerified: res.isGeofenceVerified ?? isInside,
        distanceMeters: res.distanceMeters ?? distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Update local status
      setAssignedClients(prev => prev.map((s, idx) => idx === selectedSiteIndex ? { ...s, todayAuditCompleted: true } : s));
      setMusterPhoto(null);
    } catch (err: any) {
      alert(`Muster submission: ${err.message}`);
    } finally {
      setSubmittingMuster(false);
    }
  };

  // Submit Night Patrol Inspection
  const handleSubmitPatrol = async () => {
    if (!activePatrol) return;
    if (!patrolPhoto) {
      alert('Photo Evidence Required: Please snap a clear photo of the inspection checkpoint or security gate.');
      patrolPhotoInputRef.current?.click();
      return;
    }

    setSubmittingPatrol(true);
    try {
      const officerId = emp?.id || emp?.employeeId || 'SS-10001';
      const payload = {
        officerId,
        siteId: activePatrol.siteId || undefined,
        checkpointName: activePatrol.checkpointName,
        patrolShift: activePatrol.shift,
        status: patrolStatus,
        latitude: userCoords?.lat || activePatrol.latitude,
        longitude: userCoords?.lng || activePatrol.longitude,
        photoUrl: patrolPhoto,
        notes: patrolNotes,
      };

      const res = await api.submitPatrolLog(payload);

      setPatrolSuccessModal({
        checkpoint: activePatrol.checkpointName,
        siteName: activePatrol.locationName,
        status: patrolStatus,
        isGeofenceVerified: res.isGeofenceVerified ?? isInside,
        distanceMeters: res.distanceMeters ?? distanceMeters,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Update status of assignment
      setAssignedPatrols(prev => prev.map((p, idx) => idx === selectedPatrolIndex ? { ...p, status: 'Completed' } : p));
      setPatrolPhoto(null);
    } catch (err: any) {
      alert(`Patrol submission: ${err.message}`);
    } finally {
      setSubmittingPatrol(false);
    }
  };

  const hasClients = assignedClients.length > 0;
  const hasPatrols = assignedPatrols.length > 0;
  const totalDuties = assignedClients.length + assignedPatrols.length;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      {/* Top Field Officer Status Pill */}
      <div className="bg-gradient-to-r from-[#1A2B79] to-[#202B75] rounded-3xl p-4 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-white/20 flex-shrink-0">
              {emp?.photo ? (
                <img src={emp.photo} alt="Officer" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Shield size={22} className="text-[#26BCEE]" />
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
            <p className="text-[10px] text-white/70 font-mono mt-0.5">{distanceMeters}m from centroid</p>
          </div>
        </div>

        {/* Assigned Duties Summary Banner */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/90">
          <span className="flex items-center gap-1.5 font-bold">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Today's Dispatched Duties:</span>
          </span>
          <span className="font-extrabold text-[11px] px-2 py-0.5 rounded-lg bg-white/10 border border-white/20">
            {totalDuties === 0 ? '0 Assigned' : `${totalDuties} Active (${assignedClients.length} Roll-Call, ${assignedPatrols.length} Patrol)`}
          </span>
        </div>
      </div>

      {feedbackToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {feedbackToast}
          </span>
          <button onClick={() => setFeedbackToast(null)} className="text-[10px] underline">Dismiss</button>
        </div>
      )}

      {/* LOADING STATE */}
      {loadingDuties && (
        <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-500 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-[#202B75]" />
          <p className="font-bold text-gray-800">Checking Assigned Client Visits & Night Patrols...</p>
        </div>
      )}

      {/* EMPTY STATE: NO ASSIGNMENTS DISPATCHED BY OPS */}
      {!loadingDuties && totalDuties === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-gray-900">No Active Duties Assigned Today</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Operations has not assigned any client site visits or night patrol checkpoints to your account for today.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={loadOfficerDuties}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl text-xs transition-colors"
            >
              <RefreshCw size={13} /> Check for New Assignments
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ASSIGNED CLIENT VISITS & DEPLOYED STAFF ROLL-CALL SECTION */}
      {/* ========================================================================= */}
      {!loadingDuties && hasClients && activeClientSite && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                  Assigned Client Visit & Roll-Call
                </h3>
                <p className="text-[10px] text-gray-500">
                  {assignedClients.length > 1 ? `Site ${selectedSiteIndex + 1} of ${assignedClients.length}` : 'Assigned Client Facility'}
                </p>
              </div>
            </div>

            {activeClientSite.todayAuditCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Check size={11} /> Muster Done
              </span>
            )}
          </div>

          {/* Multiple Client Sites Selector Tabs (if more than 1 assigned) */}
          {assignedClients.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {assignedClients.map((site, idx) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSiteIndex === idx
                      ? 'bg-[#1A2B79] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {site.name}
                </button>
              ))}
            </div>
          )}

          {/* Client & Site Details Box */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-[#1A2B79] truncate">{activeClientSite.name}</h4>
              <span className="text-[10px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                {activeClientSite.geofenceRadius || 150}m Radius
              </span>
            </div>
            <p className="text-[11px] text-gray-500 flex items-start gap-1">
              <MapPin size={12} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{activeClientSite.address}</span>
            </p>
            <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-gray-600">
              <span>Client: <strong>{activeClientSite.clientName || 'Corporate Client'}</strong></span>
              <span className="text-emerald-700 font-bold">
                {deployedStaff.length} Deployed Staff
              </span>
            </div>
          </div>

          {/* DEPLOYED GUARDS & HOUSEKEEPERS ATTENDANCE ROSTER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-xs text-gray-900">Deployed Guards & Housekeepers</h5>
                <p className="text-[10px] text-gray-500">Physically verify physical presence at post</p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                All Present ✓
              </button>
            </div>

            {/* Attendance List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {deployedStaff.map((staff, idx) => (
                <div
                  key={staff.employeeId || idx}
                  className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-[#1A2B79] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {staff.name ? staff.name[0] : 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{staff.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {staff.employeeCode} · {staff.designation || 'Guard'}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStaffStatusToggle(staff.employeeId, 'Present')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        staff.status === 'Present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStaffStatusToggle(staff.employeeId, 'Absent')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        staff.status === 'Absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Turnout Photo Evidence Capture */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Staff Turnout Photo Evidence *
              </label>

              {musterPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500 shadow-sm">
                  <img src={musterPhoto} alt="Turnout" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => setMusterPhoto(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                    ✓ Photo Ready
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => musterPhotoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#1A2B79] bg-gray-50/50 hover:bg-blue-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                >
                  <input
                    ref={musterPhotoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => handleFileCapture(e, setMusterPhoto)}
                    className="hidden"
                  />
                  <Camera size={22} className="text-[#1A2B79]" />
                  <span className="text-xs font-bold text-[#1A2B79]">Snap Turnout / Group Photo</span>
                  <span className="text-[10px] text-gray-400">Camera capture of deployed guards & housekeepers</span>
                </button>
              )}

              {/* Submit Muster Roll-Call Button */}
              <button
                type="button"
                onClick={handleSubmitMuster}
                disabled={submittingMuster}
                className="w-full py-2.5 bg-gradient-to-r from-[#1A2B79] to-[#202B75] hover:from-[#13205a] hover:to-[#171f54] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#1A2B79]/20 transition-all cursor-pointer"
              >
                {submittingMuster ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting Roll-Call...
                  </>
                ) : (
                  <>
                    <FileCheck size={15} className="text-[#26BCEE]" />
                    <span>Submit Client Staff Roll-Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ASSIGNED NIGHT PATROL CHECKPOINT SWEEPS SECTION */}
      {/* ========================================================================= */}
      {!loadingDuties && hasPatrols && activePatrol && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-indigo-200/80 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Moon size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                  Assigned Night Patrol
                </h3>
                <p className="text-[10px] text-gray-500">
                  {assignedPatrols.length > 1 ? `Checkpoint ${selectedPatrolIndex + 1} of ${assignedPatrols.length}` : 'Night Security Sweep'}
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              activePatrol.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activePatrol.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              {activePatrol.status || 'Pending'}
            </span>
          </div>

          {/* Multiple Night Patrol Checkpoints Selector Tabs */}
          {assignedPatrols.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {assignedPatrols.map((patrol, idx) => (
                <button
                  key={patrol.id}
                  onClick={() => setSelectedPatrolIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPatrolIndex === idx
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {patrol.checkpointName}
                </button>
              ))}
            </div>
          )}

          {/* Checkpoint Details Card */}
          <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-indigo-950">{activePatrol.checkpointName}</h4>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                {activePatrol.shift || 'Night Shift'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 flex items-start gap-1">
              <MapPin size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{activePatrol.address || activePatrol.locationName}</span>
            </p>
            {activePatrol.instructions && (
              <div className="pt-1 border-t border-indigo-100 text-[11px] text-indigo-900 bg-white/60 p-2 rounded-xl">
                <strong className="block text-[10px] text-indigo-950 uppercase font-black">Ops Instructions:</strong>
                {activePatrol.instructions}
              </div>
            )}
          </div>

          {/* Security Finding Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800">Security Finding / Status *</label>
            <div className="grid grid-cols-2 gap-2">
              {['All Secure', 'Incident Noticed'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPatrolStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    patrolStatus === st
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Patrol Photo Capture */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800">
              Checkpoint Inspection Photo Proof *
            </label>

            {patrolPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500 shadow-sm">
                <img src={patrolPhoto} alt="Patrol Proof" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setPatrolPhoto(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                >
                  <XCircle size={16} />
                </button>
                <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                  ✓ Photo Ready
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => patrolPhotoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-600 bg-gray-50/50 hover:bg-indigo-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
              >
                <input
                  ref={patrolPhotoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => handleFileCapture(e, setPatrolPhoto)}
                  className="hidden"
                />
                <Camera size={22} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">Snap Checkpoint Verification Photo</span>
                <span className="text-[10px] text-gray-400">Capture locks, gate barrier, or floodlight area</span>
              </button>
            )}

            {/* Notes input */}
            <div>
              <input
                type="text"
                placeholder="Remarks (e.g. Padlocks intact, floodlights on, all quiet)"
                value={patrolNotes}
                onChange={e => setPatrolNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Submit Patrol Inspection Button */}
            <button
              type="button"
              onClick={handleSubmitPatrol}
              disabled={submittingPatrol}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-700/20 transition-all cursor-pointer"
            >
              {submittingPatrol ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading Patrol Proof...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Submit Night Patrol Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MUSTER SUCCESS MODAL */}
      {musterSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">Roll-Call Submitted!</h3>
              <p className="text-xs text-gray-500">
                Turnout verification recorded for <strong>{musterSuccessModal.siteName}</strong>
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">Sanctioned</span>
                <span className="font-black text-gray-800 text-sm">{musterSuccessModal.totalSanctioned}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 block">Present</span>
                <span className="font-black text-emerald-600 text-sm">{musterSuccessModal.totalPresent}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-500 block">Absent</span>
                <span className="font-black text-rose-500 text-sm">{musterSuccessModal.totalAbsent}</span>
              </div>
            </div>

            <button
              onClick={() => setMusterSuccessModal(null)}
              className="w-full py-2.5 bg-[#1A2B79] hover:bg-[#121c50] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* PATROL SUCCESS MODAL */}
      {patrolSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto border border-indigo-100">
              <Moon size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">Night Patrol Verified!</h3>
              <p className="text-xs text-gray-500">
                Checkpoint sweep completed for <strong>{patrolSuccessModal.checkpoint}</strong>
              </p>
            </div>

            <div className="bg-indigo-50/60 rounded-2xl p-3 text-xs text-indigo-900 space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-500">Facility:</span>
                <strong className="text-gray-900">{patrolSuccessModal.siteName}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <strong className="text-emerald-700">{patrolSuccessModal.status}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <strong className="font-mono">{patrolSuccessModal.time}</strong>
              </p>
            </div>

            <button
              onClick={() => setPatrolSuccessModal(null)}
              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
