import { COMPANY } from '@mock/mockData';
import { User, Phone, Mail, MapPin, ShieldCheck, Heart, LogOut, Key, Building, CheckCircle2 } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
  currentUser?: any;
  onOpenIntegrations?: () => void;
}

export default function Profile({ onLogout, currentUser, onOpenIntegrations }: ProfileProps) {
  const user = currentUser || {
    name: 'Ramesh Kumar',
    employeeCode: 'SS-10001',
    role: 'Field Employee',
    persona: 'field',
    phone: '+91 98765 43210',
    email: 'info@silverstarindia.net',
    bloodGroup: 'B+',
    siteName: 'Infosys - Electronic City Campus Phase 1',
    designationName: 'Security Guard',
  };

  const initials = (user.name || 'SS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#1A2B79] to-[#26BCEE] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-2.5 shadow-md border-2 border-white ring-4 ring-[#1A2B79]/10">
          {initials}
        </div>
        <h3 className="font-black text-base text-slate-900">{user.name}</h3>
        <p className="text-xs text-[#1A2B79] font-bold mt-0.5">
          {user.designationName || user.role}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={11} /> PSARA Certified & Verified
          </span>
        </div>
      </div>

      {/* Account & Assignment Info */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <h4 className="font-black text-xs text-slate-900 mb-1">Account & Role Information</h4>
        
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-400">Account Type:</span>
          <span className="font-bold text-[#1A2B79] capitalize">
            {user.persona === 'field' && 'Field Staff (Guard / Housekeeping)'}
            {user.persona === 'operations' && 'Operations Management'}
            {user.persona === 'client' && 'Corporate Client Facility Partner'}
          </span>
        </div>

        {user.employeeCode && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Employee Code:</span>
            <span className="font-mono font-bold text-slate-900">{user.employeeCode}</span>
          </div>
        )}

        {user.phone && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Phone Number:</span>
            <a href={`tel:${user.phone}`} className="font-mono font-semibold text-slate-900 hover:text-[#1A2B79]">
              {user.phone}
            </a>
          </div>
        )}

        {user.email && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Email Address:</span>
            <span className="font-semibold text-slate-900">{user.email}</span>
          </div>
        )}

        {user.siteName && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Assigned Facility:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px] text-right">
              {user.siteName}
            </span>
          </div>
        )}

        {user.bloodGroup && (
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Blood Group:</span>
            <span className="font-bold text-rose-600">{user.bloodGroup}</span>
          </div>
        )}
      </div>

      {/* 3rd-Party Keys Diagnostic Launcher */}
      {onOpenIntegrations && (
        <button
          onClick={onOpenIntegrations}
          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Key size={15} className="text-[#1A2B79]" />
            <span>3rd-Party Integrations & API Keys</span>
          </div>
          <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            Configure Keys
          </span>
        </button>
      )}

      {/* Emergency Contact & Helpline */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Heart size={14} className="text-rose-500" />
          <span>24/7 Security Control Room</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          In case of field distress, geofence mismatch, or emergency, contact HQ immediately:
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="font-mono font-bold text-slate-900">{COMPANY.phone}</span>
          <a
            href={`tel:${COMPANY.phone}`}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 font-bold text-[#1A2B79] rounded-lg shadow-sm"
          >
            Call Desk
          </a>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <LogOut size={14} />
        <span>Sign Out of Silver Star Mobile</span>
      </button>
    </div>
  );
}
