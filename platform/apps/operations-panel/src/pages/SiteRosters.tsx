import { SITES, CLIENTS, EMPLOYEES, DEPARTMENTS, DESIGNATIONS } from '@mock/mockData'
export default function SiteRosters() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-base font-semibold text-[#202B75]">Site Rosters & Deployment</h2><p className="text-xs text-gray-500">Staff assigned per site with shift and supervisor details</p></div>
      {SITES.map(site => {
        const client = CLIENTS.find(c => c.id === site.clientId)
        const siteEmps = EMPLOYEES.filter(e => e.deployedSiteId === site.id)
        const supervisor = EMPLOYEES.find(e => e.id === site.supervisorId)
        return (
          <div key={site.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#202B75] text-sm">{site.name}</h3>
                <p className="text-xs text-gray-400">{client?.name} · {site.address}</p>
                <p className="text-xs text-gray-500 mt-0.5">Supervisor: <span className="font-medium">{supervisor?.name} ({supervisor?.employeeCode})</span></p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${siteEmps.length >= site.sanctionedStrength ? 'text-emerald-600' : 'text-amber-500'}`}>{siteEmps.length}/{site.sanctionedStrength}</div>
                <p className="text-xs text-gray-400">staff deployed</p>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100"><tr>
                <th className="text-left px-4 py-2 text-gray-500 uppercase font-semibold tracking-wider">Employee</th>
                <th className="text-left px-4 py-2 text-gray-500 uppercase font-semibold tracking-wider">Designation</th>
                <th className="text-left px-4 py-2 text-gray-500 uppercase font-semibold tracking-wider">Type</th>
                <th className="text-left px-4 py-2 text-gray-500 uppercase font-semibold tracking-wider">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {siteEmps.length > 0 ? siteEmps.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{emp.name}<br /><span className="text-[10px] text-gray-400 font-mono">{emp.employeeCode}</span></td>
                    <td className="px-4 py-2.5 text-gray-600">{DESIGNATIONS.find(d => d.id === emp.designationId)?.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{emp.employmentType}</td>
                    <td className="px-4 py-2.5"><span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">{emp.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs italic">No staff currently deployed at this site</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

