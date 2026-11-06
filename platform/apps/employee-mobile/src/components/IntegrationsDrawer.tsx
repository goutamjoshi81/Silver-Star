import { useState } from 'react';
import { X, Key, CheckCircle2, Clock, Globe, Bell, Shield, Database, Smartphone, ExternalLink } from 'lucide-react';
import { getServiceHealth, THIRD_PARTY_CONFIG } from '@mock/mockData';

interface IntegrationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegrationsDrawer({ isOpen, onClose }: IntegrationsDrawerProps) {
  if (!isOpen) return null;

  const services = getServiceHealth();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A2B79] to-[#121c4e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">3rd-Party Integrations & Services</h2>
              <p className="text-[10px] text-cyan-200">Production API keys, geofencing & cloud services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 text-[11px] text-blue-900 leading-relaxed">
            <strong>Ready for Deployment:</strong> All services are currently functioning using zero-cost dev defaults (OpenStreetMap tiles, device GPS, PostgreSQL local storage). When you are ready to plug in your production API keys, they will activate instantly without any code rewrite.
          </div>

          <div className="space-y-2.5">
            {services.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.service}</span>
                  </div>
                  {item.status === 'active' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                  {item.status === 'fallback_active' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      <Globe size={11} /> Open-Source Live
                    </span>
                  )}
                  {item.status === 'ready_for_key' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Clock size={11} /> Ready for Key
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-mono">Provider: {item.provider}</p>
                <p className="text-[11px] text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Environment Variables Guide */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-[10px] space-y-1.5 border border-slate-800">
            <p className="text-cyan-400 font-bold"># Environment Keys Location (.env)</p>
            <p className="text-slate-400">VITE_GOOGLE_MAPS_API_KEY=AIzaSy...</p>
            <p className="text-slate-400">VITE_FIREBASE_PROJECT_ID=silver-star-fm</p>
            <p className="text-slate-400">VITE_AWS_S3_BUCKET=silverstar-assets</p>
            <p className="text-slate-400">VITE_AWS_REGION=ap-south-1</p>
            <p className="text-slate-400">VITE_SMS_SENDER_ID=SLVSTR</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white font-bold rounded-xl text-xs transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
}

