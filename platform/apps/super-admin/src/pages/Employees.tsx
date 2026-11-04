import { useState, useEffect } from 'react'
import { DEPARTMENTS, DESIGNATIONS, SITES, CLIENTS, api } from '@mock/mockData'
import { Search, Eye, Edit2, Filter, X, User, Phone, Mail, MapPin, Briefcase, Trash2 } from 'lucide-react'

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    api.getEmployees()
      .then(setEmployees)
      .catch(err => console.error('Error fetching employees:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete employee ${name}?`)) {
      try {
        await api.deleteEmployee(id)
        loadData()
      } catch (err: any) {
        alert(`Error deleting employee: ${err.message}`)
      }
    }
  }

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || e.departmentId === deptFilter
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const emp = employees.find(e => e.id === selected)

  const getDept = (id: string) => DEPARTMENTS.find(d => d.id === id)?.name || '—'
  const getDesig = (id: string) => DESIGNATIONS.find(d => d.id === id)?.name || '—'
  const getSite = (id: string | null) => id ? SITES.find(s => s.id === id)?.name || '—' : 'Not Deployed'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{filtered.length} of {employees.length} employees</p>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]">
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, employee code, or phone number..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deployed At</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#202B75]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#202B75] text-xs font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{emp.employeeCode} · <span className="text-gray-700 font-semibold">📞 {emp.phone}</span></p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{getDept(emp.departmentId)}</td>
                <td className="px-4 py-3 text-gray-600">{getDesig(emp.designationId)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${emp.deployedSiteId ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                    {getSite(emp.deployedSiteId)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    emp.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                    emp.kycStatus === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                  }`}>{emp.kycStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}>{emp.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(emp.id)} className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors" title="View Profile">
                      <Eye size={14} />
                    </button>
                    <a href={`tel:${emp.phone}`} className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors" title="Direct Phone Call">
                      <Phone size={14} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee Detail Modal */}
      {emp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#202B75]">Employee Profile</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#202B75] rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {emp.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                  <p className="text-sm text-[#26BCEE] font-medium">{emp.employeeCode}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {emp.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 mb-0.5">Department</p><p className="font-medium">{getDept(emp.departmentId)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Designation</p><p className="font-medium">{getDesig(emp.designationId)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Employment Type</p><p className="font-medium">{emp.employmentType}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Joining Date</p><p className="font-medium">{emp.joiningDate}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="font-medium font-mono text-[#202B75] font-bold">📞 {emp.phone}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Gender</p><p className="font-medium">{emp.gender}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="font-medium">{emp.email}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Address</p><p className="font-medium">{emp.address}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Blood Group</p><p className="font-medium">{emp.bloodGroup}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">KYC Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${emp.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{emp.kycStatus}</span>
                </div>
                <div><p className="text-xs text-gray-400 mb-0.5">Deployed Site</p><p className="font-medium">{getSite(emp.deployedSiteId)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">PF Number</p><p className="font-medium">{emp.pfNumber || '—'}</p></div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Bank Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-400">Bank</p><p className="font-medium">{emp.bankName}</p></div>
                  <div><p className="text-xs text-gray-400">Account</p><p className="font-medium font-mono">{emp.accountNumber}</p></div>
                  <div><p className="text-xs text-gray-400">IFSC</p><p className="font-medium font-mono">{emp.ifsc}</p></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Emergency Contact</p>
                <div className="text-sm">
                  <p className="font-medium">{emp.emergencyContact.name} <span className="text-gray-400">({emp.emergencyContact.relation})</span></p>
                  <p className="text-gray-600 font-mono">📞 {emp.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
