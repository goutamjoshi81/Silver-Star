import { useState, lazy, Suspense } from 'react';
import Login, { type UserPersona } from './pages/Login';
import EmployeeMobileLayout from './components/EmployeeMobileLayout';
import IntegrationsDrawer from './components/IntegrationsDrawer';
import ErrorBoundary from './components/ErrorBoundary';

// Field Staff Pages (Immediate / Core)
import DutyHome from './pages/DutyHome';
import AttendanceHistory from './pages/AttendanceHistory';
import DigitalID from './pages/DigitalID';
import Profile from './pages/Profile';

// Operations Pages (Lazy-loaded on demand)
const OpsMobileHome = lazy(() => import('./pages/ops/OpsMobileHome'));
const OpsMobileSites = lazy(() => import('./pages/ops/OpsMobileSites'));
const OpsMobileDeployment = lazy(() => import('./pages/ops/OpsMobileDeployment'));
const OpsMobileAttendance = lazy(() => import('./pages/ops/OpsMobileAttendance'));
const OpsMobileIncidents = lazy(() => import('./pages/ops/OpsMobileIncidents'));
const OpsMobileDWR = lazy(() => import('./pages/ops/OpsMobileDWR'));

// Corporate Client Pages (Lazy-loaded on demand)
const ClientMobileHome = lazy(() => import('./pages/client/ClientMobileHome'));
const ClientMobileDeployment = lazy(() => import('./pages/client/ClientMobileDeployment'));
const ClientMobileAttendance = lazy(() => import('./pages/client/ClientMobileAttendance'));
const ClientMobileSites = lazy(() => import('./pages/client/ClientMobileSites'));

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
      <ErrorBoundary>
        <Login onLogin={handleLogin} onOpenIntegrations={() => setShowIntegrations(true)} />
        <IntegrationsDrawer isOpen={showIntegrations} onClose={() => setShowIntegrations(false)} />
      </ErrorBoundary>
    );
  }

  const persona: UserPersona = currentUser?.persona || 'field';

  return (
    <ErrorBoundary>
      <EmployeeMobileLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        onOpenIntegrations={() => setShowIntegrations(true)}
      >
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
              <div className="w-8 h-8 border-2 border-[#26BCEE] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-300">Loading module...</p>
            </div>
          }
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
        </Suspense>
      </EmployeeMobileLayout>

      {/* 3rd-Party Diagnostics & API Keys Modal */}
      <IntegrationsDrawer isOpen={showIntegrations} onClose={() => setShowIntegrations(false)} />
    </ErrorBoundary>
  );
}
