import { useState, useEffect } from 'react'
import { USER_ACCOUNTS, api } from '@mock/mockData'
import {
  Shield, Plus, Check, UserCheck, Key, X, Search, Trash2,
  RefreshCw, AlertCircle, Lock, User, Mail, Building2, CheckCircle2
} from 'lucide-react'

interface SystemUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  last_login?: string
  lastLogin?: string
  client_id?: string
  client_name?: string
  employee_id?: string
  employee_name?: string
  employee_code?: string
  created_at?: string
}

export default function UserRoles() {
  const [users, setUsers] = useState<SystemUser[]>(USER_ACCOUNTS as any)
  const [clients, setClients] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Operations Manager',
    password: 'SilverStar@2026',
    clientId: '',
    employeeId: '',
  })

  // Reset Password Modal state
  const [resetUser, setResetUser] = useState<SystemUser | null>(null)
  const [newPassword, setNewPassword] = useState('SilverStar@2026')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const roles = [
    { name: 'Super Admin', desc: 'Full unrestricted governance, settings, user configuration, contract controls', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'HR Executive', desc: 'Employee onboarding pipeline, KYC approval, compliance, document management', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'Operations Manager', desc: 'Site rosters, geofencing, daily deployments, emergency reliefs, attendance checks', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    { name: 'Corporate Client', desc: 'Read-only live site headcount, daily muster verification, billing invoices, tickets', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { name: 'Field Employee', desc: 'Mobile app punch in/out, view payslip, personal muster, raise SOS/grievance', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  ]

  const loadData = async () => {
    setLoading(true)
    try {
      const [userData, clientData, employeeData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getClients().catch(() => []),
        api.getEmployees().catch(() => []),
      ])

      if (Array.isArray(userData) && userData.length > 0) {
        setUsers(userData)
      }
      if (Array.isArray(clientData)) setClients(clientData)
      if (Array.isArray(employeeData)) setEmployees(employeeData)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 5000)
  }

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSubmitting(true)

    try {
      const payload: any = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
      }

      if (newUser.role === 'Corporate Client' && newUser.clientId) {
        payload.clientId = newUser.clientId
      }
      if ((newUser.role === 'Supervisor' || newUser.role === 'Employee') && newUser.employeeId) {
        payload.employeeId = newUser.employeeId
      }

      await api.createUser(payload)
      setShowAddModal(false)
      setNewUser({
        name: '',
        email: '',
        role: 'Operations Manager',
        password: 'SilverStar@2026',
        clientId: '',
        employeeId: '',
      })
      await loadData()
      showToast(`User account "${payload.name}" successfully created and saved to database!`)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create user account')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Password Reset
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUser) return
    setResetSubmitting(true)

    try {
      await api.updateUser(resetUser.id, { password: newPassword })
      setResetUser(null)
      showToast(`Password successfully updated for ${resetUser.name} (${resetUser.email})!`)
    } catch (err: any) {
      alert(`Error resetting password: ${err.message}`)
    } finally {
      setResetSubmitting(false)
    }
  }

  // Toggle user status
  const handleToggleStatus = async (user: SystemUser) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.updateUser(user.id, { status: nextStatus })
      await loadData()
      showToast(`Account status for ${user.name} changed to ${nextStatus}.`)
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`)
    }
  }

  // Delete User
  const handleDeleteUser = async (user: SystemUser) => {
    if (user.id === 'USR001') {
      alert('The primary Super Admin account cannot be deleted.')
      return
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return
    }

    try {
      await api.deleteUser(user.id)
      await loadData()
      showToast(`User ${user.name} removed successfully.`)
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`)
    }
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === 'All' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'HR Executive':
        return 'bg-blue-100 text-[#202B75] border-blue-200'
      case 'Operations Manager':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Corporate Client':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Supervisor':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#202B75]">User Accounts & Role Permissions</h2>
          <p className="text-xs text-gray-500">RBAC security matrix across Web Panels and Mobile Applications (PostgreSQL Connected)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Users"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setErrorMessage(null)
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold hover:bg-[#161f56] transition-colors shadow-sm"
          >
            <Plus size={14} /> Add System User
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Role Matrix Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((role, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#202B75]" />
                <h3 className="font-semibold text-gray-900 text-xs">{role.name}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badge}`}>
                {users.filter(u => u.role === role.name).length} Users
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#202B75]">Active Management Accounts</h3>
            <p className="text-[11px] text-gray-400">Total {users.length} configured credentials</p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-[#202B75]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-700 font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="HR Executive">HR Executive</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Corporate Client">Corporate Client</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">User Name</th>
                <th className="px-4 py-3 text-left">Email Address</th>
                <th className="px-4 py-3 text-left">Assigned Role</th>
                <th className="px-4 py-3 text-left">Mapped Account / Entity</th>
                <th className="px-4 py-3 text-left">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#202B75]/10 text-[#202B75] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{u.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[11px]">
                      {u.client_name ? (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Building2 size={12} className="text-emerald-600" /> {u.client_name}
                        </span>
                      ) : u.employee_name ? (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <User size={12} className="text-[#202B75]" /> {u.employee_name} ({u.employee_code})
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Central HQ / Unmapped</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle status"
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {u.status || 'Active'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setResetUser(u)
                            setNewPassword('SilverStar@2026')
                          }}
                          className="text-[#202B75] hover:text-[#26BCEE] font-medium text-[11px] flex items-center gap-1 hover:underline"
                        >
                          <Key size={12} /> Reset Password
                        </button>
                        {u.id !== 'USR001' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD SYSTEM USER */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#202B75]/10 text-[#202B75] flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Add New System User Account</h3>
                  <p className="text-[11px] text-gray-500">Create RBAC credentials saved directly to PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Pooja Saxena"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="e.g. pooja.saxena@silverstarindia.net"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="HR Executive">HR Executive</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Corporate Client">Corporate Client</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="text"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Client Mapping */}
              {newUser.role === 'Corporate Client' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="block font-semibold text-emerald-900 text-xs">
                    Link to Corporate Client Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newUser.clientId}
                    onChange={(e) => setNewUser({ ...newUser, clientId: e.target.value })}
                    className="w-full border border-emerald-300 rounded-lg p-2 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Client Organization --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-emerald-700">
                    User will only have dashboard and ticket access for this corporate client account.
                  </p>
                </div>
              )}

              {/* Conditional Employee / Supervisor Mapping */}
              {(newUser.role === 'Supervisor' || newUser.role === 'Employee') && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="block font-semibold text-[#202B75] text-xs">
                    Link to Employee Profile (Optional)
                  </label>
                  <select
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                    className="w-full border border-blue-300 rounded-lg p-2 text-xs bg-white font-medium focus:ring-2 focus:ring-[#202B75]"
                  >
                    <option value="">-- Select Employee Record --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode}) - {emp.designationName || 'Staff'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-[#202B75]/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Create System User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD */}
      {/* ========================================================================= */}
      {resetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#202B75]" />
                <h3 className="font-bold text-gray-900 text-sm">Reset Password</h3>
              </div>
              <button
                onClick={() => setResetUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <div>User: <strong>{resetUser.name}</strong></div>
              <div>Email: <span className="font-mono text-gray-600">{resetUser.email}</span></div>
              <div>Role: <span className="font-semibold text-[#202B75]">{resetUser.role}</span></div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-5 py-2 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-md shadow-[#202B75]/20 disabled:opacity-50"
                >
                  {resetSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
