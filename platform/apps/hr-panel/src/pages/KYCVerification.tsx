import { useState } from 'react'
import { EMPLOYEES } from '@mock/mockData'
import { ShieldCheck, AlertCircle, Eye, X, QrCode, Check } from 'lucide-react'

export default function KYCVerification() {
  const [selected, setSelected] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const emp = EMPLOYEES.find(e => e.id === selected)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanned(true) }, 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#202B75]">Digital eKYC Verification</h2>
        <p className="text-xs text-gray-500">Aadhaar Secure QR offline scan · DigiLocker vault · Manual verification</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">DEMO MODE — eKYC Simulation Only</p>
          <p className="mt-0.5 leading-relaxed">No real Aadhaar numbers are processed. QR scan is simulated. Full Aadhaar numbers are never stored per UIDAI guidelines.</p>
        </div>
      </div>

      {/* KYC Queue */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-[#202B75]">KYC Verification Queue</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {EMPLOYEES.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.employeeCode}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {emp.kycStatus === 'Verified'
                      ? <ShieldCheck size={14} className="text-emerald-500" />
                      : <AlertCircle size={14} className="text-amber-500" />
                    }
                    <span className={`text-xs font-medium ${emp.kycStatus === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {emp.kycStatus}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{emp.kycMethod || '—'}</td>
                <td className="px-4 py-3">
                  {emp.kycStatus === 'Pending' ? (
                    <button onClick={() => { setSelected(emp.id); setScanned(false) }}
                      className="text-xs px-3 py-1.5 bg-[#202B75] text-white rounded-lg hover:bg-[#161f56] transition-colors font-semibold">
                      Start eKYC
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> Verified
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KYC Modal */}
      {emp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#202B75]">eKYC — {emp.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                DEMO: Simulated Aadhaar Secure QR offline scan. No real identity data processed.
              </div>

              {!scanned ? (
                <div className="text-center space-y-4">
                  <div className={`w-32 h-32 mx-auto border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${scanning ? 'border-[#26BCEE] bg-[#26BCEE]/10 animate-pulse' : 'border-gray-300 bg-gray-50'}`}>
                    <QrCode className={`w-16 h-16 ${scanning ? 'text-[#26BCEE]' : 'text-gray-300'}`} />
                  </div>
                  <p className="text-sm text-gray-600">{scanning ? 'Scanning Aadhaar Secure QR...' : 'Ask employee to display QR from mAadhaar app'}</p>
                  <button onClick={handleScan} disabled={scanning}
                    className="w-full bg-[#202B75] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 hover:bg-[#161f56] transition-colors">
                    {scanning ? 'Verifying...' : 'Scan QR Code'}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">KYC Verified</p>
                    <p className="text-sm text-gray-500">Identity confirmed via Aadhaar Secure QR (Offline)</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-left space-y-1">
                    <p className="text-gray-600">Name matched: <span className="font-semibold text-gray-900">{emp.name}</span></p>
                    <p className="text-gray-600">DOB matched: <span className="font-semibold text-gray-900">{emp.dob}</span></p>
                    <p className="text-gray-600">Aadhaar last 4: <span className="font-semibold font-mono text-gray-900">••••</span></p>
                    <p className="text-gray-600">Method: <span className="font-semibold text-gray-900">Aadhaar Secure QR (Offline)</span></p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors">
                    Confirm & Mark Verified
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

