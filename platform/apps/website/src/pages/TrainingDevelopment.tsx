import { Sparkles, ShieldCheck, Award, CheckCircle2, ArrowRight, Flame, HeartPulse, UserCheck } from 'lucide-react';

interface TrainingDevelopmentProps {
  onOpenQuoteModal: () => void;
}

export default function TrainingDevelopment({ onOpenQuoteModal }: TrainingDevelopmentProps) {
  const pillars = [
    {
      num: '01',
      title: 'State-of-the-Art Training Center',
      desc: 'Our specialized training academies in Bengaluru and Noida NCR feature mock industrial gates, visitor management simulators, baggage scanner terminals, and physical endurance obstacles to prepare security guards before deployment.',
      highlights: [
        'Electronic gate access control simulation',
        'Visitor & vehicle inspection drills',
        'Physical fitness & self-defense training',
        'Uniform turnout, parade & drill etiquette'
      ]
    },
    {
      num: '02',
      title: 'Employee Skill Development',
      desc: 'Continuous capability upgrades for housekeepers, technical engineers, and supervisors. Focuses on specialized machine handling (ride-on scrubbers, high-pressure jet washers), infection control, bio-waste sorting, and soft skills.',
      highlights: [
        'Mechanized cleaning machinery certification',
        'Color-coded cross-contamination prevention',
        'Customer greeting, communication & etiquette',
        'Biometric & mobile GPS app operation'
      ]
    },
    {
      num: '03',
      title: 'Crisis Management & Fire Safety Drills',
      desc: 'Mandatory quarterly mock drills with building management and local fire departments. Every Silver Star staff member is trained to handle unexpected emergencies with calm efficiency and clear communication.',
      highlights: [
        'Live fire extinguisher handling (ABC & CO2)',
        'Building evacuation & panic management',
        'CPR & automated external defibrillator (AED)',
        'Earthquake, flood & bomb threat response protocols'
      ]
    }
  ];

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Capability Building</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Training & Development
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Excellence in frontline facility management begins with uncompromising training standards. We invest deeply in physical conditioning, safety certifications, and behavioral discipline.
          </p>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1 duration-300"
            >
              <div className="space-y-4">
                <span className="text-4xl font-black text-[#26BCEE] tracking-tight block">
                  {p.num}.
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-[#202B75] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {p.desc}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Core Curriculum:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {p.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#26BCEE] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Standards */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
            Certification Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Certified by PSARA & State Security Authorities
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our training syllabus rigorously follows the Private Security Agencies Regulation Act (PSARA). Every guard is issued a verified biometric smart ID card upon graduating with flying colors.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenQuoteModal}
              className="px-6 py-3.5 bg-[#202B75] text-white text-xs font-black rounded-xl shadow-md hover:bg-[#161f56] transition-all"
            >
              Request Trained Personnel Deployment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
