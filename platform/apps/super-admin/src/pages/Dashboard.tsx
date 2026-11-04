import { useState, useEffect } from 'react'
import {
  DASHBOARD_KPIS, EMPLOYEES, ATTENDANCE_TODAY, NOTIFICATIONS, INCIDENTS,
  CLIENTS, SITES, DEPARTMENTS, api
} from '@mock/mockData'
import {
  Users, UserCheck, UserPlus, Clock, MapPin, AlertCircle,
  Building2, FileWarning, CheckSquare, Banknote, TrendingUp,
  ShieldAlert
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function Dashboard() {
  const [kpis, setKpis] = useState(DASHBOARD_KPIS)
  const [employees, setEmployees] = useState<any[]>(EMPLOYEES)
  const [attendance, setAttendance] = useState<any[]>(ATTENDANCE_TODAY)
  const [notifications, setNotifications] = useState<any[]>(NOTIFICATIONS)
  const [incidents, setIncidents] = useState<any[]>(INCIDENTS)

  useEffect(() => {
    Promise.all([
      api.getKpis().catch(() => DASHBOARD_KPIS),
      api.getEmployees().catch(() => []),
      api.getAttendance().catch(() => []),
      api.getNotifications().catch(() => []),
      api.getIncidents().catch(() => []),
    ]).then(([k, emps, att, notifs, incs]) => {
      if (k) setKpis(k)
      if (emps) setEmployees(emps)
      if (att) setAttendance(att)
      if (notifs) setNotifications(notifs)
      if (incs) setIncidents(incs)
    })
  }, [])

  const kpiCards = [
    { label: 'Total Active Employees', value: kpis.totalActiveEmployees, icon: Users, color: 'bg-[#202B75]' },
    { label: 'New Registrations (MTD)', value: kpis.newRegistrationsMTD, icon: UserPlus, color: 'bg-emerald-600' },
    { label: 'KYC Pending', value: kpis.kycPending, icon: UserCheck, color: 'bg-amber-500' },
    { label: 'Employees Deployed', value: kpis.employeesDeployed, icon: MapPin, color: 'bg-[#26BCEE]' },
    { label: 'Not Deployed', value: kpis.employeesNotDeployed, icon: AlertCircle, color: 'bg-rose-500' },
    { label: 'Present Today', value: kpis.presentToday, icon: Clock, color: 'bg-teal-600' },
    { label: 'Absent Today', value: kpis.absentToday, icon: Clock, color: 'bg-red-500' },
    { label: 'Active Contracts', value: kpis.activeClientContracts, icon: Building2, color: 'bg-violet-600' },
    { label: 'Active Work Locations', value: kpis.activeWorkLocations, icon: MapPin, color: 'bg-indigo-500' },
    { label: 'Pending Complaints', value: kpis.pendingComplaints, icon: FileWarning, color: 'bg-orange-500' },
    { label: 'Pending Approvals', value: kpis.pendingApprovals, icon: CheckSquare, color: 'bg-yellow-500' },
    { label: 'Monthly Manpower Cost', value: `₹${(kpis.monthlyManpowerCost / 100000).toFixed(1)}L`, icon: Banknote, color: 'bg-slate-600' },
  ]

  const deptData = DEPARTMENTS.map(d => ({
    name: d.code,
    employees: employees.filter(e => e.departmentId === d.id).length,
  })).filter(d => d.employees > 0)

  const attendanceData = [
    { name: 'Present', value: kpis.presentToday, color: '#26BCEE' },
    { name: 'Absent', value: kpis.absentToday, color: '#ef4444' },
    { name: 'Late', value: attendance.filter(a => a.status === 'Late').length, color: '#f59e0b' },
  ]

  const monthlyData = [
    { month: 'Jun', present: 85, absent: 15 },
    { month: 'Jul', present: 88, absent: 12 },
    { month: 'Aug', present: 82, absent: 18 },
    { month: 'Sep', present: 90, absent: 10 },
    { month: 'Oct', present: 87, absent: 13 },
    { month: 'Nov', present: 83, absent: 17 },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-[#202B75]">{value}</div>
            <div className="text-xs text-gray-500 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Monthly Attendance Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={16}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#26BCEE" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today Attendance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4">Today's Attendance</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                {attendanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4">Dept. Workforce</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deptData} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={35} />
              <Tooltip />
              <Bar dataKey="employees" fill="#202B75" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Operational Alerts
          </h2>
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map(n => (
              <div key={n.id} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-xs font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 leading-tight">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#202B75] mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-800">{inc.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                    inc.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>{inc.priority}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{SITES.find(s => s.id === inc.siteId)?.name}</p>
                <div className="mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    inc.status === 'Open' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                  }`}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
