import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import {
  Building, Users, ShieldCheck, AlertTriangle, FileText,
  Clock, MapPin, ChevronRight, PlusCircle, CheckCircle2, TrendingUp
} from 'lucide-react';

interface OpsMobileHomeProps {
  onNavigateTab: (tab: string) => void;
  currentUser?: any;
}

export default function OpsMobileHome({ onNavigateTab, currentUser }: OpsMobileHomeProps) {
  const [kpis, setKpis] = useState<any>({
    totalEmployees: 0,
    deployedCount: 0,
    presentToday: 0,
    activeSites: 0,
    activeClients: 0,
    openIncidents: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getKpis().catch(() => ({})),
      api.getIncidents({ status: 'Open' }).catch(() => []),
    ]).then(([kpiData, incData]) => {
      if (!isMounted) return;
      setKpis(kpiData || {});
      setRecentIncidents(incData || []);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      
      {/* Top Operations Header */}
      <div className="bg-gradient-to-r from-[#1A2B79] via-[#152362] to-[#0D153B] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Operations Management Console
          </span>
          <span className="text-[10px] text-white/70 font-mono">
            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-lg font-black text-white">
            {currentUser?.name || 'Operations Executive'}
          </h2>
          <p className="text-xs text-cyan-200/90 font-medium">
            24/7 Field Workforce & Geofence Governance
          </p>
        </div>

        {/* Live Headcount Quick Stats Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-white/70 block">Active Sites</span>
            <span className="text-base font-black text-white">{kpis.activeSites || 4}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/70 block">Deployed Staff</span>
            <span className="text-base font-black text-cyan-300">{kpis.deployedCount || 4}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/70 block">Present Today</span>
            <span className="text-base font-black text-emerald-300">{kpis.presentToday || 3}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <button
          onClick={() => onNavigateTab('ops-deployment')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#1A2B79] text-left space-y-1.5 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users size={16} />
          </div>
          <span className="font-bold text-slate-900 block">Deploy Staff</span>
          <span className="text-[10px] text-slate-500 block leading-tight">Assign staff to client sites & shifts</span>
        </button>

        <button
          onClick={() => onNavigateTab('ops-sites')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#1A2B79] text-left space-y-1.5 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <MapPin size={16} />
          </div>
          <span className="font-bold text-slate-900 block">Sites & Geofence</span>
          <span className="text-[10px] text-slate-500 block leading-tight">Map boundaries & coordinates</span>
        </button>

        <button
          onClick={() => onNavigateTab('ops-attendance')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#1A2B79] text-left space-y-1.5 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <span className="font-bold text-slate-900 block">Attendance Monitor</span>
          <span className="text-[10px] text-slate-500 block leading-tight">Live punch-ins & geo-stamps</span>
        </button>

        <button
          onClick={() => onNavigateTab('ops-incidents')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-[#1A2B79] text-left space-y-1.5 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <span className="font-bold text-slate-900 block">Incidents & Safety</span>
          <span className="text-[10px] text-slate-500 block leading-tight">Log accidents & field alerts</span>
        </button>
      </div>

      {/* Operational Highlights & DWR Summary */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <FileText size={14} className="text-[#1A2B79]" />
            <span>Daily Work Reports (DWR)</span>
          </div>
          <button
            onClick={() => onNavigateTab('ops-dwr')}
            className="text-[11px] font-bold text-[#1A2B79] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Supervisors submit site handovers, consumables usage, and shift logs. Review and approve directly from mobile.
        </p>

        <button
          onClick={() => onNavigateTab('ops-dwr')}
          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <PlusCircle size={14} /> Submit Daily Work Report
        </button>
      </div>

      {/* Open Incidents Alert Banner */}
      {recentIncidents.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-900 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600" /> Open Field Incidents ({recentIncidents.length})
            </span>
            <button onClick={() => onNavigateTab('ops-incidents')} className="text-[10px] text-amber-800 underline">
              Inspect
            </button>
          </div>
          <div className="space-y-1">
            {recentIncidents.slice(0, 2).map((inc: any) => (
              <div key={inc.id} className="text-[11px] text-amber-800 truncate">
                • <strong>{inc.title}</strong> - {inc.priority} Priority
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
