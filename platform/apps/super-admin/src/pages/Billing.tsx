import { useState } from 'react'
import { CONTRACT_BILLINGS, CLIENTS } from '@mock/mockData'
import {
  Receipt, CheckCircle2, Clock, AlertTriangle, FileText, Download,
  Upload, Plus, Building2, Calendar, FileSpreadsheet, X, Check, ShieldCheck
} from 'lucide-react'

export default function Billing() {
  const [contracts, setContracts] = useState(CONTRACT_BILLINGS)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // GST Upload Form State
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const [invoiceNumber, setInvoiceNumber] = useState('SS-INV-2026-1101')
  const [taxableAmount, setTaxableAmount] = useState('380000')
  const [gstin, setGstin] = useState('29AABCS1429B1Z2')
  const [billingMonth, setBillingMonth] = useState('November 2026')
  const [uploadedFileName, setUploadedFileName] = useState('')

  // GST Invoices Record
  const [gstBills, setGstBills] = useState([
    {
      id: 'GST001',
      invoiceNo: 'SS-INV-2026-1001',
      clientId: 'CLI001',
      month: 'October 2026',
      taxable: 380000,
      cgst: 34200,
      sgst: 34200,
      total: 448400,
      status: 'Paid & Reconciled',
      filedDate: '2026-11-01',
    },
    {
      id: 'GST002',
      invoiceNo: 'SS-INV-2026-1002',
      clientId: 'CLI002',
      month: 'October 2026',
      taxable: 205800,
      cgst: 18522,
      sgst: 18522,
      total: 242844,
      status: 'Pending Client Payment',
      filedDate: '2026-11-01',
    },
    {
      id: 'GST003',
      invoiceNo: 'SS-INV-2026-1003',
      clientId: 'CLI003',
      month: 'October 2026',
      taxable: 195000,
      cgst: 17550,
      sgst: 17550,
      total: 230100,
      status: 'Paid & Reconciled',
      filedDate: '2026-11-01',
    },
  ])

  const getClient = (clientId: string) => CLIENTS.find(c => c.id === clientId)

  const handleUploadGST = (e: React.FormEvent) => {
    e.preventDefault()
    const client = CLIENTS.find(c => c.id === selectedClient)
    const base = Number(taxableAmount) || 0
    const taxEach = base * 0.09
    const total = base + (taxEach * 2)

    const newBill = {
      id: `GST00${gstBills.length + 1}`,
      invoiceNo: invoiceNumber,
      clientId: selectedClient,
      month: billingMonth,
      taxable: base,
      cgst: taxEach,
      sgst: taxEach,
      total,
      status: 'Uploaded (GST Portal Pending)' as const,
      filedDate: '2026-11-02',
    }

    setGstBills([newBill, ...gstBills])
    setFeedback(`GST Tax Invoice ${invoiceNumber} for ${client?.name} (Total: ₹${total.toLocaleString('en-IN')}) uploaded and recorded successfully!`)
    setIsUploadModalOpen(false)
    setTimeout(() => setFeedback(null), 4500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Billing, Contracts & GST Governance</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Attendance-backed billing milestones, statutory GST tax invoices, and client contract rate cards
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#202B75] text-white rounded-lg text-xs font-bold hover:bg-[#161f56] shadow-sm transition-all"
          >
            <Upload size={14} className="text-[#26BCEE]" /> Upload GST Bill
          </button>
          <button
            onClick={() => {
              setFeedback('Exporting unified GST & attendance billing ledger to Excel...')
              setTimeout(() => setFeedback(null), 3000)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-sm transition-all"
          >
            <FileSpreadsheet size={14} /> Export Billing Ledger
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline">Dismiss</button>
        </div>
      )}

      {/* Contract Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contracts.map(contract => {
          const client = getClient(contract.clientId)
          return (
            <div key={contract.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 hover:border-[#202B75]/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-gray-100 text-[#202B75] font-bold rounded">
                    {contract.contractNumber}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1.5 text-sm">{client?.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  contract.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  contract.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600'
                }`}>
                  {contract.status}
                </span>
              </div>

              <div className="space-y-2 py-2 border-y border-gray-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Billing:</span>
                  <span className="font-bold text-[#202B75]">₹{contract.monthlyAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Contract Value:</span>
                  <span className="font-medium text-gray-700">₹{contract.totalValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Validity Period:</span>
                  <span className="text-gray-600 font-mono text-[11px]">{contract.startDate} to {contract.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Schedule:</span>
                  <span className="text-emerald-700 font-bold">18% GST (CGST 9% + SGST 9%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  {contract.lastInvoiceStatus === 'Paid' ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Clock size={14} className="text-amber-500" />
                  )}
                  <span className="text-gray-600 font-medium">Last Invoice: <strong>{contract.lastInvoiceStatus}</strong></span>
                </div>
                <button
                  onClick={() => alert(`Demo: Downloading Tax Invoice PDF for ${contract.contractNumber}`)}
                  className="flex items-center gap-1 text-[11px] text-[#26BCEE] hover:underline font-bold"
                >
                  <Download size={12} /> Tax Invoice PDF
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* RECENT GST TAX INVOICES & UPLOADS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#202B75] flex items-center gap-2">
              <Receipt size={16} /> GST Tax Invoices & Uploaded Bills
            </h3>
            <p className="text-xs text-gray-400">Official GST portal e-invoices with HSN/SAC codes and tax splits</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#202B75] hover:text-[#161f56] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
          >
            <Upload size={13} /> + Upload GST Bill
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Invoice No.</th>
                <th className="px-4 py-3 text-left">Client Account</th>
                <th className="px-4 py-3 text-left">Billing Month</th>
                <th className="px-4 py-3 text-left">Taxable Base (₹)</th>
                <th className="px-4 py-3 text-left">CGST (9%)</th>
                <th className="px-4 py-3 text-left">SGST (9%)</th>
                <th className="px-4 py-3 text-left">Total Invoice (₹)</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gstBills.map(bill => {
                const client = CLIENTS.find(c => c.id === bill.clientId)
                return (
                  <tr key={bill.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{bill.invoiceNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{client?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">GSTIN: {client?.id}29AABCS</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{bill.month}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                      ₹{bill.taxable.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">₹{bill.cgst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">₹{bill.sgst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B75] text-sm">
                      ₹{bill.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        bill.status.includes('Paid')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => alert(`Demo: Downloading verified GST e-invoice for ${bill.invoiceNo}`)}
                        className="text-[#202B75] hover:underline font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Download size={12} /> GST PDF
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Calculation Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#202B75]">Attendance-Backed Automated Billing Inputs</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            All client invoices are calculated dynamically from geo-verified attendance punches, shift completions, and SLA coverage.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5 text-left">Client Account</th>
                <th className="px-4 py-2.5 text-left">Sites Active</th>
                <th className="px-4 py-2.5 text-left">Mandays Required</th>
                <th className="px-4 py-2.5 text-left">Mandays Delivered</th>
                <th className="px-4 py-2.5 text-left">SLA Penalty</th>
                <th className="px-4 py-2.5 text-left">Gross Invoice (INR ₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-semibold text-gray-900">InfoSys Tech Park</td>
                <td className="px-4 py-3 text-gray-600">2 Sites (Block A & B)</td>
                <td className="px-4 py-3 text-gray-600">600 Shifts</td>
                <td className="px-4 py-3 text-emerald-600 font-bold">596 Shifts (99.3%)</td>
                <td className="px-4 py-3 text-gray-400">₹0</td>
                <td className="px-4 py-3 font-bold text-[#202B75]">₹3,80,000</td>
              </tr>
              <tr className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-semibold text-gray-900">MedPlus Pharma Campus</td>
                <td className="px-4 py-3 text-gray-600">1 Site (Main Campus)</td>
                <td className="px-4 py-3 text-gray-600">300 Shifts</td>
                <td className="px-4 py-3 text-amber-600 font-bold">288 Shifts (96.0%)</td>
                <td className="px-4 py-3 text-red-600 font-semibold">-₹4,200</td>
                <td className="px-4 py-3 font-bold text-[#202B75]">₹2,05,800</td>
              </tr>
              <tr className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-semibold text-gray-900">DLF Corporate Tower</td>
                <td className="px-4 py-3 text-gray-600">1 Site (Zone 1)</td>
                <td className="px-4 py-3 text-gray-600">180 Shifts</td>
                <td className="px-4 py-3 text-emerald-600 font-bold">180 Shifts (100%)</td>
                <td className="px-4 py-3 text-gray-400">₹0</td>
                <td className="px-4 py-3 font-bold text-[#202B75]">₹1,95,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD GST BILL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadGST}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202B75]">Upload GST Tax Invoice / Bill</h3>
                <p className="text-xs text-gray-400">File client GST invoice with CGST/SGST breakdowns</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Client Organization *</label>
                <select
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                >
                  {CLIENTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">GST Invoice Number *</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Billing Month *</label>
                <input
                  type="text"
                  value={billingMonth}
                  onChange={e => setBillingMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Silver Star GSTIN *</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Taxable Base Amount (INR ₹) *</label>
                <input
                  type="number"
                  value={taxableAmount}
                  onChange={e => setTaxableAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              {/* GST Calculation Preview */}
              <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>CGST (9%):</span>
                  <span className="font-mono font-semibold">₹{(Number(taxableAmount || 0) * 0.09).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST (9%):</span>
                  <span className="font-mono font-semibold">₹{(Number(taxableAmount || 0) * 0.09).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#202B75] font-bold border-t pt-1 mt-1">
                  <span>Total Invoice Amount (INR ₹):</span>
                  <span className="font-mono text-sm">₹{(Number(taxableAmount || 0) * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Attach Signed GST Bill PDF / Scan *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#202B75] cursor-pointer bg-gray-50/50">
                  <Upload size={22} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-700 font-semibold">
                    {uploadedFileName || 'Click to select signed GST invoice PDF'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Supports PDF, JPG, PNG up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    id="superAdminGstInput"
                    onChange={e => setUploadedFileName(e.target.files?.[0]?.name || 'gst_tax_invoice.pdf')}
                  />
                  <label
                    htmlFor="superAdminGstInput"
                    className="inline-block mt-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  >
                    Browse Document
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#202B75] text-white rounded-lg text-xs font-bold hover:bg-[#161f56]"
              >
                Upload & Register GST Bill
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
