import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { Users, Search, Building, ShieldCheck, Clock, Phone } from 'lucide-react';

interface ClientMobileDeploymentProps {
  currentUser?: any;
}

export default function ClientMobileDeployment({ currentUser }: ClientMobileDeploymentProps) {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const targetClientId = currentUser?.clientId || currentUser?.id || 'CLI001';

    api.getDeployments({ clientId: targetClientId })
      .then((data) => {
        if (!isMounted) return;
        setDeployments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => { isMounted = false; };
  }, [currentUser]);

  const filtered = deployments.filter(
    (d) =>
      (d.employeeName && d.employeeName.toLowerCase().includes(search.toLowerCase())) ||
      (d.employeeCode && d.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
      (d.siteName && d.siteName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div>
        <h2 className="text-base font-black text-[#1A2B79]">Deployed Workforce</h2>
        <p className="text-xs text-slate-500">Security & facility personnel stationed at your premises</p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search personnel by name or badge ID..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#1A2B79]"
        />
        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
      </div>

      {/* Staff Cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
            No deployed personnel matching your search.
          </div>
        ) : (
          filtered.map((dep) => (
            <div
              key={dep.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1A2B79] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                  {dep.employeePhoto ? (
                    <img src={dep.employeePhoto} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    (dep.employeeName || dep.name || 'SS').slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 truncate">
                      {dep.employeeName || dep.name}
                    </h3>
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {dep.employeeCode || dep.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A2B79] font-semibold mt-0.5">
                    {dep.designationName || 'Security Guard'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building size={11} className="text-[#1A2B79]" />
                  <span className="font-semibold">{dep.siteName || 'Campus Main Gate'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={11} /> {dep.shiftName || 'Morning Shift'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                    <ShieldCheck size={11} /> PSARA Certified
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
