import { X, Shield, Users, Briefcase, Building, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PortalLoginModal({ isOpen, onClose }: PortalLoginModalProps) {
  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const portals = [
    {
      title: 'Super Admin Portal',
      desc: 'Centralized executive control, user roles, billing & master configuration',
      icon: Shield,
      url: `http://${currentHost}:5173`,
      color: 'bg-blue-600',
      badge: 'Port :5173'
    },
    {
      title: 'HR & Personnel Panel',
      desc: 'Employee master, digital onboarding, KYC verification & smart ID cards',
      icon: Users,
      url: `http://${currentHost}:5174`,
      color: 'bg-indigo-600',
      badge: 'Port :5174'
    },
    {
      title: 'Operations & Muster Console',
      desc: 'Site rosters, geofenced deployment, night patrol dispatches & incident logs',
      icon: Briefcase,
      url: `http://${currentHost}:5175`,
      color: 'bg-cyan-600',
      badge: 'Port :5175'
    },
    {
      title: 'Corporate Client Portal',
      desc: 'Live deployed guard strength, attendance musters & billing statements',
      icon: Building,
      url: `http://${currentHost}:5176`,
      color: 'bg-emerald-600',
      badge: 'Port :5176'
    },
    {
      title: 'Field Officer & Guard Mobile',
      desc: 'Geofenced shift punch-in, frontline roll-call audits & night patrol photo logs',
      icon: Smartphone,
      url: `http://${currentHost}:5177`,
      color: 'bg-purple-600',
      badge: 'Port :5177'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-blue-50 text-[#202B75] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Shield size={26} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Silver Star Platform Sign-In
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose your authorized operational interface to access live operations, employee registries, or client musters.
          </p>
        </div>

        <div className="space-y-3">
          {portals.map((p, idx) => {
            const Icon = p.icon;
            return (
              <a
                key={idx}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/90 hover:border-[#202B75] hover:bg-blue-50/40 transition-all shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl ${p.color} text-white flex items-center justify-center shrink-0 shadow`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#202B75] transition-colors">
                        {p.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{p.desc}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#202B75] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0 ml-2">
                  <ArrowRight size={15} />
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Enterprise Multi-Tenant Security</span>
          <span className="font-semibold text-[#202B75]">Silver Star Digital Suite v2.0</span>
        </div>
      </div>
    </div>
  );
}

