import { useState, type ReactNode } from 'react'
import {
  MapPin, Clock, QrCode, User, Wifi, Battery, Signal,
  Smartphone, Maximize2, Minimize2, Bell, Shield
} from 'lucide-react'
import type { EmpTabType } from '../App'
import { COMPANY, EMPLOYEES } from '@mock/mockData'

interface LayoutProps {
  children: ReactNode
  activeTab: EmpTabType
  onTabChange: (tab: EmpTabType) => void
  onLogout: () => void
}

export default function EmployeeMobileLayout({ children, activeTab, onTabChange, onLogout }: LayoutProps) {
  const [deviceFrame, setDeviceFrame] = useState(true)
  const emp = EMPLOYEES.find(e => e.id === 'EMP001') // Ramesh Kumar

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans">
      {/* Desktop Device Shell Controls */}
      <div className="hidden md:flex items-center gap-3 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Smartphone size={14} className="text-[#26BCEE]" /> Employee Mobile Application (Field Self-Service)
        </span>
        <span>•</span>
        <span className="text-[#26BCEE] font-mono text-[11px]">{emp?.name} ({emp?.employeeCode})</span>
        <span>•</span>
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
        >
          {deviceFrame ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          {deviceFrame ? 'Expand Full Screen' : 'Show Phone Shell'}
        </button>
      </div>

      {/* Rugged Android Smartphone Shell */}
      <div
        className={`w-full bg-[#f8fafc] flex flex-col overflow-hidden transition-all duration-300 relative shadow-2xl ${
          deviceFrame
            ? 'max-w-[390px] h-[820px] md:rounded-[40px] md:border-[10px] md:border-slate-800 ring-1 ring-white/10'
            : 'max-w-xl min-h-screen md:rounded-2xl'
        }`}
      >
        {/* Status Bar */}
        <div className="h-9 bg-[#202B75] text-white flex items-center justify-between px-5 pt-1 text-[11px] font-medium flex-shrink-0 z-20">
          <span className="font-semibold tracking-wide">08:50</span>
          {/* Front Camera Dot */}
          <div className="w-3 h-3 bg-slate-900 rounded-full mx-auto hidden md:block" />
          <div className="flex items-center gap-1.5 text-white/90">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} className="text-emerald-400" />
          </div>
        </div>

        {/* Header */}
        <div className="bg-[#202B75] px-4 py-3 text-white flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
              <img
                src={COMPANY.logo}
                alt="Silver Star"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div>
              <h1 className="text-xs font-bold leading-tight tracking-wide">{emp?.name}</h1>
              <p className="text-[10px] text-[#26BCEE] font-mono leading-tight">{emp?.employeeCode} · On Duty</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> GPS Live
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
          {[
            { id: 'home' as EmpTabType, label: 'Duty Punch', icon: MapPin },
            { id: 'history' as EmpTabType, label: 'My Muster', icon: Clock },
            { id: 'idcard' as EmpTabType, label: 'Staff ID', icon: QrCode },
            { id: 'profile' as EmpTabType, label: 'Profile', icon: User },
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-0.5 px-3 rounded-lg transition-all ${
                  active ? 'text-[#202B75]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon size={19} className={active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
                  {active && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#26BCEE] rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-bold text-[#202B75]' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

