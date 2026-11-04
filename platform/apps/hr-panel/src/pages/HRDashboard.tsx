import { EMPLOYEES, DEPARTMENTS, EMPLOYEE_DOCUMENTS, DASHBOARD_KPIS } from '@mock/mockData'
import { Users, UserPlus, Clock, CheckCircle, XCircle, FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const trendData = [
  { month: 'Jun', registered: 3, approved: 3, pending: 0 },
  { month: 'Jul', registered: 4, approved: 3, pending: 1 },
  { month: 'Aug', registered: 2, approved: 2, pending: 0 },
  { month: 'Sep', registered: 5, approved: 4, pending: 1 },
  { month: 'Oct', registered: 3, approved: 3, pending: 0 },
  { month: 'Nov', registered: 2, approved: 1, pending: 1 },
]

export default function HRDashboard() {
  const pending = EMPLOYEES.filter(e => e.onboardingStatus === 'Pending').length
  const approved = EMPLOYEES.filter(e => e.onboardingStatus === 'Approved').length
  const kycPending = EMPLOYEES.filter(e => e.kycStatus === 'Pending').length
  const docsPending = EMPLOYEE_DOCUMENTS.filter(d => d.status === 'Pending').length

  const kpiCards = [
    { label: 'Total Employees', value: EMPLOYEES.length, icon: Users, color: 'bg-[#202B75]' },
    { label: 'New Registrations (MTD)', value: DASHBOARD_KPIS.newRegistrationsMTD, icon: UserPlus, color: 'bg-emerald-600' },
    { label: 'Pending Onboarding', value: pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'KYC Pending', value: kycPending, icon: FileText, color: 'bg-orange-500' },
    { label: 'Approved Employees', value: approved, icon: CheckCircle, color: 'bg-teal-600' },
    { label: 'Documents Pending', value: docsPending, icon: FileText, color: 'bg-violet-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-[#202B75]">{value}</div>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Monthly Onboarding Trend
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barSize={12}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="registered" fill="#202B75" name="Registered" radius={[4,4,0,0]} />
              <Bar dataKey="approved" fill="#26BCEE" name="Approved" radius={[4,4,0,0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4">Department Headcount</h2>
          <div className="space-y-2.5">
            {[
              { name: 'Security Services', count: EMPLOYEES.filter(e => e.departmentId === 'DEP002').length, color: 'bg-[#202B75]' },
              { name: 'Housekeeping', count: EMPLOYEES.filter(e => e.departmentId === 'DEP001').length, color: 'bg-[#26BCEE]' },
              { name: 'Electro-Mechanical', count: EMPLOYEES.filter(e => e.departmentId === 'DEP003').length, color: 'bg-emerald-500' },
            ].map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">{d.name}</span>
                  <span className="text-gray-500">{d.count} staff</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${(d.count / EMPLOYEES.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent onboarding activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#202B75] mb-4">Recent Onboarding Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-100 text-gray-500 text-[10px] uppercase font-semibold tracking-wider">
              <tr>
                <th className="pb-2 text-left">Employee</th>
                <th className="pb-2 text-left">Joining Date</th>
                <th className="pb-2 text-left">Department</th>
                <th className="pb-2 text-left">KYC</th>
                <th className="pb-2 text-left">Onboarding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {EMPLOYEES.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 font-medium text-gray-800">{e.name}</td>
                  <td className="py-2.5 text-gray-500">{e.joiningDate}</td>
                  <td className="py-2.5 text-gray-500">{DEPARTMENTS.find(d => d.id === e.departmentId)?.name}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${e.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {e.kycStatus}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${e.onboardingStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {e.onboardingStatus}
                    </span>
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

