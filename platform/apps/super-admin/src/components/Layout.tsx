import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, MapPin,
  Truck, CreditCard, FileText, BarChart2, Receipt, Shield,
  Bell, Settings, ChevronLeft, ChevronRight, LogOut, Menu,
  Building2, Moon, Briefcase
} from 'lucide-react'
import { COMPANY, NOTIFICATIONS } from '@mock/mockData'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Clients', path: '/clients' },
  { icon: Briefcase, label: 'Services', path: '/services' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: Clock, label: 'Attendance', path: '/attendance' },
  { icon: MapPin, label: 'Geofencing & Sites', path: '/geofencing' },
  { icon: Moon, label: 'Night Patrolling', path: '/night-patrolling' },
  { icon: Truck, label: 'Deployment', path: '/deployment' },
  { icon: CreditCard, label: 'ID Cards', path: '/idcards' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: BarChart2, label: 'Reports & Analytics', path: '/reports' },
  { icon: Receipt, label: 'Billing & Contracts', path: '/billing' },
  { icon: Shield, label: 'User & Roles', path: '/user-roles' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

interface LayoutProps {
  children: ReactNode
  onLogout: () => void
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#f0f2f8] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#202B75] flex flex-col transition-all duration-300
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 min-h-[64px]">
          {collapsed ? (
            <img
              src="/silverstar-icon-512.png"
              alt="Silver Star"
              className="h-9 w-9 object-contain mx-auto rounded-lg"
            />
          ) : (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/silverstar-logo-white-text.png"
                alt="Silver Star Facility Management"
                className="h-9 w-auto object-contain max-w-[190px]"
              />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-[#26BCEE] text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-[#202B75] font-semibold text-base">{currentPage}</h1>
            <p className="text-xs text-gray-400">Super Admin Panel · Silver Star FM</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative text-gray-500 hover:text-[#202B75] p-2">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#202B75] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">SA</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
