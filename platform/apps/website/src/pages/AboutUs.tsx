import { Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, Award, CheckCircle2, Users, ArrowRight,
  Sparkles, Target, Compass, HeartHandshake, MapPin
} from 'lucide-react';

interface AboutUsProps {
  onOpenQuoteModal: (serviceName?: string) => void;
}

export default function AboutUs({ onOpenQuoteModal }: AboutUsProps) {
  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-24">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Company Profile & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            About Silver Star India
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Leading the transformation of integrated facility management with skilled personnel, technology-assisted governance, and uncompromising client dedication.
          </p>
        </div>
      </section>

      {/* Main Narrative & Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
              Our Foundation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              SilverStar Facility Management Private Limited, Bangalore
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Silver Star Facilities Management is passionately committed to empowering client success by delivering exceptional facility solutions. We drive innovation and utilize cutting-edge technology to enhance our facility management services. Our unwavering dedication to excellence guarantees a seamless and sustainable environment, enabling our clients' operations to thrive and prosper.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              With over 10 years of experience, we specialize in managing IT/ITES companies, multi-specialty hospitals, hotels, residential properties, manufacturing hubs, and commercial complexes. Headquartered in Electronic City Phase II, Bengaluru, with regional offices across Noida (Delhi NCR), Hyderabad, and Chennai.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                <p className="text-2xl font-black text-[#202B75]">6,149+</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Skilled Staff Deployed</p>
              </div>
              <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-100">
                <p className="text-2xl font-black text-[#26BCEE]">560+</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Active Client Sites</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg"
                alt="Silver Star Operations"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, and Values */}
      <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
              Core Foundation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Mission Statement & Guiding Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#202B75] flex items-center justify-center">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To deliver reliable, ethical, and high-performance facility solutions that empower clients to focus purely on their core business, while we maintain world-class safety and environmental hygiene.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#26BCEE] flex items-center justify-center">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To be India's most trusted facility management and security guarding enterprise, celebrated for innovation, transparency, digital workforce management, and statutory integrity.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Why Choose Us</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% statutory labor law compliance (PF, ESI, Gratuity), verified background checks, GPS muster tracking, 24/7 management escalation, and transparent client reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-[#202B75] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Partner With Silver Star Today</h3>
            <p className="text-xs text-white/80 max-w-lg">
              Experience the difference of managed facility excellence. Reach out to our management team for a customized site audit.
            </p>
          </div>
          <button
            onClick={() => onOpenQuoteModal()}
            className="px-6 py-3.5 bg-[#26BCEE] hover:bg-[#1fa8d6] text-[#202B75] text-xs font-black rounded-xl shadow-lg shrink-0 transition-all"
          >
            Request Site Audit Quote
          </button>
        </div>
      </section>
    </div>
  );
}
