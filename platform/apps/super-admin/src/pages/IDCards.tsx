import { useState } from 'react'
import { EMPLOYEES, DESIGNATIONS, COMPANY } from '@mock/mockData'
import { QrCode, X, CreditCard } from 'lucide-react'
import SilverStarIDCard from '../components/SilverStarIDCard'

export default function IDCards() {
  const [selected, setSelected] = useState<string | null>(null)
  const emp = EMPLOYEES.find(e => e.id === selected)
  const desig = emp ? DESIGNATIONS.find(d => d.id === emp.designationId) : null

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#202B75]">Silver Star Smart ID Cards (Official Standard)</h2>
        <p className="text-xs text-gray-500">Corporate NFC smart badge preview matching physical issued card with QR and social connectors</p>
      </div>

      {/* CEO / Founder Card Highlight */}
      <div className="bg-gradient-to-r from-[#202B75] to-[#161f56] rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#26BCEE] uppercase tracking-wider">Corporate Master Card</span>
          <h3 className="font-bold text-sm text-white mt-0.5">{COMPANY.founder}</h3>
          <p className="text-xs text-white/80">{COMPANY.founderRole} · Silver Star Facility Management</p>
        </div>
        <button
          onClick={() => setSelected('FOUNDER')}
          className="px-4 py-2 bg-[#26BCEE] hover:bg-[#1a9fd0] text-slate-900 font-bold rounded-xl text-xs shadow-md transition-colors"
        >
          Preview Master Card
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {EMPLOYEES.map(empItem => (
          <div key={empItem.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 hover:border-gray-300 transition-colors">
            <div className="w-12 h-12 bg-[#202B75] rounded-full flex items-center justify-center mx-auto text-white font-bold text-base shadow-sm">
              {empItem.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm truncate">{empItem.name}</p>
              <p className="text-xs font-mono text-gray-400">{empItem.employeeCode}</p>
              <p className="text-[11px] text-[#26BCEE] font-medium mt-0.5">
                {DESIGNATIONS.find(d=>d.id===empItem.designationId)?.name}
              </p>
            </div>
            <button
              onClick={() => setSelected(empItem.id)}
              className="w-full text-xs py-2 bg-[#202B75] text-white rounded-lg hover:bg-[#161f56] transition-colors font-semibold flex items-center justify-center gap-1.5"
            >
              <QrCode size={12} /> View Smart Card
            </button>
          </div>
        ))}
      </div>

      {/* Modal with SilverStarIDCard */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative space-y-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              <X size={20} />
            </button>

            <div className="text-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#202B75]">Official Silver Star ID Badge</h3>
              <p className="text-[11px] text-gray-400">Front (Wave Emblem & NFC) · Back (QR & Details)</p>
            </div>

            {selected === 'FOUNDER' ? (
              <SilverStarIDCard
                name={COMPANY.founder.toUpperCase()}
                designation={COMPANY.founderRole.toUpperCase()}
                employeeCode="SS-FOUNDER-01"
                phone1={COMPANY.founderPhone1}
                phone2={COMPANY.founderPhone2}
                isFounder={true}
              />
            ) : (
              <SilverStarIDCard
                name={emp?.name.toUpperCase()}
                designation={desig?.name.toUpperCase()}
                employeeCode={emp?.employeeCode}
                phone1={emp?.phone}
                phone2={COMPANY.phone}
                bloodGroup={emp?.bloodGroup}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
