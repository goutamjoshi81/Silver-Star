import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Clock, Radio, AlertTriangle, FileText, Truck, Receipt, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { COMPANY } from '@mock/mockData'

const navItems = [
  { icon: LayoutDashboard, label: 'Ops Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'Site Rosters', path: '/rosters' },
  { icon: Clock, label: 'Attendance Monitor', path: '/attendance' },
  { icon: Radio, label: 'Geofence Control', path: '/geofence-alerts' },
  { icon: AlertTriangle, label: 'Incident Management', path: '/incidents' },
  { icon: FileText, label: 'Daily Work Reports', path: '/daily-reports' },
  { icon: Truck, label: 'Staff Deployment', path: '/deployment' },
  { icon: Receipt, label: 'Client Billing', path: '/billing' },
]

export default function Layout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Operations'

  return (
    <div className="flex h-screen bg-[#f0f2f8] overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 ${collapsed ? 'w-16' : 'w-60'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-[#202B75] flex flex-col transition-all duration-300`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[64px]">
          <img src={COMPANY.logo} alt="Silver Star" className="h-9 w-9 object-contain flex-shrink-0 bg-white rounded-md p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          {!collapsed && <div><p className="text-white text-xs font-bold">Operations</p><p className="text-[#26BCEE] text-[10px]">Field Management</p></div>}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#26BCEE] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-white/10">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white py-2 rounded-lg hover:bg-white/10 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
          <div className="flex-1">
            <h1 className="text-[#202B75] font-semibold text-base">{currentPage}</h1>
            <p className="text-xs text-gray-400">Operations Management Panel · Silver Star FM</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">OM</span></div>
            <div className="hidden sm:block"><p className="text-xs font-semibold text-gray-800">Ops Manager</p><p className="text-xs text-gray-400">Operations</p></div>
            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

