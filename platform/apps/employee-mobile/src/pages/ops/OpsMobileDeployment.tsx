import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { Users, UserPlus, Trash2, Building, Clock, Search, CheckCircle2 } from 'lucide-react';

export default function OpsMobileDeployment() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedShift, setSelectedShift] = useState('SHF001');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getDeployments().catch(() => []),
      api.getEmployees().catch(() => []),
      api.getSites().catch(() => []),
    ]).then(([deps, emps, sts]) => {
      setDeployments(deps || []);
      setEmployees(emps || []);
      setSites(sts || []);
      if (emps && emps.length > 0) setSelectedEmp(emps[0].id);
      if (sts && sts.length > 0) setSelectedSite(sts[0].id);
      setLoading(false);
    });
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !selectedSite) return;
    setSubmitting(true);
    try {
      const siteObj = sites.find((s) => s.id === selectedSite);
      await api.createDeployment({
        employeeId: selectedEmp,
        siteId: selectedSite,
        clientId: siteObj?.clientId || 'CLI001',
        shiftId: selectedShift,
        startDate: new Date().toISOString().split('T')[0],
        deployedBy: 'Operations Mobile',
      });
      setShowDeployModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error deploying staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelieve = async (id: string) => {
    if (!confirm('Are you sure you want to relieve this staff member from site?')) return;
    try {
      await api.relieveDeployment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error relieving deployment');
    }
  };

  const filtered = deployments.filter(
    (d) =>
      (d.employeeName && d.employeeName.toLowerCase().includes(search.toLowerCase())) ||
      (d.employeeCode && d.employeeCode.toLowerCase().includes(search.toLowerCase())) ||
      (d.siteName && d.siteName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#1A2B79]">Workforce Deployments</h2>
          <p className="text-xs text-slate-500">Live staff allocations across client sites</p>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <UserPlus size={14} /> Deploy Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deployed guard or site..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1A2B79]"
        />
        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
      </div>

      {/* Deployment Cards List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
            No active deployments matching search.
          </div>
        ) : (
          filtered.map((dep) => (
            <div
              key={dep.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">
                    {dep.employeeName || dep.name || 'Guard'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {dep.employeeCode || dep.id} · {dep.designationName || 'Security Staff'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {dep.status || 'Active'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building size={12} className="text-[#1A2B79]" />
                  <span className="font-semibold">{dep.siteName || 'Assigned Site'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {dep.shiftName || 'Morning Shift'}
                  </span>
                  <span>Since: {dep.startDate || 'Recent'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleRelieve(dep.id)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Trash2 size={11} /> Relieve from Site
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deploy Staff Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Deploy Staff to Site</h3>
              <p className="text-xs text-slate-500">Assign employee to active client facility</p>
            </div>

            <form onSubmit={handleDeploy} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#1A2B79]"
                  required
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Client Site</label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#1A2B79]"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.geofenceRadius || 150}m radius)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Shift</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="SHF001">Morning Shift (06:00 - 14:00)</option>
                  <option value="SHF002">Day Shift (09:00 - 18:00)</option>
                  <option value="SHF003">Evening Shift (14:00 - 22:00)</option>
                  <option value="SHF004">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl font-bold"
                >
                  {submitting ? 'Saving...' : 'Confirm Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

