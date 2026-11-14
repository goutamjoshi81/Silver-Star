import { useState, useEffect } from 'react';
import { Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '@mock/mockData';

interface ClienteleProps {
  onOpenQuoteModal: () => void;
}

export default function Clientele({ onOpenQuoteModal }: ClienteleProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadClientele() {
      try {
        const data = await api.getWebsiteClientele();
        setClients(data || []);
      } catch (err) {
        console.error('Failed to load clientele:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClientele();
  }, []);

  const categories = ['All', ...Array.from(new Set(clients.map(c => c.category)))];

  const filtered = clients.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Enterprise Partnerships</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Clientele & Trusted Partners
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            We are proud to serve over 3,500+ corporate clients, IT technology parks, healthcare chains, residential societies, and logistics centers across India.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#202B75] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Logos Wall */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#202B75]/20 border-t-[#202B75] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading client portfolio from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-center text-center h-36 group hover:-translate-y-1 duration-300"
              >
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="max-h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/silverstar-icon-512.png';
                  }}
                />
                <span className="text-[11px] font-bold text-slate-700 mt-3 truncate w-full">
                  {client.name}
                </span>
                <span className="text-[9px] text-[#26BCEE] font-semibold mt-0.5 truncate w-full">
                  {client.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Testimonial Callout */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
            Client Assurance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            "99.8% On-Time Turnout & Zero Compliance Discrepancy"
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Our corporate clients rely on our 100% statutory adherence (EPF, ESI, minimum wages, gratuity) and GPS-verified digital roll-calls. With Silver Star, there are never phantom guards or surprise compliance fines.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenQuoteModal}
              className="px-6 py-3.5 bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-black rounded-xl shadow-md transition-all"
            >
              Join Our Corporate Client Network
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

