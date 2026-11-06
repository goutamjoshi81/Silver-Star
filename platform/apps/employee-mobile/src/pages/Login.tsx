import { useState } from 'react';
import { COMPANY, api } from '@mock/mockData';
import { Shield, Eye, EyeOff, Building, Users, Briefcase, Key, Sparkles, Check } from 'lucide-react';

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

  // Quick preset loader when switching tabs
  const handleTabChange = (newPersona: UserPersona) => {
    setPersona(newPersona);
    setError('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({
        employeeCode: identifier.trim(),
        username: identifier.trim(),
        email: identifier.trim(),
        password: password.trim(),
      });

      if (res && res.success && res.user) {
        // Enforce persona attribute
        const user = res.user;
        if (!user.persona) {
          if (user.role === 'Corporate Client') user.persona = 'client';
          else if (user.role === 'Operations Manager' || user.role === 'Supervisor' || user.role === 'Operations Employee') user.persona = 'operations';
          else user.persona = 'field';
        }
        onLogin(user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Mobile login error:', err);
      setError(
        err.message ||
          (persona === 'client'
            ? 'Invalid client credentials. Password must be your registered contact phone number.'
            : 'Invalid credentials. Default employee password is "Silverstar@123".')
      );
    } finally {
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
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mx-auto p-2 mb-2.5 shadow-lg border border-white/20 flex items-center justify-center">
            {/* Swirling Waves Logo */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
              <path d="M 50,10 C 28,10 12,26 12,48 C 12,56 16,63 22,68 C 24,62 30,57 40,55 C 56,52 68,44 68,30 C 68,18 60,10 50,10 Z" fill="#42B8EE" />
              <path d="M 50,90 C 72,90 88,74 88,52 C 88,44 84,37 78,32 C 76,38 70,43 60,45 C 44,48 32,56 32,70 C 32,82 40,90 50,90 Z" fill="#FFFFFF" />
            </svg>
          </div>
          <h1 className="text-white text-lg font-black tracking-wide font-serif">Silver Star One</h1>
          <p className="text-cyan-300 text-[11px] font-medium tracking-wide">Unified Mobile Workforce & Client Platform</p>

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
              {persona === 'operations' && 'Full mobile ops: Rosters, sites, DWRs & incident logs (No punch required).'}
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
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs pr-10 focus:outline-none focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent transition-all"
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

            {error && (
              <div className="text-rose-700 text-[11px] bg-rose-50 border border-rose-200 rounded-xl p-2.5 leading-relaxed font-medium animate-in fade-in">
                {error}
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
                  {persona === 'field' && 'Sign In to Field Duty App'}
                  {persona === 'operations' && 'Sign In to Operations Console'}
                  {persona === 'client' && 'Sign In to Client Portal'}
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
    </div>
  );
}
