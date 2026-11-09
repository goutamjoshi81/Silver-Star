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
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      const isPasswordError =
        err.message?.toLowerCase().includes('credential') ||
        err.message?.toLowerCase().includes('password') ||
        err.status === 401 ||
        err.status === 400;

      const title = isPasswordError ? 'Incorrect Password' : 'Login Authentication Failed';
      const msg =
        err.message ||
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
          <h1 className="text-white text-lg font-black tracking-wide font-serif">Silver Star One</h1>
          <p className="text-cyan-300 text-[11px] font-medium tracking-wide">
            Unified Mobile Workforce & Client Platform
          </p>

          {/* 3rd-Party Diagnostics Trigger in header */}
          {onOpenIntegrations && (
            <button
              type="button"
              onClick={onOpenIntegrations}
              className="absolute top-3.5 right-3.5 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[10px] flex items-center gap-1 font-bold"
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
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              persona === 'field'
                ? 'bg-[#1A2B79] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield size={13} />
            <span className="truncate">Field Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('operations')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              persona === 'operations'
                ? 'bg-[#1A2B79] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase size={13} />
            <span className="truncate">Operations</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('client')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
              persona === 'client'
                ? 'bg-[#1A2B79] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building size={13} />
            <span className="truncate">Client</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 pt-4">
          {/* Helper banner for current persona */}
          <div className="mb-4 bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-[10px] text-slate-600 space-y-0.5">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles size={11} className="text-[#26BCEE]" />
              {persona === 'field' && 'Field Employees (Guards, Housekeepers, Techs)'}
              {persona === 'operations' && 'Operations Team (Managers, Supervisors)'}
              {persona === 'client' && 'Corporate Clients (Facility & Estate Directors)'}
            </div>
            <p className="text-slate-500">
              {persona === 'field' && 'GPS geofenced punch-in, duty shift & smart ID badge.'}
              {persona === 'operations' &&
                'Full mobile ops: Rosters, sites, DWRs & incident logs (No punch required).'}
              {persona === 'client' && 'Live workforce muster, deployed guard strength & attendance.'}
            </p>
            <p className="text-[#1A2B79] font-mono font-bold pt-1">
              {persona === 'field' && 'Default Password: Silverstar@123'}
              {persona === 'operations' && 'Default Password: Silverstar@123'}
              {persona === 'client' && 'Default Password: Client Contact Phone Number'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Password</label>
                <span className="text-[10px] text-slate-400">
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
                  className={`w-full border rounded-xl px-3 py-2.5 text-xs pr-10 focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-[#1A2B79] focus:border-transparent'
                  }`}
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
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1">
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
              className="w-full bg-[#1A2B79] hover:bg-[#14215e] active:scale-[0.99] text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-[#1A2B79]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>
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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-2">
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-lg truncate border border-slate-200 text-center"
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-lg truncate border border-slate-200 text-center"
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1.5 rounded-lg truncate border border-slate-200 text-center"
              >
                Infosys Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-between">
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
            <h3 className="text-base font-black text-slate-900 tracking-tight font-serif mb-1">
              {errorTitle}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {errorDetails ||
                `The password entered for "${identifier}" does not match our records. Please verify your credentials and try another attempt.`}
            </p>

            {/* Hint Box */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-600 text-left mb-4 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Sparkles size={11} className="text-[#26BCEE]" />
                Password Recovery Guidance:
              </p>
              <p className="text-slate-500 text-[10px]">
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
                className="w-full py-3 bg-[#1A2B79] hover:bg-[#14215e] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-[#1A2B79]/20 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={14} />
                <span>Give Another Attempt</span>
              </button>

              <button
                type="button"
                onClick={handleUseDefaultPassword}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Fill Default Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
