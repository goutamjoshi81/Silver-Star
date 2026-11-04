import { useState, useEffect } from 'react'
import { SITES, CLIENTS, DEPARTMENTS, DESIGNATIONS, SHIFTS, api } from '@mock/mockData'
import {
  UserCheck, UserX, UserPlus, Building2, MapPin, ArrowRight,
  CheckCircle2, X, Phone, Search, Users
} from 'lucide-react'

export default function Deployment() {
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [clientsList, setClientsList] = useState<any[]>([])
  const [sitesList, setSitesList] = useState<any[]>([])
  const [activeClientFilter, setActiveClientFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deployModal, setDeployModal] = useState<{
    open: boolean
    clientId?: string
    clientName?: string
    siteId?: string
    siteName?: string
  }>({ open: false })

  const [selectedEmpId, setSelectedEmpId] = useState<string>('')
  const [selectedShiftId, setSelectedShiftId] = useState<string>('SHF001')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [emps, cls, sts] = await Promise.all([
        api.getEmployees(),
        api.getClients(),
        api.getSites(),
      ])
      setEmployeesList(emps)
      setClientsList(cls)
      setSitesList(sts)
    } catch (err) {
      console.error('Error loading deployment data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const deployed = employeesList.filter(e => e.deployedSiteId !== null)
  const undeployed = employeesList.filter(e => e.deployedSiteId === null)

  const handleOpenDeployModal = (clientId: string, clientName: string, siteId?: string, siteName?: string) => {
    const targetSite = siteId || sitesList.find(s => s.clientId === clientId)?.id || SITES.find(s => s.clientId === clientId)?.id || 'SITE001'
    const targetSiteName = siteName || sitesList.find(s => s.id === targetSite)?.name || 'Main Campus'
    setDeployModal({
      open: true,
      clientId,
      clientName,
      siteId: targetSite,
      siteName: targetSiteName,
    })
    if (undeployed.length > 0) {
      setSelectedEmpId(undeployed[0].id)
    }
  }

  const handleConfirmDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpId || !deployModal.siteId) return

    const emp = employeesList.find(e => e.id === selectedEmpId)
    try {
      await api.createDeployment({
        siteId: deployModal.siteId!,
        clientId: deployModal.clientId!,
        employeeId: selectedEmpId,
        shiftId: selectedShiftId,
        deployedBy: 'Super Admin',
      })
      await loadData()
      setToastMessage(`Admin Deployed: ${emp?.name} allocated to ${deployModal.clientName} (${deployModal.siteName}). Saved to PostgreSQL database!`)
    } catch (err: any) {
      setToastMessage(`Error deploying: ${err.message}`)
    }
    setTimeout(() => setToastMessage(null), 4000)
    setDeployModal({ open: false })
  }

  const handleRelieve = async (empId: string, empName: string, clientName: string) => {
    try {
      await api.updateEmployee(empId, {
        deployedSiteId: null,
        deployedClientId: null,
      })
      await loadData()
      setToastMessage(`Relieved ${empName} from ${clientName}. Saved to PostgreSQL database!`)
    } catch (err: any) {
      setToastMessage(`Error relieving: ${err.message}`)
    }
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Filter clients
  const activeClients = clientsList.length > 0 ? clientsList : CLIENTS
  const filteredClients = activeClients.filter(client => {
    if (activeClientFilter !== 'All' && client.id !== activeClientFilter) return false
    if (!searchQuery) return true
    return (
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Master Workforce Deployment Governance</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Enterprise manpower deployment across all client facilities with instant allocation controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <UserCheck size={14} className="text-emerald-600" />
            <strong>{deployed.length}</strong> Deployed
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <UserX size={14} className="text-amber-600" />
            <strong>{undeployed.length}</strong> Standby Reserve
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-[11px] underline">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search client organization or facility location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#202B75]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-gray-500 font-bold uppercase whitespace-nowrap">Filter Client:</span>
          <select
            value={activeClientFilter}
            onChange={e => setActiveClientFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 font-semibold text-gray-800 focus:outline-none"
          >
            <option value="All">All Client Contracts ({CLIENTS.length})</option>
            {CLIENTS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CLIENT-WISE WORKFORCE DEPLOYMENT */}
      <div className="space-y-5">
        {filteredClients.map(client => {
          const clientSites = SITES.filter(s => s.clientId === client.id)
          const clientEmployees = employeesList.filter(e =>
            clientSites.some(s => s.id === e.deployedSiteId) || e.deployedClientId === client.id
          )
          const totalSanctioned = clientSites.reduce((sum, s) => sum + s.sanctionedStrength, 0)
          const fillRate = totalSanctioned > 0 ? Math.round((clientEmployees.length / totalSanctioned) * 100) : 100

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-[#202B75]/40 transition-all"
            >
              {/* CLIENT HEADER ROW WITH "+ DEPLOY EMPLOYEE" IN FRONT OF CLIENT */}
              <div className="p-4 bg-gradient-to-r from-slate-50 via-white to-sky-50/30 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202B75] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 mt-0.5">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-gray-900">{client.name}</h3>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-[#202B75] border border-blue-200 rounded">
                        {client.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {client.status} Contract
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {client.address}</span>
                      <span>•</span>
                      <span>POC: <strong>{client.contactPerson}</strong> ({client.phone})</span>
                      <span>•</span>
                      <span>Monthly Billing: <strong>₹{((client.monthlyBilling || 250000)).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* PROMINENT ACTION BUTTON IN FRONT OF CLIENT */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-gray-800">
                      {clientEmployees.length} / {totalSanctioned} Deployed
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {fillRate}% Staffing Fulfillment
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDeployModal(client.id, client.name)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#202B75] hover:bg-[#161f56] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <UserPlus size={15} className="text-[#26BCEE]" />
                    <span>+ Deploy Employee</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-100">
                <div
                  className={`h-full transition-all duration-500 ${
                    fillRate >= 100 ? 'bg-emerald-500' : fillRate >= 75 ? 'bg-sky-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(fillRate, 100)}%` }}
                />
              </div>

              {/* SITES AND ROSTER UNDER THIS CLIENT */}
              <div className="p-4 space-y-4">
                {clientSites.map(site => {
                  const siteEmps = employeesList.filter(e => e.deployedSiteId === site.id)
                  return (
                    <div key={site.id} className="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#26BCEE]"></span>
                          <h4 className="font-bold text-xs text-[#202B75]">{site.name}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">({site.id})</span>
                          <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            Geofence Radius: <strong>{site.geofenceRadius}m</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">
                            Roster: {siteEmps.length} / {site.sanctionedStrength} staff
                          </span>
                          <button
                            onClick={() => handleOpenDeployModal(client.id, client.name, site.id, site.name)}
                            className="text-[11px] font-bold text-[#202B75] hover:text-[#161f56] bg-white border border-[#202B75]/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-[#202B75]/5"
                          >
                            <UserPlus size={12} /> Add to Site
                          </button>
                        </div>
                      </div>

                      {/* Site deployed roster */}
                      {siteEmps.length === 0 ? (
                        <div className="py-2 text-center text-[11px] text-amber-600 font-medium">
                          No staff deployed at this site currently. Click "+ Deploy Employee" to assign personnel.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {siteEmps.map(emp => {
                            const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
                            return (
                              <div
                                key={emp.id}
                                className="bg-white border border-gray-200 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-[#202B75]/40 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-[#202B75]/10 text-[#202B75] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-gray-800 truncate">{emp.name}</p>
                                    <p className="text-[10px] text-[#26BCEE] font-bold font-mono">
                                      {emp.employeeCode} · {desig?.name || 'Officer'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono">📞 {emp.phone}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRelieve(emp.id, emp.name, client.name)}
                                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 flex-shrink-0"
                                  title="Relieve employee from this client site"
                                >
                                  Relieve
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* AVAILABLE STAFF POOL */}
      {undeployed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#202B75] flex items-center gap-2">
                <Users size={16} /> Available Workforce Pool ({undeployed.length} Staff on Standby)
              </h3>
              <p className="text-xs text-gray-400">Trained and KYC-verified staff ready for immediate site deployment</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              Reserve Pool
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {undeployed.map(emp => {
              const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
              const desig = DESIGNATIONS.find(d => d.id === emp.designationId)
              return (
                <div key={emp.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50/70 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{emp.name}</h4>
                    <p className="text-[11px] font-mono font-bold text-[#202B75]">{emp.employeeCode}</p>
                    <p className="text-[10px] text-gray-500">{dept?.name} • {desig?.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">📞 {emp.phone}</p>
                  </div>
                  <button
                    onClick={() => handleOpenDeployModal(CLIENTS[0].id, CLIENTS[0].name)}
                    className="px-2.5 py-1.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm flex-shrink-0"
                  >
                    Deploy <ArrowRight size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DEPLOY MODAL */}
      {deployModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmDeploy}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#202B75]">Deploy Staff Member</h3>
                <p className="text-xs text-gray-400">Target Organization: <strong className="text-gray-800">{deployModal.clientName}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setDeployModal({ open: false })}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Available Staff *</label>
                {undeployed.length === 0 ? (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    No available staff in the reserve pool. All employees currently allocated.
                  </p>
                ) : (
                  <select
                    value={selectedEmpId}
                    onChange={e => setSelectedEmpId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                    required
                  >
                    {undeployed.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.employeeCode}) — 📞 {e.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Client Work Site *</label>
                <select
                  value={deployModal.siteId}
                  onChange={e => {
                    const found = SITES.find(s => s.id === e.target.value)
                    setDeployModal(prev => ({
                      ...prev,
                      siteId: e.target.value,
                      siteName: found?.name,
                    }))
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                  required
                >
                  {SITES.filter(s => s.clientId === deployModal.clientId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address})
                    </option>
                  ))}
                  {SITES.filter(s => s.clientId === deployModal.clientId).length === 0 && (
                    SITES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Shift Schedule *</label>
                <select
                  value={selectedShiftId}
                  onChange={e => setSelectedShiftId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-medium"
                >
                  {SHIFTS.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} ({sh.startTime} – {sh.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-[11px] text-sky-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-sky-600" /> Executive Provisioning Notice:
                </p>
                <p>Authorized employee will receive automated SMS broadcast with reporting coordinates and supervisor phone contact.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDeployModal({ open: false })}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={undeployed.length === 0}
                className="px-4 py-2 bg-[#202B75] text-white rounded-lg text-xs font-bold hover:bg-[#161f56] disabled:opacity-50"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
