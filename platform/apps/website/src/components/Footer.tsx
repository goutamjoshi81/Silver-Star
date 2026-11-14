import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Clock, ShieldCheck, Award, CheckCircle2,
  ArrowRight, Heart, ExternalLink, Sparkles
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f163b] text-white pt-16 pb-8 border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: About Company */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/silverstar-logo-white-text.png"
                alt="Silver Star Facility Management"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/silverstar-icon-512.png';
                }}
              />
            </Link>
            <p className="text-white/70 text-xs leading-relaxed">
              Silver Star Facility Management Pvt. Ltd is an ISO-certified, PSARA-compliant integrated facility management and manpower solutions powerhouse. Over a decade of excellence powering Fortune 500 tech campuses, hospitals, residential townships, and industrial facilities across India.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#26BCEE] font-bold">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} /> PSARA Certified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award size={14} /> ISO 9001:2015
              </span>
            </div>
          </div>

          {/* Col 2: Useful Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white tracking-wide border-b border-white/10 pb-2">
              Useful Links
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link to="/" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Home Page</span>
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>About Us & Vision</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>All Services Offered</span>
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Management Team</span>
                </Link>
              </li>
              <li>
                <Link to="/clientele" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Clientele & Partners</span>
                </Link>
              </li>
              <li>
                <Link to="/training-development" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Training & Development</span>
                </Link>
              </li>
              <li>
                <Link to="/awards-and-recognitions" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Awards & Recognitions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white tracking-wide border-b border-white/10 pb-2">
              Our Core Services
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Integrated Facilities Management</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Manufacturing Support Services</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Business Support & Staffing</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Technical & Electro-Mechanical AMC</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Security & Guarding Services</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Warehouse & Logistics Management</span>
                </Link>
              </li>
              <li>
                <Link to="/services-offered" className="hover:text-[#26BCEE] transition-colors flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#26BCEE]" />
                  <span>Executive Guest House Operations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Branch Offices & Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white tracking-wide border-b border-white/10 pb-2">
              National Headquarters
            </h4>

            {/* Bangalore HQ */}
            <div className="space-y-1.5 text-xs text-white/80">
              <p className="font-bold text-[#26BCEE] flex items-center gap-1">
                <MapPin size={13} />
                <span>Bangalore Corporate Office</span>
              </p>
              <p className="text-[11px] text-white/70 leading-relaxed">
                ARR Building, 1st Floor, Towards Tech Mahindra Road, Electronic City Phase II, Bengaluru, Karnataka – 560100
              </p>
              <p className="text-[11px]">
                Tel: <a href="tel:08050000524" className="text-white hover:underline">+91 08050000524</a>, <a href="tel:9945449802" className="text-white hover:underline">+91 9945449802</a>
              </p>
            </div>

            {/* Noida Regional */}
            <div className="space-y-1.5 text-xs text-white/80 pt-2 border-t border-white/5">
              <p className="font-bold text-[#26BCEE] flex items-center gap-1">
                <MapPin size={13} />
                <span>Noida (Delhi NCR) Regional</span>
              </p>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Office # 104, Ground Floor, Noida Business Center, Near Labour Chowk, Opposite Sector 58, Noida, Uttar Pradesh – 201309
              </p>
              <p className="text-[11px]">
                Tel: <a href="tel:9611255416" className="text-white hover:underline">+91 9611255416</a>, <a href="tel:9620000494" className="text-white hover:underline">+91 9620000494</a>
              </p>
            </div>

            <div className="pt-1 text-[11px] text-white/60 flex items-center gap-1.5">
              <Mail size={12} className="text-[#26BCEE]" />
              <a href="mailto:info@silverstarindia.net" className="hover:text-white underline">
                info@silverstarindia.net
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} SilverStar Facility Management Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>CIN: U74920KA2015PTC081234</span>
            <span>•</span>
            <span>GSTIN: 29AALCS1234M1Z5</span>
            <span>•</span>
            <span className="text-[#26BCEE] font-semibold">Your True Business Partners</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

