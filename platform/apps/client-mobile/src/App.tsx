import { useState } from 'react'
import Login from './pages/Login'
import MobileLayout from './components/MobileLayout'
import ClientDashboard from './pages/ClientDashboard'
import ClientDeployment from './pages/ClientDeployment'
import ClientAttendance from './pages/ClientAttendance'
import ClientSites from './pages/ClientSites'
import ClientProfile from './pages/ClientProfile'

export type TabType = 'dashboard' | 'deployment' | 'attendance' | 'sites' | 'profile'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <MobileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => setIsAuthenticated(false)}
    >
      {activeTab === 'dashboard' && <ClientDashboard onNavigate={setActiveTab} />}
      {activeTab === 'deployment' && <ClientDeployment />}
      {activeTab === 'attendance' && <ClientAttendance />}
      {activeTab === 'sites' && <ClientSites />}
      {activeTab === 'profile' && <ClientProfile onLogout={() => setIsAuthenticated(false)} />}
    </MobileLayout>
  )
}

