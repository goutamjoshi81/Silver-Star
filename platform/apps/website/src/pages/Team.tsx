import { useState, useEffect } from 'react';
import { Sparkles, Users, Mail, Phone, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '@mock/mockData';

interface TeamProps {
  onOpenQuoteModal: () => void;
}

export default function Team({ onOpenQuoteModal }: TeamProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await api.getTeam();
        setTeam(data || []);
      } catch (err) {
        console.error('Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Executive Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Our Management Team
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            The seasoned leadership guiding Silver Star Facility Management Pvt. Ltd with integrity, innovation, and an unwavering commitment to operational excellence.
          </p>
        </div>
      </section>

      {/* Leadership Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#202B75]/20 border-t-[#202B75] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading leadership team from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all group flex flex-col hover:-translate-y-1 duration-300"
              >
                <div className="relative h-80 bg-slate-100 overflow-hidden">
                  <img
                    src={member.photoUrl || 'https://silverstarindia.net/wp-content/uploads/2024/08/tm2.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://silverstarindia.net/wp-content/uploads/2024/08/tm2.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <span className="text-[10px] font-bold text-[#26BCEE] uppercase tracking-wider mb-1 block">
                      {member.department || 'Executive'}
                    </span>
                    <h3 className="text-xl font-black">{member.name}</h3>
                    <p className="text-xs text-white/90 font-medium">{member.role}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {member.bio ||
                      'Executive management leading strategic growth, frontline operations, and statutory compliance across pan-India accounts.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-1.5 hover:text-[#202B75] transition-colors truncate"
                      >
                        <Mail size={13} className="text-[#202B75]" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-1.5 hover:text-[#202B75] transition-colors shrink-0"
                      >
                        <Phone size={13} className="text-[#202B75]" />
                        <span>Direct</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Corporate Philosophy */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
            Founder's Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            "Your True Business Partners in Growth & Safety"
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            At Silver Star, our leadership believes that effective facility management is built on human dignity, rigorous field inspection, and unwavering honesty. Every guard on duty, every technician at the generator, and every housekeeper on the floor represents our promise of uncompromised service quality.
          </p>
        </div>
      </section>
    </div>
  );
}
