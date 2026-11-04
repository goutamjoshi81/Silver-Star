import { useState } from 'react'
import { CLIENTS, SITES, CONTRACT_BILLINGS } from '@mock/mockData'
import { Plus, Search, Eye, Edit2, X, Building2, Phone, Mail, Calendar, MapPin } from 'lucide-react'

export default function Clients() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase())
  )

  const client = CLIENTS.find(c => c.id === selected)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{CLIENTS.length} client accounts</p>
        <button className="flex items-center gap-2 bg-[#202B75] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#161f56] transition-colors">
          <Plus size={14} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#202B75]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sites</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(client => {
              const contract = CONTRACT_BILLINGS.find(c => c.clientId === client.id)
              return (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#202B75]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#202B75]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{client.contactPerson}</p>
                    <p className="text-xs text-gray-400">{client.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#26BCEE]/10 text-[#26BCEE] text-xs font-semibold px-2 py-1 rounded-full">
                      {client.sites.length} site{client.sites.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{contract?.contractNumber || '—'}</p>
                    <p className="text-xs text-gray-400">₹{((contract?.monthlyAmount || 0) / 1000).toFixed(0)}K/mo</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      client.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      client.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                    }`}>{client.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(client.id)} className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-[#202B75] hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {client && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#202B75]">{client.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Building2 size={12} />{client.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Phone size={12} />{client.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Mail size={12} />{client.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="text-sm font-medium flex items-center gap-1"><MapPin size={12} />{client.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contract Start</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Calendar size={12} />{client.contractStart}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contract End</p>
                  <p className="text-sm font-medium flex items-center gap-1"><Calendar size={12} />{client.contractEnd}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Services Provided</p>
                <div className="flex flex-wrap gap-2">
                  {client.servicesProvided?.map(s => (
                    <span key={s} className="bg-[#202B75]/10 text-[#202B75] text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Assigned Sites</p>
                <div className="space-y-2">
                  {client.sites.map(sid => {
                    const site = SITES.find(s => s.id === sid)
                    return site ? (
                      <div key={sid} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{site.name}</p>
                          <p className="text-xs text-gray-400">{site.address}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${site.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {site.status}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

