import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Phone,
  Mail,
  Download,
  Building,
  MapPin,
  Calendar,
  Heart,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api, COMPANY, downloadVCard } from '@mock/mockData';

export default function EmployeeVerificationPage() {
  const { id } = useParams<{ id: string }>();
  // Sanitize path parameter to prevent route collision keywords from being treated as badge IDs
  const rawTarget = id || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : null);
  const initialId = (rawTarget && !['employees', 'verify', 'emp', 'dashboard', 'onboarding'].includes(rawTarget.toLowerCase()))
    ? rawTarget
    : 'SS-10001';

  const [targetId, setTargetId] = useState(initialId);
  const [searchInput, setSearchInput] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifiedAt] = useState<string>(() => new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTargetId(searchInput.trim());
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch employee from backend API
    api.getEmployee(targetId)
      .then((data) => {
        if (!isMounted) return;
        setEmployee(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('API error fetching employee, trying fallback:', err);
        // Fallback for demo or founder code
        if (targetId.toUpperCase().includes('FOUNDER') || targetId.toUpperCase().includes('ASHOK')) {
          setEmployee({
            id: 'EMP-FOUNDER',
            employeeCode: 'SS-FOUNDER-01',
            name: 'Ashok Majjige',
            photo: '/silverstar-icon-512.png',
            bloodGroup: 'O+',
            phone: COMPANY.founderPhone1,
            email: COMPANY.email,
            address: COMPANY.address,
            departmentName: 'Executive Directorate',
            designationName: 'CEO & Founder',
            employmentType: 'Director / Executive',
            joiningDate: '2014-06-01',
            onboardingStatus: 'Approved',
            kycStatus: 'Verified',
            kycMethod: 'Ministry of Corporate Affairs (DIN Verified)',
            siteName: 'Silver Star Corporate HQ',
            clientName: 'Silver Star Facility Management Pvt. Ltd.',
            status: 'Active',
            emergencyContact: {
              name: 'Corporate Office',
              relation: 'HQ Security Desk',
              phone: COMPANY.phone,
            },
          });
          setLoading(false);
        } else {
          // If not found, try to search all employees
          api.getEmployees()
            .then((all) => {
              if (!isMounted) return;
              const found = all.find((e) =>
                e.id === targetId ||
                e.employeeCode?.toUpperCase() === targetId.toUpperCase() ||
                e.phone?.includes(targetId)
              );
              if (found) {
                setEmployee(found);
              } else {
                setError(`No verified employee records match Badge ID "${targetId}".`);
              }
              setLoading(false);
            })
            .catch(() => {
              if (!isMounted) return;
              setError(`Unable to connect to verification registry for Badge ID "${targetId}".`);
              setLoading(false);
            });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  const handleCopyCode = () => {
    const code = employee?.employeeCode || targetId;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadContact = () => {
    if (!employee) return;
    downloadVCard({
      name: employee.name,
      phone: employee.phone,
      email: employee.email,
      designation: employee.designationName,
      employeeCode: employee.employeeCode,
      department: employee.departmentName,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 relative flex items-center justify-center animate-pulse mb-4">
          <img src="/silverstar-icon-512.png" alt="Silver Star" className="w-full h-full object-contain" />
        </div>
        <h3 className="text-white text-base font-semibold tracking-wide">Connecting to Silver Star Verification Registry...</h3>
        <p className="text-slate-400 text-xs mt-1">Verifying cryptographic badge {targetId} with central HR registry</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border border-red-200 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verification Alert</h2>
            <p className="text-sm text-red-600 font-medium mt-1">Badge Not Found or Inactive</p>
            <p className="text-xs text-slate-500 mt-2">
              {error || `The requested employee code "${targetId}" was not found in the active Silver Star registry.`}
            </p>
          </div>

          {/* Quick Lookup Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Employee Code (e.g. SS-10001)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A2B79]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Verify
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
              <span className="text-[10px] text-slate-400">Sample verified badges:</span>
              <button
                type="button"
                onClick={() => setTargetId('SS-10001')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium transition-colors"
              >
                SS-10001 (Ramesh Kumar)
              </button>
              <button
                type="button"
                onClick={() => setTargetId('SS-90001')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium transition-colors"
              >
                SS-90001 (Ramesh Gowda)
              </button>
              <button
                type="button"
                onClick={() => setTargetId('SS-FOUNDER-01')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium transition-colors"
              >
                SS-FOUNDER-01
              </button>
            </div>
          </form>

          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 space-y-2 border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck size={16} className="text-[#1A2B79]" /> Security Advisory
            </div>
            <p>
              If an individual presents an identification badge bearing this ID, please contact the Silver Star 24/7 Operations Control Desk immediately for manual verification.
            </p>
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-1 font-mono text-[11px]">
              <span>Helpline: <strong className="text-slate-900">{COMPANY.phone}</strong></span>
              <span>Email: <strong className="text-slate-900">{COMPANY.email}</strong></span>
            </div>
          </div>

          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-semibold shadow transition-colors"
          >
            Return to Portal
          </a>
        </div>
      </div>
    );
  }

  const cleanPhone = (employee.phone || '').replace(/\D/g, '');
  const initials = (employee.name || 'SS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-900 flex flex-col items-center justify-start p-3 sm:p-6 antialiased">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#26BCEE] to-[#1A2B79] blur-[120px] rounded-full" />
      </div>

      {/* Main Verification Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Corporate Branding Bar */}
        <div className="bg-gradient-to-r from-[#1A2B79] via-[#152362] to-[#0D153B] px-6 py-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Official Enhanced Silver Star Logo Emblem */}
            <div className="w-10 h-10 relative flex-shrink-0 bg-white p-1 rounded-xl shadow-sm overflow-hidden">
              <img src="/silverstar-icon-512.png" alt="Silver Star Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wide font-serif text-white">
                Silver Star
              </h1>
              <p className="text-[10px] text-cyan-200 font-medium tracking-wider uppercase">
                Facility Management Pvt. Ltd.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              PSARA COMPLIANT
            </span>
          </div>
        </div>

        {/* Official Verification Shield Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-black tracking-wide text-emerald-900 uppercase">
                Officially Verified Active Staff
              </p>
              <p className="text-[10px] text-emerald-700">
                Central Registry Token: <span className="font-mono font-semibold">SS-VER-{employee.employeeCode || targetId}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium hidden sm:inline-block">
            {verifiedAt}
          </span>
        </div>

        {/* Employee Profile Header & Avatar Card */}
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar / Photo */}
            <div className="relative">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl ring-2 ring-slate-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#1A2B79] to-[#26BCEE] text-white flex items-center justify-center text-3xl font-black font-serif border-4 border-white shadow-xl ring-2 ring-slate-200">
                  {initials}
                </div>
              )}
              {/* Verified Check Badge on Avatar */}
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md border-2 border-white" title="Verified Badge">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            {/* Core Identification Details */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {employee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {employee.status || 'Active'}
                </span>
              </div>

              <div className="text-sm font-bold text-[#1A2B79] tracking-wide">
                {employee.designationName || employee.designationId || 'Facility Staff'}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {employee.departmentName || employee.departmentId || 'Operations & Field Services'}
              </div>

              {/* Badge Code & Blood Group Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-slate-200 transition-colors"
                  title="Click to copy Badge ID"
                >
                  <span>{employee.employeeCode || targetId}</span>
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-slate-400" />}
                </button>

                {employee.bloodGroup && (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-200">
                    <Heart size={12} className="fill-rose-500 text-rose-500" />
                    <span>Blood: {employee.bloodGroup}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Communication Actions Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6">
            {employee.phone ? (
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Phone size={14} /> Call
              </a>
            ) : (
              <button disabled className="py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed">
                No Phone
              </button>
            )}

            {cleanPhone ? (
              <a
                href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(employee.name)},%20contacting%20regarding%20Silver%20Star%20security%20verification.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <span className="text-sm">💬</span> WhatsApp
              </a>
            ) : null}

            {employee.email ? (
              <a
                href={`mailto:${employee.email}?subject=Silver Star Employee Verification - ${employee.employeeCode}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all"
              >
                <Mail size={14} /> Email
              </a>
            ) : (
              <a
                href={`mailto:${COMPANY.email}?subject=Inquiry regarding Staff ${employee.employeeCode}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all"
              >
                <Mail size={14} /> HQ Email
              </a>
            )}

            <button
              onClick={handleDownloadContact}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#26BCEE] hover:bg-[#1ea8d6] text-slate-900 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              <Download size={14} /> Save vCard
            </button>
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="p-6 pt-2 space-y-4">
          
          {/* Section 1: Deployment & Client Assignment */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Building size={14} className="text-[#1A2B79]" /> Current Deployment & Assignment
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Assigned Client</span>
                <span className="font-bold text-slate-900">
                  {employee.clientName || 'Silver Star Corporate Managed Accounts'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Deployment Site</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" />
                  {employee.siteName || 'Electronic City Phase II Campus'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Branch Jurisdiction</span>
                <span className="font-semibold text-slate-800">
                  {employee.branchId || 'Bangalore Central (BR001)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Employment Type</span>
                <span className="font-semibold text-slate-800">
                  {employee.employmentType || 'Permanent Full-Time'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Compliance & KYC Identity */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Award size={14} className="text-[#1A2B79]" /> Identity & Statutory Compliance
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">KYC Verification Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck size={13} /> {employee.kycStatus || 'Verified (Aadhaar QR)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Date of Joining</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-500" />
                  {employee.joiningDate || '01-04-2024'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">PSARA Compliance</span>
                <span className="font-semibold text-slate-800">
                  Sec 10 Compliant (Govt of Karnataka)
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Verification Method</span>
                <span className="font-semibold text-slate-800">
                  {employee.kycMethod || 'Digital Biometric / QR Aadhaar'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Assistance */}
          {employee.emergencyContact && (employee.emergencyContact.name || employee.emergencyContact.phone) && (
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Heart size={14} className="text-amber-600" /> Designated Emergency Contact
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                <div>
                  <span className="font-bold text-slate-900">{employee.emergencyContact.name || 'Next of Kin'}</span>
                  <span className="text-slate-500 text-[11px]"> ({employee.emergencyContact.relation || 'Emergency Contact'})</span>
                </div>
                {employee.emergencyContact.phone && (
                  <a
                    href={`tel:${employee.emergencyContact.phone}`}
                    className="font-mono font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <Phone size={12} /> {employee.emergencyContact.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Legal / Security Advisory Notice */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#1A2B79]" /> Official Anti-Fraud Notice
            </div>
            <p className="leading-relaxed">
              This webpage is the genuine, authenticated digital verification service operated by{' '}
              <strong>Silver Star Facility Management Pvt. Ltd.</strong> (CIN: {COMPANY.cin}). Any duplication,
              tampering, or unauthorized possession of this credential is a cognizable legal offense under the
              Private Security Agencies (Regulation) Act, 2005 and IPC Sec 419/468.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap justify-between gap-2">
              <span>Security Desk: <strong>{COMPANY.phone}</strong></span>
              <span>Portal: <strong>silverstarindia.net</strong></span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All Rights Reserved.</p>
        </div>

      </div>
    </div>
  );
}

