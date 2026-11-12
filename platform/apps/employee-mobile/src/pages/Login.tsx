import { useState, useRef } from 'react';
import { COMPANY, api } from '@mock/mockData';
import {
  Shield,
  Eye,
  EyeOff,
  Building,
  Briefcase,
  Key,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';

export type UserPersona = 'field' | 'operations' | 'client';

interface LoginProps {
  onLogin: (user: any) => void;
  onOpenIntegrations?: () => void;
}

export default function Login({ onLogin, onOpenIntegrations }: LoginProps) {
  const [persona, setPersona] = useState<UserPersona>('field');
  const [identifier, setIdentifier] = useState('SS-10001');
  const [password, setPassword] = useState('Silverstar@123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // iOS-style Error Alert Modal & Attempts tracking
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Incorrect Password');
  const [errorDetails, setErrorDetails] = useState('');
  const [attempts, setAttempts] = useState(0);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Quick preset loader when switching tabs
  const handleTabChange = (newPersona: UserPersona) => {
    setPersona(newPersona);
    setError('');
    setShowErrorPopup(false);
    if (newPersona === 'field') {
      setIdentifier('SS-10001');
      setPassword('Silverstar@123');
    } else if (newPersona === 'operations') {
      setIdentifier('ops@silverstarindia.net');
      setPassword('Silverstar@123');
    } else if (newPersona === 'client') {
      setIdentifier('infosys_client');
      setPassword('+91 80 2852 0261');
    }
  };

  const handleTryAgain = () => {
    setShowErrorPopup(false);
    setPassword('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 150);
  };

  const handleUseDefaultPassword = () => {
    setShowErrorPopup(false);
    setError('');
    if (persona === 'client') {
      setPassword('+91 80 2852 0261');
    } else {
      setPassword('Silverstar@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowErrorPopup(false);

    try {
      const res = await api.login({
        employeeCode: identifier.trim(),
        username: identifier.trim(),
        email: identifier.trim(),
        password: password.trim(),
      });

      if (res && res.success && res.user) {
        // Reset attempts upon success
        setAttempts(0);
        // Enforce persona attribute
        const user = res.user;
        if (!user.persona) {
          if (user.role === 'Corporate Client') user.persona = 'client';
          else if (
            user.role === 'Operations Manager' ||
            user.role === 'Supervisor' ||
            user.role === 'Operations Employee'
          )
            user.persona = 'operations';
          else user.persona = 'field';
        }
        onLogin(user);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        const msg = 'Invalid credentials. Please verify your badge ID and password.';
        setError(msg);
        setErrorTitle('Incorrect Password');
        setErrorDetails(msg);
        setShowErrorPopup(true);
      }
    } catch (err: any) {
      console.error('Mobile login error:', err);

      const isNetworkError =
        err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('connect') ||
        err.name === 'TypeError';

      // If network error occurred, provide seamless offline fallback demo login so field operations are never blocked
      if (isNetworkError) {
        const cleanIdent = identifier.trim().toLowerCase();
        const cleanPass = password.trim();
        const isStandardPass =
          cleanPass === 'Silverstar@123' ||
          cleanPass === 'ops123' ||
          cleanPass === 'admin123' ||
          cleanPass === '+91 80 2852 0261' ||
          cleanPass.length >= 6;

        if (isStandardPass) {
          if (persona === 'field' || cleanIdent.includes('ss-') || cleanIdent.includes('emp')) {
            const fallbackFieldOfficer = {
              id: 'EMP837389',
              employeeCode: identifier.trim() || 'SS-10001',
              name: 'Rajesh Kumar (Field Officer)',
              role: 'Field Officer',
              persona: 'field',
              department: 'Operations',
              designation: 'Mobile Field Inspector',
              siteId: 'SITE001',
              siteName: 'Manyata Tech Park - Gate 5',
              isOfflineMode: true,
            };
            setAttempts(0);
            onLogin(fallbackFieldOfficer);
            return;
          } else if (persona === 'operations' || cleanIdent.includes('ops') || cleanIdent.includes('admin')) {
            const fallbackOpsUser = {
              id: 'USR002',
              name: 'Vikram Singh',
              email: identifier.trim() || 'ops@silverstarindia.net',
              role: 'Operations Manager',
              persona: 'operations',
              isOfflineMode: true,
            };
            setAttempts(0);
            onLogin(fallbackOpsUser);
            return;
          } else if (persona === 'client' || cleanIdent.includes('client') || cleanIdent.includes('infosys')) {
            const fallbackClientUser = {
              id: 'CL001',
              name: 'Infosys Limited (Facility Head)',
              portalUsername: identifier.trim() || 'infosys_client',
              role: 'Corporate Client',
              persona: 'client',
              isOfflineMode: true,
            };
            setAttempts(0);
            onLogin(fallbackClientUser);
            return;
          }
        }
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      const isPasswordError =
        err.message?.toLowerCase().includes('credential') ||
        err.message?.toLowerCase().includes('password') ||
        err.status === 401 ||
        err.status === 400;

      const title = isPasswordError
        ? 'Incorrect Password'
        : isNetworkError
        ? 'Network Connection Notice'
        : 'Login Authentication Failed';

      const msg = isNetworkError
        ? 'Unable to establish server connection. Verify your network or tap "Fill Default Password" to authenticate with offline fallback.'
        : err.message ||
          (persona === 'client'
            ? 'Invalid client credentials. Password must be your registered contact phone number.'
            : 'Invalid credentials. Default employee password is "Silverstar@123".');

      setError(msg);
      setErrorTitle(title);
      setErrorDetails(msg);
      setShowErrorPopup(true);
    } finally {
      // Always immediately stop loading spinner so the app never loops or hangs
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 font-sans select-none antialiased">
      {/* Decorative Brand Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-[#26BCEE] to-[#1A2B79] blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-[390px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 my-auto">
        {/* Top Corporate Brand Header */}
        <div className="bg-gradient-to-r from-[#1A2B79] via-[#162363] to-[#0E163D] px-6 pt-7 pb-6 text-center text-white relative">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto p-2 mb-2.5 shadow-lg border border-white/20 flex items-center justify-center overflow-hidden">
            <img
              src="/silverstar-icon-512.png"
              alt="Silver Star"
              className="w-full h-full object-contain"
            />
          </div>
          <h1
            style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            className="text-lg font-black tracking-wide"
          >
            Silver Star One
          </h1>
          <p
            style={{ color: '#38BDF8', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            className="text-[11px] font-semibold tracking-wide"
          >
            Unified Mobile Workforce & Client Platform
          </p>

          {/* 3rd-Party Diagnostics Trigger in header */}
          {onOpenIntegrations && (
            <button
              type="button"
              onClick={onOpenIntegrations}
              style={{ color: '#FFFFFF' }}
              className="absolute top-3.5 right-3.5 opacity-80 hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[10px] flex items-center gap-1 font-bold"
              title="View 3rd-party API & service keys"
            >
              <Key size={13} />
              <span className="hidden sm:inline">APIs</span>
            </button>
          )}
        </div>

        {/* 3-in-1 Persona Switcher */}
        <div className="bg-slate-100 p-1.5 mx-4 -mt-3 rounded-2xl shadow-md border border-slate-200/80 grid grid-cols-3 gap-1 relative z-10 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('field')}
            style={
              persona === 'field'
                ? { color: '#FFFFFF', backgroundColor: '#1A2B79' }
                : { color: '#334155', backgroundColor: 'transparent' }
            }
            className="py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm"
          >
            <Shield size={13} style={{ color: persona === 'field' ? '#FFFFFF' : '#64748B' }} />
            <span className="truncate">Field Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('operations')}
            style={
              persona === 'operations'
                ? { color: '#FFFFFF', backgroundColor: '#1A2B79' }
                : { color: '#334155', backgroundColor: 'transparent' }
            }
            className="py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm"
          >
            <Briefcase size={13} style={{ color: persona === 'operations' ? '#FFFFFF' : '#64748B' }} />
            <span className="truncate">Operations</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('client')}
            style={
              persona === 'client'
                ? { color: '#FFFFFF', backgroundColor: '#1A2B79' }
                : { color: '#334155', backgroundColor: 'transparent' }
            }
            className="py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm"
          >
            <Building size={13} style={{ color: persona === 'client' ? '#FFFFFF' : '#64748B' }} />
            <span className="truncate">Client</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 pt-4">
          {/* Helper banner for current persona */}
          <div
            className="mb-4 rounded-xl p-2.5 text-[10px] space-y-0.5 border"
            style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
          >
            <div className="font-bold flex items-center gap-1" style={{ color: '#0F172A' }}>
              <Sparkles size={11} className="text-[#26BCEE]" />
              {persona === 'field' && 'Field Employees (Guards, Housekeepers, Techs)'}
              {persona === 'operations' && 'Operations Team (Managers, Supervisors)'}
              {persona === 'client' && 'Corporate Clients (Facility & Estate Directors)'}
            </div>
            <p style={{ color: '#475569' }}>
              {persona === 'field' && 'GPS geofenced punch-in, duty shift & smart ID badge.'}
              {persona === 'operations' &&
                'Full mobile ops: Rosters, sites, DWRs & incident logs (No punch required).'}
              {persona === 'client' && 'Live workforce muster, deployed guard strength & attendance.'}
            </p>
            <p className="font-mono font-bold pt-1" style={{ color: '#1A2B79' }}>
              {persona === 'field' && 'Default Password: Silverstar@123'}
              {persona === 'operations' && 'Default Password: Silverstar@123'}
              {persona === 'client' && 'Default Password: Client Contact Phone Number'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold mb-1" style={{ color: '#1E293B' }}>
                {persona === 'field' && 'Employee Badge ID / Phone'}
                {persona === 'operations' && 'Operations Email / Username'}
                {persona === 'client' && 'Client Portal Username / Phone / Email'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  persona === 'field'
                    ? 'e.g. SS-10001'
                    : persona === 'operations'
                    ? 'e.g. ops@silverstarindia.net'
                    : 'e.g. infosys_client'
                }
                style={{ color: '#0F172A', backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }}
                className="w-full border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold" style={{ color: '#1E293B' }}>
                  Password
                </label>
                <span className="text-[10px]" style={{ color: '#64748B' }}>
                  {persona === 'client' ? 'Use contact number' : 'Silverstar@123'}
                </span>
              </div>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    color: '#0F172A',
                    backgroundColor: error ? '#FFF1F2' : '#FFFFFF',
                    borderColor: error ? '#FB7185' : '#CBD5E1',
                  }}
                  className="w-full border rounded-xl px-3 py-2.5 text-xs pr-10 focus:outline-none focus:ring-2 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error Banner with quick retry trigger */}
            {error && (
              <div
                className="rounded-2xl p-3 space-y-2 border animate-in fade-in slide-in-from-top-1"
                style={{ backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-rose-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 text-[11px]">
                    <p className="font-bold text-rose-800">Authentication Failed (Attempt #{attempts})</p>
                    <p className="text-rose-700 leading-snug">{error}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="flex-1 bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-300 rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <RotateCcw size={11} />
                    <span>Try Another Attempt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUseDefaultPassword}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle2 size={11} />
                    <span>Fill Default Pass</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ color: '#FFFFFF', backgroundColor: '#1A2B79' }}
              className="w-full hover:opacity-95 active:scale-[0.99] rounded-xl py-3 text-xs font-bold shadow-lg shadow-[#1A2B79]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span style={{ color: '#FFFFFF' }}>Verifying Credentials...</span>
                </>
              ) : (
                <span style={{ color: '#FFFFFF' }}>
                  {attempts > 0
                    ? `Submit Attempt #${attempts + 1}`
                    : persona === 'field'
                    ? 'Sign In to Field Duty App'
                    : persona === 'operations'
                    ? 'Sign In to Operations Console'
                    : 'Sign In to Client Portal'}
                </span>
              )}
            </button>
          </form>

          {/* 1-Tap Quick Demo Switcher for fast verification */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-center mb-2" style={{ color: '#64748B' }}>
              Quick 1-Click Verification Logins
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setPersona('field');
                  setIdentifier('SS-10001');
                  setPassword('Silverstar@123');
                  setError('');
                }}
                style={{ color: '#0F172A', backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}
                className="hover:bg-slate-200 p-1.5 rounded-lg truncate border text-center font-bold"
              >
                Guard: SS-10001
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersona('operations');
                  setIdentifier('ops@silverstarindia.net');
                  setPassword('Silverstar@123');
                  setError('');
                }}
                style={{ color: '#0F172A', backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}
                className="hover:bg-slate-200 p-1.5 rounded-lg truncate border text-center font-bold"
              >
                Ops Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersona('client');
                  setIdentifier('infosys_client');
                  setPassword('+91 80 2852 0261');
                  setError('');
                }}
                style={{ color: '#0F172A', backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}
                className="hover:bg-slate-200 p-1.5 rounded-lg truncate border text-center font-bold"
              >
                Infosys Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t text-center text-[10px] flex items-center justify-between"
          style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}
        >
          <span>{COMPANY.shortName} Mobile Suite v2.0</span>
          <span>PSARA Verified</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* iOS NATIVE-STYLE MODAL POPUP NOTIFICATION ON WRONG PASS */}
      {/* ======================================================== */}
      {showErrorPopup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Close Button Top-Right */}
            <button
              type="button"
              onClick={() => setShowErrorPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-3 shadow-inner">
              <Lock size={26} className="text-rose-600 animate-pulse" />
            </div>

            {/* Badge Indicator */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100/80 text-rose-800 text-[10px] font-bold mb-2">
              <AlertTriangle size={11} />
              <span>Authentication Attempt #{attempts} Failed</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-black tracking-tight mb-1" style={{ color: '#0F172A' }}>
              {errorTitle}
            </h3>

            {/* Description */}
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#334155' }}>
              {errorDetails ||
                `The password entered for "${identifier}" does not match our records. Please verify your credentials and try another attempt.`}
            </p>

            {/* Hint Box */}
            <div
              className="w-full rounded-2xl p-3 text-[11px] text-left mb-4 space-y-1 border"
              style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              <p className="font-bold flex items-center gap-1" style={{ color: '#0F172A' }}>
                <Sparkles size={11} className="text-[#26BCEE]" />
                Password Recovery Guidance:
              </p>
              <p className="text-[10px]" style={{ color: '#475569' }}>
                {persona === 'client'
                  ? 'For Corporate Client portal accounts, your password is the registered client contact phone number.'
                  : 'For Field Staff & Operations accounts, the standard initial password is "Silverstar@123".'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={handleTryAgain}
                style={{ color: '#FFFFFF', backgroundColor: '#1A2B79' }}
                className="w-full py-3 hover:opacity-95 active:scale-[0.98] rounded-xl text-xs font-bold shadow-md shadow-[#1A2B79]/20 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={14} style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>Give Another Attempt</span>
              </button>

              <button
                type="button"
                onClick={handleUseDefaultPassword}
                style={{ color: '#0F172A', backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}
                className="w-full py-2.5 hover:bg-slate-200 active:scale-[0.98] rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span style={{ color: '#0F172A' }}>Fill Default Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
