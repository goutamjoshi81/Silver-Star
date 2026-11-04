import { useState } from 'react'
import Login from './pages/Login'
import EmployeeMobileLayout from './components/EmployeeMobileLayout'
import DutyHome from './pages/DutyHome'
import AttendanceHistory from './pages/AttendanceHistory'
import DigitalID from './pages/DigitalID'
import Profile from './pages/Profile'

export type EmpTabType = 'home' | 'history' | 'idcard' | 'profile'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<EmpTabType>('home')

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <EmployeeMobileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => setIsAuthenticated(false)}
    >
      {activeTab === 'home' && <DutyHome />}
      {activeTab === 'history' && <AttendanceHistory />}
      {activeTab === 'idcard' && <DigitalID />}
      {activeTab === 'profile' && <Profile onLogout={() => setIsAuthenticated(false)} />}
    </EmployeeMobileLayout>
  )
}

