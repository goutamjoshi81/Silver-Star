import { useState } from 'react'
import { EMPLOYEES, DEPARTMENTS, DESIGNATIONS, SITES } from '@mock/mockData'
import { Link } from 'react-router-dom'
import { Plus, Eye, Clock, CheckCircle2, Play, UserCheck, ShieldCheck } from 'lucide-react'
import OnboardingWizard from '../components/OnboardingWizard'

export default function EmployeeOnboarding() {
  const [employeeList, setEmployeeList] = useState(EMPLOYEES)
  const [showWizard, setShowWizard] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleWizardSuccess = (newEmp: any) => {
    setShowWizard(false)
    setEmployeeList([newEmp, ...employeeList])
    setSuccessToast(`HR Handover Complete: ${newEmp.name} (${newEmp.employeeCode}) dispatched to Operations!`)
    setTimeout(() => setSuccessToast(null), 6000)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#202B75]">Employee Onboarding Pipeline (HR)</h2>
          <p className="text-xs text-gray-500">9-step digital onboarding: Registration → Verification → Ops Handover</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-[#202B75] text-white text-xs px-4 py-2.5 rounded-lg hover:bg-[#161f56] transition-colors font-semibold shadow-md shadow-[#202B75]/20"
        >
          <Plus size={14} className="text-[#26BCEE]" /> + Launch 9-Step Onboarding Wizard
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Pipeline stages visual */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Silver Star 9-Step Digital Onboarding Pipeline
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            'Registration', 'Demographics', 'Document Upload', 'eKYC Verification',
            'HR Review', 'ID Generation', 'QR ID Card', 'Account Provisioning', 'Ops Handover'
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < 5 ? 'border-[#26BCEE] bg-[#26BCEE] text-white' : 'border-gray-200 bg-white text-gray-400'
                }`}>{i + 1}</div>
                <span className="text-[9px] text-gray-500 mt-1 text-center max-w-14 leading-tight">{step}</span>
              </div>
              {i < 8 && <div className={`h-0.5 w-4 mb-4 ${i < 4 ? 'bg-[#26BCEE]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employeeList.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#202B75]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#202B75] text-xs font-bold">{emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{DEPARTMENTS.find(d => d.id === emp.departmentId)?.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{emp.employmentType}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    emp.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{emp.kycStatus} ({emp.kycMethod || 'Pending'})</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    emp.onboardingStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{emp.onboardingStatus}</span>
                </td>
                <td className="px-4 py-3">
                  {emp.onboardingStatus === 'Pending' ? (
                    <button
                      onClick={() => setShowWizard(true)}
                      className="px-2.5 py-1 bg-[#202B75] text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Play size={10} /> Process 9-Step
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showWizard && (
        <OnboardingWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleWizardSuccess}
        />
      )}
    </div>
  )
}
