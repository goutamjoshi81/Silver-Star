import { useState, useEffect } from 'react';
import { COMPANY, api } from '@mock/mockData';
import SilverStarIDCard from '../components/SilverStarIDCard';
import { ShieldCheck, CheckCircle2, Building, Heart, Award } from 'lucide-react';

interface DigitalIDProps {
  currentUser?: any;
}

export default function DigitalID({ currentUser }: DigitalIDProps) {
  const [emp, setEmp] = useState<any>(currentUser || null);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      setEmp(currentUser);
    }
    
    // Fetch latest employee data if code or ID exists
    const empId = currentUser?.employeeId || currentUser?.id || currentUser?.employeeCode || 'SS-10001';
    api.getEmployee(empId)
      .then((data) => {
        if (isMounted && data) {
          setEmp((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Graceful fallback to default/cached employee
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Safe attribute fallbacks that never throw
  const name = (emp?.name || currentUser?.name || 'Ramesh Kumar').toUpperCase();
  const designation = (
    emp?.designationName ||
    emp?.designation ||
    currentUser?.designationName ||
    currentUser?.role ||
    'Security Guard'
  ).toUpperCase();
  const employeeCode = emp?.employeeCode || currentUser?.employeeCode || 'SS-10001';
  const phone1 = emp?.phone || currentUser?.phone || '+91 98765 43210';
  const phone2 = COMPANY.phone || '+91 80 4123 4567';
  const bloodGroup = emp?.bloodGroup || currentUser?.bloodGroup || 'B+';
  const siteName = emp?.siteName || currentUser?.siteName || 'Infosys Tech Park - Block A';

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
          <CheckCircle2 size={12} />
          <span>Active Digital Credential · Gate Authorized</span>
        </div>
        <h2 className="text-base font-black text-[#1A2B79] font-serif">
          Official Digital ID Badge
        </h2>
        <p className="text-[11px] text-slate-500">
          Official Silver Star contactless smart credential for gate checkpoints
        </p>
      </div>

      {/* Smart ID Card Component */}
      <div className="flex justify-center">
        <SilverStarIDCard
          name={name}
          designation={designation}
          employeeCode={employeeCode}
          phone1={phone1}
          phone2={phone2}
          bloodGroup={bloodGroup}
          initialSide="front"
        />
      </div>

      {/* Credential Details Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Award size={14} className="text-[#26BCEE]" /> Credential Verification
          </span>
          <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            PSARA Certified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <p className="text-slate-400 text-[10px]">Staff Name</p>
            <p className="font-bold text-slate-900 truncate">{name}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px]">Badge Number</p>
            <p className="font-mono font-bold text-[#1A2B79]">{employeeCode}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px]">Role / Duty</p>
            <p className="font-semibold text-slate-800 truncate">{designation}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px]">Blood Group</p>
            <p className="font-bold text-rose-600 flex items-center gap-1">
              <Heart size={11} className="fill-rose-600" /> {bloodGroup}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-400 text-[10px]">Assigned Site</p>
            <p className="font-medium text-slate-800 flex items-center gap-1">
              <Building size={11} className="text-slate-500" /> {siteName}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck size={12} className="text-emerald-600" /> Tamper-evident 2D Matrix
          </span>
          <span className="font-mono text-slate-400">Ver. 2026.1</span>
        </div>
      </div>
    </div>
  );
}
