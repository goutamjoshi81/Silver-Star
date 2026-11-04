import { useState, useEffect } from 'react'
import { DEPARTMENTS, DESIGNATIONS, SITES, api } from '@mock/mockData'
import {
  CheckCircle2, Clock, XCircle, Eye, ShieldCheck,
  AlertCircle, ExternalLink, Filter
} from 'lucide-react'

export default function Onboarding() {
  const [employeeList, setEmployeeList] = useState<any[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEmployees()
      .then(setEmployeeList)
      .catch(err => console.error('Error fetching employees:', err))
      .finally(() => setLoading(false))
  }, [])

  const pending = employeeList.filter(e => e.onboardingStatus === 'Pending')
  const approved = employeeList.filter(e => e.onboardingStatus === 'Approved')
  const rejected = employeeList.filter(e => e.onboardingStatus === 'Rejected')

  const filteredList = statusFilter === 'all'
    ? employeeList
    : employeeList.filter(e => e.onboardingStatus.toLowerCase() === statusFilter)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#202B75]">
            Employee Onboarding & Verification Status (Audit & Governance)
          </h2>
          <p className="text-xs text-gray-500">
            Executive oversight of candidate pipelines, KYC verification rates, and compliance handovers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-blue-50 text-[#202B75] border border-blue-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#26BCEE]" />
            Managed by HR Department
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`bg-white rounded-xl border p-4 flex items-center gap-4 cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'border-amber-400 ring-2 ring-amber-100 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
            <p className="text-xs text-gray-500 font-medium">Pending HR Verification</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">eKYC & Document Review</p>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
          className={`bg-white rounded-xl border p-4 flex items-center gap-4 cursor-pointer transition-all ${
            statusFilter === 'approved' ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{approved.length}</p>
            <p className="text-xs text-gray-500 font-medium">Approved & Deployed</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active on Operations Roster</p>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
          className={`bg-white rounded-xl border p-4 flex items-center gap-4 cursor-pointer transition-all ${
            statusFilter === 'rejected' ? 'border-rose-400 ring-2 ring-rose-100 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{rejected.length}</p>
            <p className="text-xs text-gray-500 font-medium">Rejected / Non-Compliant</p>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Failed Audit Verification</p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle size={15} className="text-[#202B75]" />
          <span>
            Candidate registration, document upload, and eKYC execution are performed exclusively by the <strong>HR Management Panel</strong>. Super Admin retains read-only audit oversight.
          </span>
        </div>
        <a
          href="http://localhost:5174/onboarding"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#26BCEE] font-bold hover:underline flex items-center gap-1 flex-shrink-0 ml-3"
        >
          Open HR Panel <ExternalLink size={12} />
        </a>
      </div>

      {/* Candidate Status Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xs font-bold text-[#202B75] uppercase tracking-wider">
            Workforce Onboarding Audit Ledger
          </h3>
          <span className="text-xs text-gray-400">
            Showing {filteredList.length} of {employeeList.length} Employees
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Employee / Code</th>
                <th className="px-4 py-3 text-left">Department & Role</th>
                <th className="px-4 py-3 text-left">Date of Joining</th>
                <th className="px-4 py-3 text-left">eKYC Method</th>
                <th className="px-4 py-3 text-left">Verification Status</th>
                <th className="px-4 py-3 text-left">Assigned Site</th>
                <th className="px-4 py-3 text-left">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredList.map((emp) => {
                const isApproved = emp.onboardingStatus === 'Approved'
                const isPending = emp.onboardingStatus === 'Pending'
                const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
                const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
                const site = SITES.find(s => s.id === emp.deployedSiteId)

                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{emp.name}</p>
                      <p className="font-mono text-[10px] text-[#26BCEE] font-semibold">{emp.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{dept?.name}</p>
                      <p className="text-[10px] text-gray-400">{desig?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {emp.joiningDate}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.kycMethod || <span className="text-gray-400 italic">Pending Upload</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {emp.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 font-medium">
                        {site ? site.name : <em className="text-gray-400">Awaiting Ops Handover</em>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedCandidate(emp)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-medium flex items-center gap-1"
                      >
                        <Eye size={12} /> View Profile
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Profile Audit Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#202B75]">{selectedCandidate.name}</h3>
                <p className="text-xs text-[#26BCEE] font-mono">{selectedCandidate.employeeCode} · Compliance File</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-gray-400">DOB:</span> <strong className="text-gray-800">{selectedCandidate.dob}</strong></div>
              <div><span className="text-gray-400">Blood Group:</span> <strong className="text-red-600">{selectedCandidate.bloodGroup}</strong></div>
              <div><span className="text-gray-400">Phone:</span> <strong className="text-gray-800">{selectedCandidate.phone}</strong></div>
              <div><span className="text-gray-400">Joining Date:</span> <strong className="text-gray-800">{selectedCandidate.joiningDate}</strong></div>
              <div><span className="text-gray-400">KYC Status:</span> <strong className="text-emerald-700">{selectedCandidate.kycStatus} ({selectedCandidate.kycMethod || 'Pending'})</strong></div>
              <div><span className="text-gray-400">Bank:</span> <strong className="text-gray-800">{selectedCandidate.bankName}</strong></div>
              <div className="col-span-2"><span className="text-gray-400">Current Address:</span> <p className="text-gray-700 mt-0.5">{selectedCandidate.address}</p></div>
              <div className="col-span-2"><span className="text-gray-400">Emergency Kin:</span> <p className="text-gray-700 mt-0.5">{selectedCandidate.emergencyContact.name} ({selectedCandidate.emergencyContact.relation}) - {selectedCandidate.emergencyContact.phone}</p></div>
            </div>

            <button
              onClick={() => setSelectedCandidate(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
