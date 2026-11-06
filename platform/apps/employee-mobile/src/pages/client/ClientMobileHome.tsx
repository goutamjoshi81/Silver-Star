import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { Users, UserCheck, UserX, Building, Clock, ChevronRight, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface ClientMobileHomeProps {
  currentUser?: any;
  onNavigateTab: (tab: string) => void;
}

export default function ClientMobileHome({ currentUser, onNavigateTab }: ClientMobileHomeProps) {
  const [client, setClient] = useState<any>(currentUser || null);
  const [sites, setSites] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const targetClientId = currentUser?.clientId || currentUser?.id || 'CLI001';
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      api.getClients().catch(() => []),
      api.getSites(targetClientId).catch(() => []),
      api.getDeployments({ clientId: targetClientId }).catch(() => []),
      api.getAttendance({ clientId: targetClientId, date: today }).catch(() => []),
    ]).then(([clientsData, sitesData, depData, attData]) => {
      if (!isMounted) return;
      const foundClient = (clientsData || []).find((c: any) => c.id === targetClientId) || currentUser;
      setClient(foundClient);
      setSites(sitesData || []);
      setDeployments(depData || []);
      setAttendance(attData || []);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [currentUser]);

  const presentCount = attendance.filter((a) => a.punchIn).length;
  const totalDeployed = deployments.length || 4;
  const absentCount = Math.max(0, totalDeployed - presentCount);

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#1A2B79] via-[#162363] to-[#0E163D] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Corporate Client Portal
          </span>
          <span className="text-[10px] text-white/70 font-mono">
            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-base font-black text-white">
            {client?.name || client?.clientName || 'Infosys Tech Park'}
          </h2>
          <p className="text-xs text-cyan-200/90 font-medium">
            Contact Person: {client?.contactPerson || client?.contact_person || 'Estate Directorate'}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 text-[11px] text-emerald-300 font-bold">
          <CheckCircle2 size={13} />
          <span>Active Contract · SLA Guaranteed Compliance</span>
        </div>
      </div>

      {/* 4-Stat Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => onNavigateTab('client-deployment')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#1A2B79] transition-all space-y-1"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A2B79] flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="text-xl font-black text-[#1A2B79]">{totalDeployed}</div>
          <p className="text-xs font-bold text-slate-800">Deployed Staff</p>
          <p className="text-[10px] text-slate-400">Security & Housekeeping</p>
        </div>

        <div
          onClick={() => onNavigateTab('client-attendance')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#1A2B79] transition-all space-y-1"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={16} />
          </div>
          <div className="text-xl font-black text-emerald-600">{presentCount}</div>
          <p className="text-xs font-bold text-slate-800">Present Today</p>
          <p className="text-[10px] text-emerald-600 font-bold">
            {Math.round((presentCount / (totalDeployed || 1)) * 100)}% Live Coverage
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('client-attendance')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#1A2B79] transition-all space-y-1"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserX size={16} />
          </div>
          <div className="text-xl font-black text-amber-600">{absentCount}</div>
          <p className="text-xs font-bold text-slate-800">Relief / Absent</p>
          <p className="text-[10px] text-slate-400">Buffer staff on standby</p>
        </div>

        <div
          onClick={() => onNavigateTab('client-sites')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#1A2B79] transition-all space-y-1"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <Building size={16} />
          </div>
          <div className="text-xl font-black text-[#1A2B79]">{sites.length || 2}</div>
          <p className="text-xs font-bold text-slate-800">Active Campuses</p>
          <p className="text-[10px] text-slate-400">GPS Geofenced</p>
        </div>
      </div>

      {/* Deployed Workforce Preview */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Users size={14} className="text-[#1A2B79]" />
            <span>Assigned Security & Staff</span>
          </div>
          <button
            onClick={() => onNavigateTab('client-deployment')}
            className="text-[11px] font-bold text-[#1A2B79] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {deployments.slice(0, 3).map((dep) => (
            <div
              key={dep.id}
              className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{dep.employeeName || dep.name || 'Security Officer'}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {dep.employeeCode || dep.id} · {dep.designationName || 'Security Guard'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <ShieldCheck size={10} /> Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Contact Desk */}
      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 text-xs flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-800 block">Dedicated Operations Desk</span>
          <span className="text-[10px] text-slate-500">24/7 client helpline & emergency relief</span>
        </div>
        <a
          href="tel:+918041234567"
          className="px-3.5 py-2 bg-[#1A2B79] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#14215e] transition-colors"
        >
          Call Ops
        </a>
      </div>

    </div>
  );
}
