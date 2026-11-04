import { useState, useEffect } from 'react'
import { SITES, CONTRACT_BILLINGS, api } from '@mock/mockData'
import { Plus, Search, Eye, Edit2, X, Building2, Phone, Mail, Calendar, MapPin, Check } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    monthlyBilling: 0,
    servicesProvided: ['Security Services', 'Housekeeping'],
  })
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    api.getClients()
      .then(setClients)
      .catch(err => console.error('Error loading clients:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createClient(newClient)
      setShowAddModal(false)
      setNewClient({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        monthlyBilling: 0,
        servicesProvided: ['Security Services'],
      })
      loadData()
    } catch (err: any) {
      alert(`Error creating client: ${err.message}`)
    }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase())
  )

  const client = clients.find(c => c.id === selected)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{clients.length} client accounts</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#202B75] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#161f56] transition-colors font-medium shadow-sm"
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-800">Add New Client Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization Name *</label>
                <input required value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="e.g. Acme Tech Park" className="w-full border rounded-lg p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person *</label>
                  <input required value={newClient.contactPerson} onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    placeholder="e.g. Ramesh Verma" className="w-full border rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input required value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+91 98765 43210" className="w-full border rounded-lg p-2.5 font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Email Address *</label>
                <input required type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="client@acme.com" className="w-full border rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Facility / Billing Address *</label>
                <input required value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Electronic City, Bangalore" className="w-full border rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Monthly Contract Value (₹)</label>
                <input type="number" value={newClient.monthlyBilling || ''} onChange={e => setNewClient({ ...newClient, monthlyBilling: parseFloat(e.target.value) || 0 })}
                  placeholder="250000" className="w-full border rounded-lg p-2.5 font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#202B75] text-white rounded-lg font-semibold flex items-center gap-1.5">
                  <Check size={14} /> Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No clients found. Click "+ Add Client" to create your first client in PostgreSQL.
                </td>
              </tr>
            ) : (
              filtered.map(client => {
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
                        {client.sites?.length || 0} site{client.sites?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{contract?.contractNumber || '—'}</p>
                      <p className="text-xs text-gray-400">₹{((client.monthlyBilling || 0) / 1000).toFixed(0)}K/mo</p>
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
              })
            )}
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
                  {client.servicesProvided?.map((s: string) => (
                    <span key={s} className="bg-[#202B75]/10 text-[#202B75] text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
