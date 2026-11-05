import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import OpsDashboard from './pages/OpsDashboard'
import OpsClients from './pages/OpsClients'
import OpsEmployees from './pages/OpsEmployees'
import SiteRosters from './pages/SiteRosters'
import AttendanceMonitor from './pages/AttendanceMonitor'
import GeofenceAlerts from './pages/GeofenceAlerts'
import IncidentManagement from './pages/IncidentManagement'
import DailyWorkReports from './pages/DailyWorkReports'
import OpsDeployment from './pages/OpsDeployment'
import OpsBilling from './pages/OpsBilling'
import EmployeeVerificationPage from './pages/EmployeeVerificationPage'

export default function App() {
  const [auth, setAuth] = useState(false)
  const location = useLocation()

  // Allow public access to employee verification pages without login
  const isPublicVerification =
    location.pathname.startsWith('/verify') ||
    location.pathname.startsWith('/emp');

  if (isPublicVerification) {
    return (
      <Routes>
        <Route path="/verify/:id" element={<EmployeeVerificationPage />} />
        <Route path="/verify" element={<EmployeeVerificationPage />} />
        <Route path="/emp/:id" element={<EmployeeVerificationPage />} />
        <Route path="/emp" element={<EmployeeVerificationPage />} />
        <Route path="*" element={<EmployeeVerificationPage />} />
      </Routes>
    )
  }

  if (!auth) return <Login onLogin={() => setAuth(true)} />

  return (
    <Layout onLogout={() => setAuth(false)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<OpsDashboard />} />
        <Route path="/clients" element={<OpsClients />} />
        <Route path="/employees" element={<OpsEmployees />} />
        <Route path="/rosters" element={<SiteRosters />} />
        <Route path="/attendance" element={<AttendanceMonitor />} />
        <Route path="/geofence-alerts" element={<GeofenceAlerts />} />
        <Route path="/incidents" element={<IncidentManagement />} />
        <Route path="/daily-reports" element={<DailyWorkReports />} />
        <Route path="/deployment" element={<OpsDeployment />} />
        <Route path="/billing" element={<OpsBilling />} />
        <Route path="/verify/:id" element={<EmployeeVerificationPage />} />
        <Route path="/emp/:id" element={<EmployeeVerificationPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
