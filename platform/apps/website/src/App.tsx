import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuoteModal from './components/QuoteModal';
import PortalLoginModal from './components/PortalLoginModal';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ServicesOffered from './pages/ServicesOffered';
import Team from './pages/Team';
import Clientele from './pages/Clientele';
import TrainingDevelopment from './pages/TrainingDevelopment';
import AwardsRecognitions from './pages/AwardsRecognitions';
import Contacts from './pages/Contacts';

import { Phone, MessageCircle, Sparkles, Shield } from 'lucide-react';

export default function App() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleOpenQuote = (serviceName?: string) => {
    setSelectedService(serviceName);
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#26BCEE] selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenQuoteModal={handleOpenQuote}
        onOpenPortalModal={() => setIsPortalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onOpenQuoteModal={handleOpenQuote}
                onOpenPortalModal={() => setIsPortalOpen(true)}
              />
            }
          />
          <Route path="/about-us" element={<AboutUs onOpenQuoteModal={handleOpenQuote} />} />
          <Route
            path="/services-offered"
            element={<ServicesOffered onOpenQuoteModal={handleOpenQuote} />}
          />
          <Route
            path="/services"
            element={<ServicesOffered onOpenQuoteModal={handleOpenQuote} />}
          />
          <Route path="/team" element={<Team onOpenQuoteModal={() => handleOpenQuote()} />} />
          <Route path="/clientele" element={<Clientele onOpenQuoteModal={() => handleOpenQuote()} />} />
          <Route
            path="/training-development"
            element={<TrainingDevelopment onOpenQuoteModal={() => handleOpenQuote()} />}
          />
          <Route
            path="/awards-and-recognitions"
            element={<AwardsRecognitions onOpenQuoteModal={() => handleOpenQuote()} />}
          />
          <Route path="/contacts" element={<Contacts />} />
          <Route
            path="*"
            element={
              <Home
                onOpenQuoteModal={handleOpenQuote}
                onOpenPortalModal={() => setIsPortalOpen(true)}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Quick Action CTA (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsPortalOpen(true)}
          className="bg-[#202B75] hover:bg-[#161f56] text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 border border-white/20"
          title="Open Staff & Client Operational Portals"
        >
          <Shield size={16} className="text-[#26BCEE]" />
          <span className="hidden sm:inline">Portals</span>
        </button>

        <button
          onClick={() => handleOpenQuote()}
          className="bg-[#26BCEE] hover:bg-[#1fa8d6] text-[#202B75] px-4 py-3 rounded-2xl shadow-xl shadow-[#26BCEE]/30 flex items-center gap-2 text-xs font-black transition-all hover:scale-105"
        >
          <Sparkles size={16} />
          <span>Quick Quote</span>
        </button>
      </div>

      {/* Modals */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        defaultService={selectedService}
      />

      <PortalLoginModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />
    </div>
  );
}
