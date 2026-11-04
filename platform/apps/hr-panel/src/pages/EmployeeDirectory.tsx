import { useState, useEffect } from 'react'
import { DEPARTMENTS, DESIGNATIONS, SITES, CLIENTS, api } from '@mock/mockData'
import { Search, Phone, MessageSquare, Mail, MapPin, ShieldCheck, UserCheck, LayoutGrid, List } from 'lucide-react'

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEmployees()
      .then(data => setEmployees(data))
      .catch(err => console.error('Failed to load employees from DB:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.toLowerCase().includes(search.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(search.toLowerCase()))

    const matchesDept = selectedDept === 'All' || e.departmentId === selectedDept
    return matchesSearch && matchesDept
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Staff & Workforce Directory</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Active Silver Star staff records with direct phone contacts, deployment status, and KYC verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow text-[#202B75]' : 'text-gray-500'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white shadow text-[#202B75]' : 'text-gray-500'
              }`}
            >
              <List size={14} /> Table
            </button>
          </div>
          <span className="text-xs font-bold text-[#202B75] bg-[#202B75]/10 px-3 py-1.5 rounded-lg">
            {filtered.length} Employees Found
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, employee code, or phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#202B75]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Department:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 font-medium text-gray-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
            const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
            const site = SITES.find(s => s.id === emp.deployedSiteId)
            const client = CLIENTS.find(c => c.id === emp.deployedClientId)

            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3.5 hover:border-[#202B75]/50 transition-all hover:shadow-md"
              >
                {/* Employee Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#202B75] text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{emp.name}</h3>
                      <p className="text-xs text-[#26BCEE] font-bold font-mono">{emp.employeeCode}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Primary Contact Number (Highlighted per request) */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#202B75] text-white flex items-center justify-center flex-shrink-0">
                      <Phone size={13} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Contact Number</p>
                      <a
                        href={`tel:${emp.phone}`}
                        className="text-xs font-bold text-[#202B75] hover:underline font-mono"
                      >
                        {emp.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${emp.phone}`}
                      title="Direct Call"
                      className="p-1.5 rounded-md bg-white text-[#202B75] border border-sky-200 hover:bg-sky-100 transition-colors"
                    >
                      <Phone size={12} />
                    </a>
                    <a
                      href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp Message"
                      className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <MessageSquare size={12} />
                    </a>
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50/60 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="font-semibold text-gray-800">{dept?.name || 'Operations'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-semibold text-gray-800">{desig?.name || 'Staff'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deployment:</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">
                      {site ? `${site.name}` : client ? `${client.name}` : 'Unassigned (Reserve)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emergency:</span>
                    <span className="font-mono text-gray-700">{emp.emergencyContact?.phone || '+91 9620000494'}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 pt-1">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-md font-bold flex-1 text-center border ${
                      emp.kycStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    KYC: {emp.kycStatus}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-md font-bold flex-1 text-center bg-gray-100 text-gray-700 border border-gray-200">
                    {emp.employmentType}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Contact Number</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Deployment Site</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(emp => {
                  const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
                  const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
                  const site = SITES.find(s => s.id === emp.deployedSiteId)
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{emp.name}</div>
                        <div className="text-[10px] text-gray-400">{emp.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#202B75]">{emp.employeeCode}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${emp.phone}`}
                            className="font-mono font-bold text-[#202B75] hover:underline"
                          >
                            {emp.phone}
                          </a>
                          <a
                            href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{dept?.name || 'Operations'}</td>
                      <td className="px-4 py-3 text-gray-700">{desig?.name || 'Staff'}</td>
                      <td className="px-4 py-3 text-gray-600">{site?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.kycStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {emp.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${emp.phone}`}
                          className="px-2.5 py-1 bg-[#202B75] text-white rounded text-[11px] font-bold hover:bg-[#161f56] inline-flex items-center gap-1"
                        >
                          <Phone size={10} /> Call
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
