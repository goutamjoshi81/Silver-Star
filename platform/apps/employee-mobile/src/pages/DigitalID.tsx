import { useState, useEffect } from 'react';
import { api, COMPANY } from '@mock/mockData';
import SilverStarIDCard from '../components/SilverStarIDCard';

interface DigitalIDProps {
  currentUser?: any;
}

export default function DigitalID({ currentUser }: DigitalIDProps) {
  const [emp, setEmp] = useState<any>(currentUser || null);

  useEffect(() => {
    let isMounted = true;
    const targetEmpId = currentUser?.employeeId || currentUser?.id || currentUser?.employeeCode || 'SS-10001';

    if (currentUser?.name) {
      setEmp(currentUser);
    }

    api.getEmployee(targetEmpId)
      .then((data) => {
        if (isMounted && data) {
          setEmp(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch employee details for ID card, using local user data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const displayName = emp?.name || currentUser?.name || 'RAMESH KUMAR';
  const displayDesignation =
    emp?.designationName ||
    emp?.designation ||
    currentUser?.designationName ||
    currentUser?.role ||
    'SECURITY SUPERVISOR';
  const displayCode = emp?.employeeCode || currentUser?.employeeCode || 'SS-10001';
  const displayPhone = emp?.phone || currentUser?.phone || '+91 98765 43210';
  const displayBloodGroup = emp?.bloodGroup || currentUser?.bloodGroup || 'B+';

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-sm font-bold text-[#202B75]">Official Digital ID Badge</h2>
        <p className="text-[11px] text-slate-500">Official Silver Star smart credential for gate checkpoints</p>
      </div>

      <div className="flex justify-center">
        <SilverStarIDCard
          name={String(displayName).toUpperCase()}
          designation={String(displayDesignation).toUpperCase()}
          employeeCode={displayCode}
          phone1={displayPhone}
          phone2={COMPANY.phone}
          bloodGroup={displayBloodGroup}
          initialSide="front"
        />
      </div>
    </div>
  );
}
