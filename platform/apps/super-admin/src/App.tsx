import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Employees from './pages/Employees'
import Onboarding from './pages/Onboarding'
import Attendance from './pages/Attendance'
import Geofencing from './pages/Geofencing'
import NightPatrolling from './pages/NightPatrolling'
import Deployment from './pages/Deployment'
import IDCards from './pages/IDCards'
import Documents from './pages/Documents'
import Reports from './pages/Reports'
import Billing from './pages/Billing'
import UserRoles from './pages/UserRoles'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import EmployeeVerificationPage from './pages/EmployeeVerificationPage'

const KNOWN_APP_ROUTES = [
  '/dashboard',
  '/clients',
  '/employees',
  '/onboarding',
  '/attendance',
  '/geofencing',
  '/night-patrolling',
  '/deployment',
  '/idcards',
  '/documents',
  '/reports',
  '/billing',
  '/user-roles',
  '/notifications',
  '/settings',
]

function isEmployeeVerificationPath(pathname: string): boolean {
  const lower = pathname.toLowerCase()
  // Never intercept standard application routes
  if (KNOWN_APP_ROUTES.some(route => lower === route || lower.startsWith(route + '/'))) {
    return false
  }

  // Explicit verification paths: /verify/:id or /emp/:id
  if (lower.startsWith('/verify/') || lower === '/verify') return true
  if (lower.startsWith('/emp/')) return true

  // Direct badge ID path (e.g. /SS-10001, /SS-90001, /SS-FOUNDER-01)
  if (/^\/ss-[a-z0-9_-]+$/i.test(pathname)) return true

  return false
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  // Allow public access to employee verification pages without login
  if (isEmployeeVerificationPath(location.pathname)) {
    return (
      <Routes>
        <Route path="/verify/:id" element={<EmployeeVerificationPage />} />
        <Route path="/verify" element={<EmployeeVerificationPage />} />
        <Route path="/emp/:id" element={<EmployeeVerificationPage />} />
        <Route path="/:id" element={<EmployeeVerificationPage />} />
      </Routes>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <Layout onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/geofencing" element={<Geofencing />} />
        <Route path="/night-patrolling" element={<NightPatrolling />} />
        <Route path="/deployment" element={<Deployment />} />
        <Route path="/idcards" element={<IDCards />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/user-roles" element={<UserRoles />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/verify/:id" element={<EmployeeVerificationPage />} />
        <Route path="/emp/:id" element={<EmployeeVerificationPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
