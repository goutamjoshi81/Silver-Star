import { useState, type ReactNode } from 'react';
import {
  MapPin, Clock, QrCode, User, Wifi, Battery, Signal,
  Smartphone, Maximize2, Minimize2, Bell, Shield, Key,
  Briefcase, Building, AlertTriangle, FileText, Users, LogOut, Moon, ShieldCheck
} from 'lucide-react';
import { COMPANY } from '@mock/mockData';
import type { UserPersona } from '../pages/Login';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  currentUser?: any;
  onOpenIntegrations?: () => void;
}

export default function EmployeeMobileLayout({
  children,
  activeTab,
  onTabChange,
  onLogout,
  currentUser,
  onOpenIntegrations,
}: LayoutProps) {
  const [deviceFrame, setDeviceFrame] = useState(true);
  const persona: UserPersona = currentUser?.persona || 'field';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans antialiased">
      {/* Desktop Device Shell Controls */}
      <div className="hidden md:flex items-center gap-3 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-bold text-white">
          <Smartphone size={14} className="text-[#26BCEE]" /> Silver Star Mobile App
        </span>
        <span>•</span>
        <span className="text-[#26BCEE] font-bold text-[11px] capitalize">
          {persona === 'field' && '🛡️ Field Staff Portal'}
          {persona === 'operations' && '⚡ Operations Console'}
          {persona === 'client' && '🏢 Corporate Client Portal'}
        </span>
        <span>•</span>
        <span className="text-slate-300 font-mono text-[11px]">
          {currentUser?.name} ({currentUser?.employeeCode || currentUser?.portalUsername || 'User'})
        </span>
        <span>•</span>
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
        >
          {deviceFrame ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          {deviceFrame ? 'Expand Full Screen' : 'Show Phone Shell'}
        </button>
      </div>

      {/* Modern iOS / Android Smartphone Chassis */}
      <div
        className={`w-full bg-[#f8fafc] flex flex-col overflow-hidden transition-all duration-300 relative shadow-2xl ${
          deviceFrame
            ? 'max-w-[400px] h-[840px] md:rounded-[44px] md:border-[10px] md:border-slate-800 ring-1 ring-white/10'
            : 'max-w-xl min-h-screen md:rounded-2xl'
        }`}
      >
        {/* Status Bar */}
        <div className="h-9 bg-[#1A2B79] text-white flex items-center justify-between px-5 pt-1 text-[11px] font-medium flex-shrink-0 z-20">
          <span className="font-bold tracking-wide">09:41</span>
          {/* Dynamic Island / Camera Pill */}
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto hidden md:block" />
          <div className="flex items-center gap-1.5 text-white/90">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} className="text-emerald-400" />
          </div>
        </div>

        {/* Top App Header */}
        <div className="bg-[#1A2B79] px-4 py-3 text-white flex items-center justify-between shadow-md flex-shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <img
                src="/silverstar-icon-512.png"
                alt="Silver Star"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-wide font-serif leading-none">Silver Star</h1>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 uppercase">
                  {persona === 'field' && 'Staff'}
                  {persona === 'operations' && 'Ops'}
                  {persona === 'client' && 'Client'}
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/80 truncate max-w-[170px] mt-0.5">
                {currentUser?.name || COMPANY.shortName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Third-party keys diagnostic button */}
            {onOpenIntegrations && (
              <button
                type="button"
                onClick={onOpenIntegrations}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-xl transition-colors"
                title="View 3rd-party API integrations (Google Maps, Firebase, S3)"
              >
                <Key size={14} />
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-1.5 bg-white/10 hover:bg-rose-600/80 text-white rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>

        {/* Dynamic Bottom Navigation Bar based on Active Persona */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
          
          {/* 1. FIELD EMPLOYEE TABS */}
          {persona === 'field' && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('duties')}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                  (activeTab === 'duties' || activeTab === 'home' || activeTab === 'patrol')
                    ? 'text-[#1A2B79] font-black'
                    : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <ShieldCheck size={18} className={(activeTab === 'duties' || activeTab === 'home' || activeTab === 'patrol') ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">My Duties</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('history')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'history' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Clock size={17} className={activeTab === 'history' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Audits</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('idcard')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'idcard' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <QrCode size={17} className={activeTab === 'idcard' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Smart ID</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('profile')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <User size={17} className={activeTab === 'profile' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Profile</span>
              </button>
            </>
          )}

          {/* 2. OPERATIONS EMPLOYEE TABS (NO PUNCH REQUIRED) */}
          {persona === 'operations' && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('ops-dashboard')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
                  activeTab === 'ops-dashboard' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Briefcase size={18} className={activeTab === 'ops-dashboard' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Console</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('ops-sites')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
                  activeTab === 'ops-sites' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <MapPin size={18} className={activeTab === 'ops-sites' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Sites & GPS</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('ops-deployment')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
                  activeTab === 'ops-deployment' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Users size={18} className={activeTab === 'ops-deployment' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Deploy</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('ops-attendance')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
                  activeTab === 'ops-attendance' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Shield size={18} className={activeTab === 'ops-attendance' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Muster</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('profile')}
                className={`flex flex-col items-center py-1 px-2 rounded-2xl transition-all ${
                  activeTab === 'profile' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <User size={18} className={activeTab === 'profile' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[9px] mt-0.5">Profile</span>
              </button>
            </>
          )}

          {/* 3. CORPORATE CLIENT TABS */}
          {persona === 'client' && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('client-dashboard')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                  activeTab === 'client-dashboard' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Building size={18} className={activeTab === 'client-dashboard' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[10px] mt-0.5">Overview</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('client-deployment')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                  activeTab === 'client-deployment' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Users size={18} className={activeTab === 'client-deployment' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[10px] mt-0.5">Workforce</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('client-attendance')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                  activeTab === 'client-attendance' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <Clock size={18} className={activeTab === 'client-attendance' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[10px] mt-0.5">Muster</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('client-sites')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                  activeTab === 'client-sites' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <MapPin size={18} className={activeTab === 'client-sites' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[10px] mt-0.5">Campuses</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('profile')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                  activeTab === 'profile' ? 'text-[#1A2B79] font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
                }`}
              >
                <User size={18} className={activeTab === 'profile' ? 'text-[#1A2B79]' : ''} />
                <span className="text-[10px] mt-0.5">Profile</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
