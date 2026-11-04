import { useState } from 'react'
import { USER_ACCOUNTS } from '@mock/mockData'
import { Shield, Plus, Check, UserCheck, Key } from 'lucide-react'

export default function UserRoles() {
  const [users] = useState(USER_ACCOUNTS)

  const roles = [
    { name: 'Super Admin', desc: 'Full unrestricted governance, settings, user configuration, contract controls' },
    { name: 'HR Executive', desc: 'Employee onboarding pipeline, KYC approval, compliance, document management' },
    { name: 'Operations Manager', desc: 'Site rosters, geofencing, daily deployments, emergency reliefs, attendance checks' },
    { name: 'Corporate Client', desc: 'Read-only live site headcount, daily muster verification, billing invoices, tickets' },
    { name: 'Field Employee', desc: 'Mobile app punch in/out, view payslip, personal muster, raise SOS/grievance' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#202B75]">User Accounts & Role Permissions</h2>
          <p className="text-xs text-gray-500">RBAC security matrix across Web Panels and Mobile Applications</p>
        </div>
        <button
          onClick={() => alert('Demo Action: Add User Dialog')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#202B75] text-white rounded-lg text-xs font-medium hover:bg-[#161f56] transition-colors"
        >
          <Plus size={14} /> Add System User
        </button>
      </div>

      {/* Role Matrix Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#202B75]" />
              <h3 className="font-semibold text-gray-900 text-xs">{role.name}</h3>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#202B75]">Active Management Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">User Name</th>
                <th className="px-4 py-3 text-left">Email Address</th>
                <th className="px-4 py-3 text-left">Assigned Role</th>
                <th className="px-4 py-3 text-left">Last Active</th>
                <th className="px-4 py-3 text-left">Account Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#202B75]/10 text-[#202B75] flex items-center justify-center font-bold text-[10px]">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#26BCEE]/10 text-[#202B75]">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[11px]">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => alert(`Password reset link dispatched for ${u.email}`)}
                      className="text-[#26BCEE] hover:underline font-medium text-[11px] flex items-center gap-1"
                    >
                      <Key size={12} /> Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
