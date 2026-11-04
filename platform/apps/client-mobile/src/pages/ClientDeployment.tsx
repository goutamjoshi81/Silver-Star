import { useState } from 'react'
import { CLIENTS, SITES, EMPLOYEES, DESIGNATIONS, DEPARTMENTS } from '@mock/mockData'
import { Search, Shield, User } from 'lucide-react'

export default function ClientDeployment() {
  const clientId = 'CLI001'
  const clientSites = SITES.filter(s => s.clientId === clientId)
  const siteIds = clientSites.map(s => s.id)
  const clientEmployees = EMPLOYEES.filter(e => e.deployedSiteId && siteIds.includes(e.deployedSiteId))

  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = clientEmployees.filter(emp => {
    const matchSite = selectedSite === 'all' || emp.deployedSiteId === selectedSite
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase())
    return matchSite && matchSearch
  })

  return (
    <div className="p-4 space-y-3.5">
      <div>
        <h2 className="text-sm font-bold text-[#202B75]">On-Site Workforce Roster</h2>
        <p className="text-[11px] text-slate-500">Personnel authorized and assigned to your premises</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedSite('all')}
          className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
            selectedSite === 'all'
              ? 'bg-[#202B75] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          All Sites ({clientEmployees.length})
        </button>
        {clientSites.map(site => (
          <button
            key={site.id}
            onClick={() => setSelectedSite(site.id)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedSite === site.id
                ? 'bg-[#202B75] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or staff code..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#202B75]"
        />
      </div>

      {/* Staff Cards (Proposal 1, Table 5 format) */}
      <div className="space-y-2">
        {filtered.map(emp => {
          const site = SITES.find(s => s.id === emp.deployedSiteId)
          const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
          const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)

          return (
            <div key={emp.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#202B75]/10 text-[#202B75] flex items-center justify-center font-bold text-xs flex-shrink-0">
                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{emp.name}</h4>
                  <span className="font-mono text-[10px] text-slate-400">{emp.employeeCode}</span>
                </div>
                <p className="text-[11px] text-[#26BCEE] font-medium truncate">{desig?.name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{site?.name}</span>
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    {emp.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tenancy Safety Note */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 leading-tight">
        <strong>Confidentiality Protection:</strong> Personal identity documents, unmasked Aadhaar numbers, and employee bank details are protected per corporate security guidelines.
      </div>
    </div>
  )
}

