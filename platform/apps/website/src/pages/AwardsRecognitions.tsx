import { Award, ShieldCheck, CheckCircle2, Star, Sparkles, Building2 } from 'lucide-react';

interface AwardsRecognitionsProps {
  onOpenQuoteModal: () => void;
}

export default function AwardsRecognitions({ onOpenQuoteModal }: AwardsRecognitionsProps) {
  const awards = [
    {
      title: 'PSARA License & Verified Agency Certification',
      issuer: 'Department of Home Affairs & State Police Authority',
      desc: 'Officially licensed under the Private Security Agencies Regulation Act, guaranteeing full legal validity and police-verified guard personnel.'
    },
    {
      title: 'ISO 9001:2015 Quality Management System',
      issuer: 'International Organization for Standardization',
      desc: 'Certified for consistent service delivery standards, internal quality audit frameworks, and customer satisfaction benchmarking.'
    },
    {
      title: 'Best Facility Management Partner – South Region',
      issuer: 'Commercial Real Estate & FM Industry Forum',
      desc: 'Recognized for outstanding multi-campus mechanized cleaning, zero downtime MEP technical operations, and digital attendance tracking.'
    },
    {
      title: '100% Statutory Compliance Excellence Award',
      issuer: 'Labor Welfare & EPF/ESI Audit Council',
      desc: 'Awarded for transparent employee welfare accounts, punctual EPF/ESI deposits, gratuity trust funding, and fair wage parity.'
    },
    {
      title: 'Green Cleaning & Environmental Sanitation Badge',
      issuer: 'Indian Green Building Council (IGBC)',
      desc: 'Recognizing Silver Star’s proactive use of eco-friendly cleaning chemicals, water-saving pressure washers, and waste segregation.'
    },
    {
      title: 'Excellence in Industrial Health & Safety (EHS)',
      issuer: 'Manufacturing Safety Consortium',
      desc: 'Celebrated for over 5 million operational hours without critical workplace incidents across manufacturing client sites.'
    }
  ];

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Accreditations & Industry Honors</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Awards and Recognitions
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Over a decade of industry-acknowledged compliance, quality stewardship, and human-centric facility management excellence.
          </p>
        </div>
      </section>

      {/* Awards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((a, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4 group hover:-translate-y-1 duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award size={26} />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#202B75] transition-colors">
                  {a.title}
                </h3>
                <p className="text-xs font-bold text-[#26BCEE] uppercase tracking-wider">
                  {a.issuer}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {a.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 size={14} />
                <span>Verified Active Certification</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-[#202B75] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Partner With a Proven Industry Leader</h3>
            <p className="text-xs text-white/80 max-w-lg">
              Avoid compliance liabilities and operational bottlenecks. Choose an award-winning partner for your facility.
            </p>
          </div>
          <button
            onClick={onOpenQuoteModal}
            className="px-6 py-3.5 bg-[#26BCEE] hover:bg-[#1fa8d6] text-[#202B75] text-xs font-black rounded-xl shadow-lg shrink-0 transition-all"
          >
            Request Official Accreditation Pack
          </button>
        </div>
      </section>
    </div>
  );
}
