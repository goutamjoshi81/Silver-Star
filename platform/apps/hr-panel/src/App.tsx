import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import HRDashboard from './pages/HRDashboard'
import EmployeeOnboarding from './pages/EmployeeOnboarding'
import OnboardingForm from './pages/OnboardingForm'
import KYCVerification from './pages/KYCVerification'
import DocumentReview from './pages/DocumentReview'
import EmployeeDirectory from './pages/EmployeeDirectory'
import IDCardGeneration from './pages/IDCardGeneration'
import HRReports from './pages/HRReports'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <Layout onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<HRDashboard />} />
        <Route path="/onboarding" element={<EmployeeOnboarding />} />
        <Route path="/onboarding/new" element={<OnboardingForm />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/documents" element={<DocumentReview />} />
        <Route path="/employees" element={<EmployeeDirectory />} />
        <Route path="/idcards" element={<IDCardGeneration />} />
        <Route path="/reports" element={<HRReports />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
