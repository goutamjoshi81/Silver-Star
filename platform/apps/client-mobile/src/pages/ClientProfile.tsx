import { CLIENTS, CONTRACT_BILLINGS, generateTaxInvoicePdf } from '@mock/mockData'
import { Building2, Mail, Phone, MapPin, Receipt, ShieldCheck, LogOut, Download } from 'lucide-react'

export default function ClientProfile({ onLogout }: { onLogout: () => void }) {
  const clientId = 'CLI001'
  const client = CLIENTS.find(c => c.id === clientId)
  const contract = CONTRACT_BILLINGS.find(c => c.clientId === clientId)

  return (
    <div className="p-4 space-y-4">
      {/* Account Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#202B75] text-white flex items-center justify-center font-bold text-lg mx-auto mb-2 shadow-md">
          {client?.name.slice(0, 2).toUpperCase()}
        </div>
        <h3 className="font-bold text-sm text-slate-900">{client?.name}</h3>
        <p className="text-[11px] text-[#26BCEE] font-medium">{client?.contactPerson} (Facility Director)</p>
        <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          Active Corporate Client
        </span>
      </div>

      {/* Contract & Billing Overview */}
      {contract && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#202B75] uppercase tracking-wider">
            <Receipt size={14} />
            <span>Contract & Billing Summary</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Contract Number:</span>
              <span className="font-mono font-semibold text-slate-800">{contract.contractNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Monthly Billing:</span>
              <span className="font-bold text-[#202B75]">₹{contract.monthlyAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Contract Period:</span>
              <span className="text-slate-700">{contract.startDate} to {contract.endDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Invoice:</span>
              <span className="font-semibold text-emerald-600">₹{contract.monthlyAmount.toLocaleString('en-IN')} (Paid)</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (contract) {
                generateTaxInvoicePdf({
                  invoiceNumber: `SS-INV-${contract.contractNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
                  invoiceDate: contract.lastInvoiceDate || new Date().toISOString().split('T')[0],
                  dueDate: contract.endDate,
                  clientName: client?.name || 'Infosys Tech Park',
                  clientAddress: client?.address || 'Electronic City Phase 1, Bengaluru',
                  subtotal: Number(contract.monthlyAmount) || 485000,
                  serviceDescription: 'Integrated Facility Services, Physical Guarding & Corporate Housekeeping',
                })
              }
            }}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download size={13} /> Download Latest Tax Invoice
          </button>
        </div>
      )}

      {/* Client Contact Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 text-xs">
        <h4 className="font-bold text-xs text-slate-900 mb-2">Registered Corporate Details</h4>
        <div className="flex items-center gap-2 text-slate-600">
          <Mail size={13} className="text-slate-400" />
          <span>{client?.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone size={13} className="text-slate-400" />
          <span>{client?.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={13} className="text-slate-400" />
          <span>{client?.address}</span>
        </div>
      </div>

      {/* Security & Logout */}
      <div className="space-y-2">
        <button
          onClick={() => alert('Demo: Security settings modal')}
          className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Change Access Password
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
        >
          <LogOut size={13} /> Secure Client Logout
        </button>
      </div>
    </div>
  )
}

