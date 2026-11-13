import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Phone, Mail, Clock, ChevronDown, Menu, X, Shield,
  ArrowRight, Sparkles, Building2, ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenPortalModal: () => void;
}

export default function Navbar({ onOpenQuoteModal, onOpenPortalModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 font-sans transition-all duration-300">
      {/* Top Bar (Corporate Info) */}
      <div className="bg-[#161f56] text-white/90 text-[11px] py-1.5 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:08050000524"
              className="flex items-center gap-1.5 hover:text-[#26BCEE] transition-colors"
            >
              <Phone size={12} className="text-[#26BCEE]" />
              <span className="font-semibold">+91 08050000524</span>
            </a>
            <a
              href="mailto:info@silverstarindia.net"
              className="flex items-center gap-1.5 hover:text-[#26BCEE] transition-colors"
            >
              <Mail size={12} className="text-[#26BCEE]" />
              <span>info@silverstarindia.net</span>
            </a>
            <div className="flex items-center gap-1.5 text-white/70">
              <Clock size={12} className="text-[#26BCEE]" />
              <span>Mon – Fri: 8:00am – 7:00pm</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-white/60">PSARA Verified Facility Management</span>
            <span className="text-white/30">|</span>
            <button
              onClick={onOpenPortalModal}
              className="text-[#26BCEE] hover:text-white flex items-center gap-1 transition-colors"
            >
              <Shield size={12} />
              <span>Staff & Client Portals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-100 text-slate-800'
            : 'bg-white/90 backdrop-blur-sm py-4 border-b border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/silverstar-logo.png"
              alt="Silver Star Facility Management"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/silverstar-icon-512.png';
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold tracking-wide">
            <Link
              to="/"
              className={`transition-colors py-1 relative ${
                isActive('/') ? 'text-[#202B75]' : 'text-slate-700 hover:text-[#202B75]'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#26BCEE] rounded-full" />
              )}
            </Link>

            {/* About Dropdown */}
            <div
              className="relative group py-1"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1 transition-colors ${
                  location.pathname.includes('/about') ||
                  location.pathname.includes('/training') ||
                  location.pathname.includes('/awards')
                    ? 'text-[#202B75]'
                    : 'text-slate-700 hover:text-[#202B75]'
                }`}
              >
                <span>About Us</span>
                <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </button>

              {aboutDropdownOpen && (
                <div className="absolute top-full left-0 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1 animate-in fade-in slide-in-from-top-1">
                  <Link
                    to="/about-us"
                    className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#202B75] transition-colors"
                  >
                    About Silver Star India
                  </Link>
                  <Link
                    to="/training-development"
                    className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#202B75] transition-colors"
                  >
                    Training & Development
                  </Link>
                  <Link
                    to="/awards-and-recognitions"
                    className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#202B75] transition-colors"
                  >
                    Awards & Recognitions
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/services-offered"
              className={`transition-colors py-1 relative ${
                isActive('/services-offered') || isActive('/services')
                  ? 'text-[#202B75]'
                  : 'text-slate-700 hover:text-[#202B75]'
              }`}
            >
              Services Offered
              {(isActive('/services-offered') || isActive('/services')) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#26BCEE] rounded-full" />
              )}
            </Link>

            <Link
              to="/team"
              className={`transition-colors py-1 relative ${
                isActive('/team') ? 'text-[#202B75]' : 'text-slate-700 hover:text-[#202B75]'
              }`}
            >
              Management Team
              {isActive('/team') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#26BCEE] rounded-full" />
              )}
            </Link>

            <Link
              to="/clientele"
              className={`transition-colors py-1 relative ${
                isActive('/clientele') ? 'text-[#202B75]' : 'text-slate-700 hover:text-[#202B75]'
              }`}
            >
              Clientele
              {isActive('/clientele') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#26BCEE] rounded-full" />
              )}
            </Link>

            <Link
              to="/contacts"
              className={`transition-colors py-1 relative ${
                isActive('/contacts') ? 'text-[#202B75]' : 'text-slate-700 hover:text-[#202B75]'
              }`}
            >
              Contacts
              {isActive('/contacts') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#26BCEE] rounded-full" />
              )}
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenPortalModal}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#202B75] hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <Shield size={14} className="text-[#26BCEE]" />
              <span>Portal Login</span>
            </button>

            <button
              onClick={() => onOpenQuoteModal()}
              className="px-5 py-2.5 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-black shadow-md shadow-[#202B75]/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={14} className="text-[#26BCEE]" />
              <span>Get Free Quote</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2.5 text-sm font-bold text-slate-800">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/') ? 'text-[#202B75]' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/about-us') ? 'text-[#202B75]' : ''}`}
              >
                About Us
              </Link>
              <Link
                to="/training-development"
                onClick={() => setMobileMenuOpen(false)}
                className="pl-3 py-1 text-xs text-slate-500 font-semibold"
              >
                ↳ Training & Development
              </Link>
              <Link
                to="/awards-and-recognitions"
                onClick={() => setMobileMenuOpen(false)}
                className="pl-3 py-1 text-xs text-slate-500 font-semibold"
              >
                ↳ Awards & Recognitions
              </Link>
              <Link
                to="/services-offered"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/services-offered') ? 'text-[#202B75]' : ''}`}
              >
                Services Offered
              </Link>
              <Link
                to="/team"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/team') ? 'text-[#202B75]' : ''}`}
              >
                Management Team
              </Link>
              <Link
                to="/clientele"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/clientele') ? 'text-[#202B75]' : ''}`}
              >
                Clientele
              </Link>
              <Link
                to="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 ${isActive('/contacts') ? 'text-[#202B75]' : ''}`}
              >
                Contacts
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full py-3 bg-[#202B75] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-[#26BCEE]" />
                <span>Request Free Quote</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortalModal();
                }}
                className="w-full py-2.5 border border-slate-200 text-xs font-bold text-[#202B75] rounded-xl flex items-center justify-center gap-1.5"
              >
                <Shield size={14} />
                <span>Internal Platform Login</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
