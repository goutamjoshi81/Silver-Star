import { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle2, ArrowRight, Building2, Factory,
  Briefcase, Wrench, ShieldCheck, Boxes, Coffee, Users,
  Phone, Check, Search, Filter
} from 'lucide-react';
import { api } from '@mock/mockData';

interface ServicesOfferedProps {
  onOpenQuoteModal: (serviceName?: string) => void;
}

export default function ServicesOffered({ onOpenQuoteModal }: ServicesOfferedProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filtered = services.filter(s => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Comprehensive Service Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Services Offered
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Silver Star Facility Management Pvt. Ltd is a leading facility management and services company offering a comprehensive range of services to clients across industries.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#202B75] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#202B75]"
            />
          </div>
        </div>
      </section>

      {/* Services List / Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#202B75]/20 border-t-[#202B75] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading live services from database...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filtered.map((service, idx) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md hover:shadow-xl transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="rounded-2xl overflow-hidden shadow-lg h-64 sm:h-72 bg-slate-100 relative group">
                    <img
                      src={service.imageUrl || 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#202B75] text-white">
                      {service.category}
                    </span>
                  </div>
                </div>

                <div className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {service.description || service.shortDescription}
                  </p>

                  {service.features && service.features.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Operational Scope & Deliverables:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {service.features.map((feat: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-[#26BCEE] shrink-0" />
                            <span className="font-medium truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      onClick={() => onOpenQuoteModal(service.title)}
                      className="px-5 py-3 rounded-xl bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-black shadow-md flex items-center gap-2 transition-all"
                    >
                      <span>Request Free Quote</span>
                      <ArrowRight size={14} />
                    </button>
                    <a
                      href="tel:08050000524"
                      className="text-xs font-bold text-[#202B75] hover:underline"
                    >
                      Call Regional Desk: +91 08050000524
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quote Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-gradient-to-r from-[#202B75] to-[#161f56] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Need a Customized Service Bundle?</h3>
            <p className="text-xs text-white/80 max-w-lg">
              We provide unified multi-service contracts combining security, housekeeping, and technical engineering with unified SLA accounting.
            </p>
          </div>
          <button
            onClick={() => onOpenQuoteModal('Integrated Facility Bundle')}
            className="px-6 py-3.5 bg-[#26BCEE] hover:bg-[#1fa8d6] text-[#202B75] text-xs font-black rounded-xl shadow-lg shrink-0 transition-all"
          >
            Request Multi-Facility Proposal
          </button>
        </div>
      </section>
    </div>
  );
}
