import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Building2,
  Users, Factory, Wrench, Boxes, Coffee, Phone, Mail, Award,
  Clock, MapPin, ChevronRight, Star, ExternalLink, Play
} from 'lucide-react';
import { api } from '@mock/mockData';

interface HomeProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenPortalModal: () => void;
}

export default function Home({ onOpenQuoteModal, onOpenPortalModal }: HomeProps) {
  const [services, setServices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sector tab
  const [activeSector, setActiveSector] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, teamRes, clientsRes] = await Promise.all([
          api.getServices().catch(() => []),
          api.getTeam().catch(() => []),
          api.getWebsiteClientele().catch(() => []),
        ]);
        setServices(servicesRes || []);
        setTeam(teamRes || []);
        setClients(clientsRes || []);
      } catch (err) {
        console.error('Failed to load website data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const sectors = [
    {
      title: 'IT & Tech Parks',
      desc: 'Round-the-clock technical operations, mechanized deep floor care, and access-controlled security guarding for major IT conglomerates.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr1.jpg',
      points: ['Mechanized Floor Care', 'CCTV & Visitor Management', '24/7 HVAC & DG Support']
    },
    {
      title: 'Healthcare & Hospitals',
      desc: 'Medical-grade bio-sanitization, sterile infection control, waste segregation, and trained emergency patient transfer stewards.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr4.jpg',
      points: ['Bio-Medical Sanitization', 'Critical Ward Disinfection', 'Paramedic Security Protocols']
    },
    {
      title: 'Industrial & Manufacturing',
      desc: 'Plant floor assembly support, industrial cleaning, ESI/PF labor compliance, and certified material handling operators.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/09/2.jpg',
      points: ['Line Operator Deployment', 'Statutory Compliance 100%', 'Forklift & Equipment Crews']
    },
    {
      title: 'Commercial & Corporate Hubs',
      desc: 'Front desk reception concierge, pantry stewards, mailroom coordination, and annual maintenance contracts for corporate campuses.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/09/4.jpg',
      points: ['Executive Concierge', 'Corporate Pantry Boys', 'Meeting Room AV Support']
    },
    {
      title: 'Gated Residential Townships',
      desc: 'Perimeter night patrolling, visitor QR pass verification, clubhouse & swimming pool maintenance, and horticulture care.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr5.jpg',
      points: ['Boom Barrier Security', 'Landscape Horticulture', 'Clubhouse Facility Upkeep']
    },
    {
      title: 'Warehousing & 3PL Logistics',
      desc: 'Heavy cargo dock marshals, inventory audit clerks, certified reach truck drivers, and 24/7 boundary surveillance.',
      image: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr6.jpg',
      points: ['Forklift Operators', 'Inventory Audit Crews', 'Perimeter Dog Squads']
    },
  ];

  return (
    <div className="pt-24 sm:pt-28 font-sans space-y-16 sm:space-y-24">
      {/* ======================================================== */}
      {/* 1. HERO SLIDER BANNER */}
      {/* ======================================================== */}
      <section className="relative min-h-[580px] sm:min-h-[660px] flex items-center justify-center bg-gradient-to-br from-[#0e1744] via-[#162363] to-[#202B75] text-white overflow-hidden -mt-8 sm:-mt-12">
        {/* Background Overlay & Decorative Elements */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#26BCEE_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#26BCEE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#1A2B79]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#26BCEE] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Leading Facility Management & Guarding Partner</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Empowering Facilities With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#26BCEE] to-cyan-200">
                Excellence & Precision
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Silver Star Facility Management Pvt. Ltd delivers premier integrated facility solutions, PSARA-licensed security guarding, electro-mechanical engineering, and specialized industrial workforce across India.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onOpenQuoteModal()}
                className="px-6 py-3.5 rounded-xl bg-[#26BCEE] hover:bg-[#1fa8d6] active:scale-[0.98] text-[#202B75] font-black text-xs shadow-xl shadow-[#26BCEE]/30 flex items-center gap-2 transition-all"
              >
                <span>Request Free Online Quote</span>
                <ArrowRight size={15} />
              </button>

              <Link
                to="/services-offered"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-all"
              >
                <span>Explore Services</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Badges Bar */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-white/80 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#26BCEE]" />
                <span>100% PSARA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#26BCEE]" />
                <span>ISO 9001:2015 Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#26BCEE]" />
                <span>Verified ESI & PF Standards</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/60 p-2 backdrop-blur-sm">
              <img
                src="https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg"
                alt="Silver Star Operations"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />

              {/* Floating Quick Card */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-slate-900 shadow-xl border border-white/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#202B75] uppercase tracking-wider">
                    Client Trust Benchmark
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    3,507+ Enterprise Accounts
                  </p>
                  <p className="text-[11px] text-slate-500">Across Bengaluru, NCR, Hyderabad & Chennai</p>
                </div>
                <button
                  onClick={onOpenPortalModal}
                  className="px-3.5 py-2 bg-[#202B75] text-white text-[11px] font-bold rounded-xl shadow hover:bg-[#161f56] transition-colors"
                >
                  Portals
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. STATS COUNTER BAR */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="pt-3 sm:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-[#202B75] tracking-tight">10+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Years of Excellence</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Established in India</p>
          </div>

          <div className="pt-3 sm:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-[#26BCEE] tracking-tight">6,149+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Deployed Workforce</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Guards & Housekeepers</p>
          </div>

          <div className="pt-3 sm:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-[#202B75] tracking-tight">560+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Active Client Sites</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pan-India Operations</p>
          </div>

          <div className="pt-3 sm:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">99.8%</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">SLA Satisfaction</p>
            <p className="text-[11px] text-slate-500 mt-0.5">3,507+ Happy Clients</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. ABOUT US TEASER SECTION */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://silverstarindia.net/wp-content/uploads/2024/09/2.jpg"
                alt="About Silver Star Facility Management"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202B75]/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#26BCEE]">
                  Corporate Integrity
                </span>
                <h3 className="text-xl font-bold">Your True Business Partners</h3>
                <p className="text-xs text-white/80">Delivering reliable, technology-assisted manpower management.</p>
              </div>
            </div>

            {/* Experience Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#202B75] text-white p-4 rounded-2xl shadow-xl border-4 border-white text-center">
              <p className="text-2xl font-black text-[#26BCEE]">10+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">Years Experience</p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#202B75] text-xs font-bold uppercase tracking-wider">
              <Building2 size={13} className="text-[#26BCEE]" />
              <span>About Silver Star India</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              SilverStar Facility Management Private Limited, Bangalore
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Silver Star Facilities Management is passionately committed to empowering client success by delivering exceptional facility solutions. We drive innovation and utilize cutting-edge digital technology to enhance our facility management, physical security, and operations oversight.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              With over 10 years of experience, we specialize in managing Fortune 500 tech campuses, multi-specialty hospitals, residential townships, manufacturing lines, and logistics hubs. Our unwavering dedication to excellence guarantees a seamless, compliant, and productive environment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#26BCEE]" />
                <span>Single-Window Integrated Facility Services</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#26BCEE]" />
                <span>100% Statutory PF, ESI & Labor Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#26BCEE]" />
                <span>GPS Geofenced Digital Attendance Muster</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#26BCEE]" />
                <span>24/7 National Emergency Quick Response</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/about-us"
                className="px-5 py-3 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <span>Read Full Company Profile</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/team"
                className="text-xs font-bold text-[#202B75] hover:underline"
              >
                Meet Executive Team →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SERVICES OFFERED SHOWCASE (CONNECTED TO POSTGRESQL DB) */}
      {/* ======================================================== */}
      <section className="bg-slate-50/80 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-[#202B75] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="text-[#26BCEE]" />
              <span>Comprehensive Solutions</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Services Offered
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tailored facility management, technical maintenance, and skilled workforce operations designed to drive efficiency and safeguard client assets.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-[#202B75]/20 border-t-[#202B75] rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Loading live services from database...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden group hover:-translate-y-1 duration-300"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.imageUrl || 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#202B75]/90 text-white backdrop-blur-sm">
                      {service.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#202B75] transition-colors leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {service.shortDescription}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => onOpenQuoteModal(service.title)}
                        className="text-xs font-bold text-[#202B75] hover:text-[#26BCEE] flex items-center gap-1 transition-colors"
                      >
                        <span>Request Quote</span>
                        <ArrowRight size={13} />
                      </button>

                      <Link
                        to="/services-offered"
                        className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/services-offered"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold shadow-md transition-all"
            >
              <span>View All Detailed Scope of Work</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTORS SERVICED (INTERACTIVE TABS) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#202B75] text-xs font-bold uppercase tracking-wider">
            <Building2 size={13} className="text-[#26BCEE]" />
            <span>Industry Segments</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Sectors Serviced
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From sterile medical environments to 24/7 IT technology campuses, Silver Star adapts operational protocols to specific industry compliance mandates.
          </p>
        </div>

        {/* Sector Tabs Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          {sectors.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSector(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSector === idx
                  ? 'bg-[#202B75] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Active Sector Display */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
              Specialized Protocol
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              {sectors[activeSector].title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {sectors[activeSector].desc}
            </p>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standard Operational Deliverables:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                {sectors[activeSector].points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#26BCEE] shrink-0" />
                    <span className="font-semibold">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onOpenQuoteModal(sectors[activeSector].title)}
                className="px-5 py-3 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold shadow flex items-center gap-2 transition-all"
              >
                <span>Request {sectors[activeSector].title} Proposal</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-lg h-72 sm:h-80 bg-slate-100">
              <img
                src={sectors[activeSector].image}
                alt={sectors[activeSector].title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MANAGEMENT TEAM SHOWCASE (CONNECTED TO POSTGRESQL DB) */}
      {/* ======================================================== */}
      <section className="bg-slate-50/80 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-[#202B75] text-xs font-bold uppercase tracking-wider">
              <Users size={13} className="text-[#26BCEE]" />
              <span>Leadership Governance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Management Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Veteran leadership combining decades of specialized security command, facilities engineering, statutory compliance, and corporate business expansion.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading leadership team...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="relative h-64 bg-slate-100 overflow-hidden">
                    <img
                      src={member.photoUrl || 'https://silverstarindia.net/wp-content/uploads/2024/08/tm2.jpg'}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://silverstarindia.net/wp-content/uploads/2024/08/tm2.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h4 className="text-base font-black truncate">{member.name}</h4>
                      <p className="text-xs text-[#26BCEE] font-semibold truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {member.bio || 'Executive management ensuring operational precision and client satisfaction.'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-2 border-t border-slate-100 mt-2">
                      {member.department || 'Executive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#202B75] hover:underline"
            >
              <span>View Complete Leadership Hierarchy & Regional Heads</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CLIENTELE SHOWCASE (CONNECTED TO POSTGRESQL DB) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#202B75] text-xs font-bold uppercase tracking-wider">
            <Building2 size={13} className="text-[#26BCEE]" />
            <span>Valued Client Partnerships</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Clientele
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Trusted by prominent technology enterprises, healthcare networks, industrial plants, and commercial developers across India.
          </p>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center h-28 group"
            >
              <img
                src={c.logoUrl}
                alt={c.name}
                className="max-h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-85 group-hover:opacity-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/silverstar-icon-512.png';
                }}
              />
              <span className="text-[10px] font-bold text-slate-600 mt-2 truncate w-full">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/clientele"
            className="text-xs font-bold text-[#202B75] hover:underline"
          >
            Explore Complete Client Portfolio & Case Studies →
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. TRAINING & DEVELOPMENT PILLARS */}
      {/* ======================================================== */}
      <section className="bg-[#161f56] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
              Operational Quality Assurance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Training & Development Academy
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Every deployed guard, housekeeper, and supervisor undergoes rigorous classroom instruction, fire safety drills, and emergency readiness verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-[#26BCEE]">01.</span>
              <h3 className="text-base font-bold text-white">State-of-the-Art Training Center</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Dedicated training grounds equipped with fire simulators, physical obstacle courses, and access control computer stations to prepare guards for frontline duties.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-[#26BCEE]">02.</span>
              <h3 className="text-base font-bold text-white">Employee Skill Development</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Regular refresher modules covering mechanized cleaning machinery operation, etiquette, behavioral discipline, biometric muster handling, and customer care.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-[#26BCEE]">03.</span>
              <h3 className="text-base font-bold text-white">Crisis Management & Drills</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Evacuation preparedness, fire suppression tactics, first-aid CPR certification, and coordinated mock drills with local emergency authorities.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/training-development"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#26BCEE] hover:bg-[#1fa8d6] text-[#202B75] text-xs font-black shadow-lg transition-all"
            >
              <span>Learn About Training Modules</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. CONTACT US TODAY & GET A FREE QUOTE */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-gradient-to-br from-[#202B75] via-[#161f56] to-[#0e1744] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
              Ready to Upgrade Your Facility Standards?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Contact Us Today and Get a Free Online Quote Now!
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Our regional operations directors will conduct a thorough on-site assessment and provide a customized proposal with guaranteed SLA standards.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
              <a href="tel:08050000524" className="flex items-center gap-2 text-white hover:text-[#26BCEE] font-bold">
                <Phone size={15} className="text-[#26BCEE]" />
                <span>+91 08050000524</span>
              </a>
              <a href="mailto:info@silverstarindia.net" className="flex items-center gap-2 text-white hover:text-[#26BCEE]">
                <Mail size={15} className="text-[#26BCEE]" />
                <span>info@silverstarindia.net</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={() => onOpenQuoteModal()}
              className="px-6 py-4 rounded-xl bg-[#26BCEE] hover:bg-[#1fa8d6] active:scale-[0.98] text-[#202B75] font-black text-xs shadow-xl shadow-[#26BCEE]/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles size={16} />
              <span>Request Free Quote</span>
            </button>

            <Link
              to="/contacts"
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all text-center"
            >
              <span>Visit Branch Offices</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
