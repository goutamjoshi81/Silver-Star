import { useState, useEffect } from 'react';
import { api } from '@mock/mockData';
import { FileText, PlusCircle, CheckCircle2, Clock, Calendar, Building } from 'lucide-react';

export default function OpsMobileDWR() {
  const [reports, setReports] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [siteId, setSiteId] = useState('');
  const [summary, setSummary] = useState('');
  const [consumables, setConsumables] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getDailyReports().catch(() => []),
      api.getSites().catch(() => []),
    ]).then(([repData, siteData]) => {
      setReports(repData || []);
      setSites(siteData || []);
      if (siteData && siteData.length > 0) setSiteId(siteData[0].id);
      setLoading(false);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !siteId) return;
    setSubmitting(true);
    try {
      await api.createDailyReport({
        siteId,
        date: new Date().toISOString().split('T')[0],
        summary,
        consumables,
        status: 'Approved',
      });
      setSummary('');
      setConsumables('');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#1A2B79]">Daily Work Reports</h2>
          <p className="text-xs text-slate-500">Site maintenance & shift logs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <PlusCircle size={14} /> Submit DWR
        </button>
      </div>

      {/* DWR List */}
      <div className="space-y-2.5">
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-100">
            No daily work reports logged yet.
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Building size={13} className="text-[#1A2B79]" />
                    {rep.siteName || sites.find((s) => s.id === rep.siteId)?.name || 'Campus'}
                  </h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={11} /> {rep.date ? new Date(rep.date).toLocaleDateString() : 'Today'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  {rep.status || 'Approved'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                <p className="text-slate-700 font-medium">{rep.summary}</p>
                {rep.consumables && (
                  <p className="text-slate-500 text-[10px]">
                    <strong>Consumables:</strong> {rep.consumables}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Submit Daily Work Report</h3>
              <p className="text-xs text-slate-500">Log site progress, headcount & supplies</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Site</label>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duty & Work Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Summary of patrolling, gate operations, maintenance tasks..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#1A2B79]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Consumables / Supplies (Optional)</label>
                <input
                  type="text"
                  value={consumables}
                  onChange={(e) => setConsumables(e.target.value)}
                  placeholder="e.g. 5x Sanitizer, 2x Torch batteries"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
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
                  className="px-4 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl font-bold"
                >
                  {submitting ? 'Saving...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

