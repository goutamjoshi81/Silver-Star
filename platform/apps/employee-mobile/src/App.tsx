import { useState } from 'react';
import Login, { type UserPersona } from './pages/Login';
import EmployeeMobileLayout from './components/EmployeeMobileLayout';
import IntegrationsDrawer from './components/IntegrationsDrawer';

// Field Staff Pages
import DutyHome from './pages/DutyHome';
import AttendanceHistory from './pages/AttendanceHistory';
import DigitalID from './pages/DigitalID';
import Profile from './pages/Profile';

// Operations Pages (Full ops feature set, no punch required)
import OpsMobileHome from './pages/ops/OpsMobileHome';
import OpsMobileSites from './pages/ops/OpsMobileSites';
import OpsMobileDeployment from './pages/ops/OpsMobileDeployment';
import OpsMobileAttendance from './pages/ops/OpsMobileAttendance';
import OpsMobileIncidents from './pages/ops/OpsMobileIncidents';
import OpsMobileDWR from './pages/ops/OpsMobileDWR';

// Corporate Client Pages
import ClientMobileHome from './pages/client/ClientMobileHome';
import ClientMobileDeployment from './pages/client/ClientMobileDeployment';
import ClientMobileAttendance from './pages/client/ClientMobileAttendance';
import ClientMobileSites from './pages/client/ClientMobileSites';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showIntegrations, setShowIntegrations] = useState(false);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Set default tab based on persona
    if (user.persona === 'operations') {
      setActiveTab('ops-dashboard');
    } else if (user.persona === 'client') {
      setActiveTab('client-dashboard');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} onOpenIntegrations={() => setShowIntegrations(true)} />
        <IntegrationsDrawer isOpen={showIntegrations} onClose={() => setShowIntegrations(false)} />
      </>
    );
  }

  const persona: UserPersona = currentUser?.persona || 'field';

  return (
    <>
      <EmployeeMobileLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        onOpenIntegrations={() => setShowIntegrations(true)}
      >
        {/* 1. FIELD STAFF PERSONA */}
        {persona === 'field' && (
          <>
            {activeTab === 'home' && (
              <DutyHome currentUser={currentUser} onNavigateTab={setActiveTab} />
            )}
            {activeTab === 'history' && <AttendanceHistory />}
            {activeTab === 'idcard' && <DigitalID currentUser={currentUser} />}
            {activeTab === 'profile' && (
              <Profile
                onLogout={handleLogout}
                currentUser={currentUser}
                onOpenIntegrations={() => setShowIntegrations(true)}
              />
            )}
          </>
        )}

        {/* 2. OPERATIONS PERSONA (NO PUNCH IN/OUT REQUIRED) */}
        {persona === 'operations' && (
          <>
            {activeTab === 'ops-dashboard' && (
              <OpsMobileHome onNavigateTab={setActiveTab} currentUser={currentUser} />
            )}
            {activeTab === 'ops-sites' && <OpsMobileSites />}
            {activeTab === 'ops-deployment' && <OpsMobileDeployment />}
            {activeTab === 'ops-attendance' && <OpsMobileAttendance />}
            {activeTab === 'ops-incidents' && <OpsMobileIncidents />}
            {activeTab === 'ops-dwr' && <OpsMobileDWR />}
            {activeTab === 'profile' && (
              <Profile
                onLogout={handleLogout}
                currentUser={currentUser}
                onOpenIntegrations={() => setShowIntegrations(true)}
              />
            )}
          </>
        )}

        {/* 3. CORPORATE CLIENT PERSONA */}
        {persona === 'client' && (
          <>
            {activeTab === 'client-dashboard' && (
              <ClientMobileHome currentUser={currentUser} onNavigateTab={setActiveTab} />
            )}
            {activeTab === 'client-deployment' && (
              <ClientMobileDeployment currentUser={currentUser} />
            )}
            {activeTab === 'client-attendance' && (
              <ClientMobileAttendance currentUser={currentUser} />
            )}
            {activeTab === 'client-sites' && (
              <ClientMobileSites currentUser={currentUser} />
            )}
            {activeTab === 'profile' && (
              <Profile
                onLogout={handleLogout}
                currentUser={currentUser}
                onOpenIntegrations={() => setShowIntegrations(true)}
              />
            )}
          </>
        )}
      </EmployeeMobileLayout>

      {/* 3rd-Party Diagnostics & API Keys Modal */}
      <IntegrationsDrawer isOpen={showIntegrations} onClose={() => setShowIntegrations(false)} />
    </>
  );
}
