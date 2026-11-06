import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { AlertTriangle, PlusCircle, CheckCircle2, Clock, Filter, Search } from 'lucide-react';

export default function OpsMobileIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [siteId, setSiteId] = useState('');
  const [category, setCategory] = useState('Security');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getIncidents().catch(() => []),
      api.getSites().catch(() => []),
    ]).then(([incData, siteData]) => {
      setIncidents(incData || []);
      setSites(siteData || []);
      if (siteData && siteData.length > 0) setSiteId(siteData[0].id);
      setLoading(false);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !siteId) return;
    setSubmitting(true);
    try {
      await api.createIncident({
        title,
        siteId,
        category,
        priority,
        description,
        reportedBy: 'Operations Mobile User',
      });
      setTitle('');
      setDescription('');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#1A2B79]">Incidents & Safety Logs</h2>
          <p className="text-xs text-slate-500">Field security and safety escalation tickets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <PlusCircle size={14} /> Report Incident
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-2.5">
        {incidents.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
            No incidents reported. All sites operating smoothly!
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        inc.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : inc.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {inc.category || 'Security'}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 pt-0.5">{inc.title}</h3>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    inc.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {inc.status || 'Open'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {inc.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Site: {inc.siteName || sites.find((s) => s.id === inc.siteId)?.name || 'Campus'}</span>
                <span>{inc.reportedAt ? new Date(inc.reportedAt).toLocaleDateString() : 'Recent'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Report Site Incident</h3>
              <p className="text-xs text-slate-500">Log a security, safety, or facility issue</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken gate lock at Gate 2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Affected Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="Security">Security</option>
                    <option value="Safety">Safety</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what occurred, witnesses, and immediate action taken..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  {submitting ? 'Saving...' : 'Submit Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

