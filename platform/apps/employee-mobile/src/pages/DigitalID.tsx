import { EMPLOYEES, DESIGNATIONS, COMPANY } from '@mock/mockData'
import SilverStarIDCard from '../components/SilverStarIDCard'

export default function DigitalID() {
  const emp = EMPLOYEES.find(e => e.id === 'EMP001')!
  const desig = DESIGNATIONS.find(d => d.id === emp.designationId)

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-sm font-bold text-[#202B75]">Official Digital ID Badge</h2>
        <p className="text-[11px] text-slate-500">Official Silver Star smart credential for gate checkpoints</p>
      </div>

      <div className="flex justify-center">
        <SilverStarIDCard
          name={emp.name.toUpperCase()}
          designation={desig?.name.toUpperCase()}
          employeeCode={emp.employeeCode}
          phone1={emp.phone}
          phone2={COMPANY.phone}
          bloodGroup={emp.bloodGroup}
          initialSide="front"
        />
      </div>
    </div>
  )
}
