import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard, Users, Clock, Building2, UserCircle,
  Wifi, Battery, Signal, Smartphone, Maximize2, Minimize2, Bell
} from 'lucide-react'
import type { TabType } from '../App'
import { COMPANY, CLIENTS } from '@mock/mockData'

interface MobileLayoutProps {
  children: ReactNode
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onLogout: () => void
}

export default function MobileLayout({ children, activeTab, onTabChange, onLogout }: MobileLayoutProps) {
  const [deviceFrame, setDeviceFrame] = useState(true)
  const client = CLIENTS.find(c => c.id === 'CLI001') // InfoSys Tech Park

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans">
      {/* Desktop Device Shell Controls */}
      <div className="hidden md:flex items-center gap-3 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Smartphone size={14} className="text-[#26BCEE]" /> Client Mobile Application (Expo / Mobile Prototype)
        </span>
        <span>•</span>
        <span className="text-emerald-400 font-mono text-[11px]">InfoSys Tech Park (Client View)</span>
        <span>•</span>
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
        >
          {deviceFrame ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          {deviceFrame ? 'Expand Full Screen' : 'Show Phone Shell'}
        </button>
      </div>

      {/* Smartphone Container */}
      <div
        className={`w-full bg-[#f8fafc] flex flex-col overflow-hidden transition-all duration-300 relative shadow-2xl ${
          deviceFrame
            ? 'max-w-[400px] h-[840px] md:rounded-[42px] md:border-[10px] md:border-slate-800 ring-1 ring-white/10'
            : 'max-w-2xl min-h-screen md:rounded-2xl'
        }`}
      >
        {/* iOS / Android Status Bar */}
        <div className="h-10 bg-[#202B75] text-white flex items-center justify-between px-6 pt-1 text-[11px] font-medium flex-shrink-0 z-20">
          <span className="font-semibold tracking-wide">09:41</span>
          {/* Dynamic Island / Camera Notch */}
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto hidden md:block" />
          <div className="flex items-center gap-1.5 text-white/90">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} className="text-emerald-400" />
          </div>
        </div>

        {/* Mobile App Header */}
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
              <h1 className="text-xs font-bold leading-tight tracking-wide">{client?.name || 'Client Portal'}</h1>
              <p className="text-[10px] text-[#26BCEE] leading-tight">Live Facility Oversight</p>
            </div>
          </div>
          <button
            onClick={() => alert('Notifications: All morning shifts at Block A & B commenced on schedule.')}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/90 relative"
          >
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#26BCEE] rounded-full" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-20">
          {children}
        </div>

        {/* Native Mobile Bottom Tab Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
          {[
            { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
            { id: 'deployment' as TabType, label: 'Staff', icon: Users },
            { id: 'attendance' as TabType, label: 'Punches', icon: Clock },
            { id: 'sites' as TabType, label: 'Sites', icon: Building2 },
            { id: 'profile' as TabType, label: 'Account', icon: UserCircle },
          ].map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-all ${
                  active ? 'text-[#202B75]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon size={18} className={active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
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
