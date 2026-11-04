import { EMPLOYEES, DESIGNATIONS, DEPARTMENTS, SITES } from '@mock/mockData'
import { User, Phone, Mail, MapPin, ShieldCheck, Heart, LogOut } from 'lucide-react'

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const emp = EMPLOYEES.find(e => e.id === 'EMP001')!
  const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
  const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
  const site = SITES.find(s => s.id === emp.deployedSiteId)

  return (
    <div className="p-4 space-y-4">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#202B75] text-white flex items-center justify-center font-bold text-xl mx-auto mb-2 shadow-md">
          {emp.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
        <p className="text-[11px] text-[#26BCEE] font-medium">{desig?.name}</p>
        <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          eKYC Verified Staff
        </span>
      </div>

      {/* Employment Details */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 text-xs">
        <h4 className="font-bold text-xs text-slate-900 mb-1">Employment Information</h4>
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-400">Employee ID:</span>
          <span className="font-mono font-bold text-slate-800">{emp.employeeCode}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-400">Department:</span>
          <span className="font-semibold text-slate-700">{dept?.name}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-400">Site Assignment:</span>
          <span className="font-semibold text-slate-700">{site?.name}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-400">Employment Type:</span>
          <span className="text-slate-700">{emp.employmentType}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-400">Joining Date:</span>
          <span className="text-slate-700">{emp.joiningDate}</span>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
          <Heart size={13} className="text-rose-500" />
          <span>Emergency Contact</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Name:</span>
          <span className="font-semibold text-slate-800">{emp.emergencyContact.name} ({emp.emergencyContact.relation})</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Phone:</span>
          <a href={`tel:${emp.emergencyContact.phone}`} className="font-mono text-[#202B75] font-semibold">
            {emp.emergencyContact.phone}
          </a>
        </div>
      </div>

      {/* Bank & Compliance */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>PF & Bank Details</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Bank:</span>
          <span className="text-slate-800">{emp.bankName}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>PF Account:</span>
          <span className="font-mono text-slate-800">{emp.pfNumber || 'Enrolled'}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
      >
        <LogOut size={14} /> Log Out of Staff App
      </button>
    </div>
  )
}

