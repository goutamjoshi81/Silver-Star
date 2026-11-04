import { useState } from 'react'
import {
  DEPARTMENTS, DESIGNATIONS, BRANCHES, SHIFTS, SITES, CLIENTS, EMPLOYEES, COMPANY, api
} from '@mock/mockData'
import {
  User, MapPin, FileText, ShieldCheck, CheckCircle2, CreditCard,
  QrCode, Key, Truck, ChevronRight, ChevronLeft, Upload, Check,
  AlertTriangle, Phone, Mail, Building2, Download, Printer, RefreshCw, X
} from 'lucide-react'
import SilverStarIDCard from './SilverStarIDCard'

const NINE_STEPS = [
  { num: 1, title: 'Registration', desc: 'Job & branch mapping' },
  { num: 2, title: 'Demographics', desc: 'Personal & contact info' },
  { num: 3, title: 'Documents', desc: 'Certificates & identity' },
  { num: 4, title: 'eKYC Verification', desc: 'Digital biometric/QR' },
  { num: 5, title: 'HR Review', desc: 'Compliance & salary' },
  { num: 6, title: 'ID Generation', desc: 'Official SS code' },
  { num: 7, title: 'QR ID Card', desc: 'Physical & digital badge' },
  { num: 8, title: 'Provisioning', desc: 'App access & SMS dispatch' },
  { num: 9, title: 'Ops Handover', desc: 'Site & shift allocation' },
]

interface WizardProps {
  onClose: () => void
  onSuccess: (newEmployee: any) => void
}

export default function OnboardingWizard({ onClose, onSuccess }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Registration State
  const [branchId, setBranchId] = useState('BR001')
  const [departmentId, setDepartmentId] = useState('DEP002')
  const [designationId, setDesignationId] = useState('DES001')
  const [employmentType, setEmploymentType] = useState('Permanent')
  const [joiningDate, setJoiningDate] = useState('2026-11-05')
  const [recruiterName, setRecruiterName] = useState('Pooja Saxena (HR Exec)')

  // Step 2: Demographics State
  const [fullName, setFullName] = useState('Vikramaditya Singh')
  const [dob, setDob] = useState('1994-06-12')
  const [gender, setGender] = useState('Male')
  const [maritalStatus, setMaritalStatus] = useState('Married')
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [primaryPhone, setPrimaryPhone] = useState('+91 98450 11223')
  const [altPhone, setAltPhone] = useState('+91 98450 99887')
  const [email, setEmail] = useState('vikram.singh@silverstarindia.net')
  const [currentAddress, setCurrentAddress] = useState('Flat 204, Royal Palms, Electronic City Phase 1')
  const [permanentAddress, setPermanentAddress] = useState('Vill & PO Baroli, Dist. Rohtak, Haryana')
  const [pinCode, setPinCode] = useState('560100')
  const [emergencyName, setEmergencyName] = useState('Sunita Singh')
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse')
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98450 88776')
  const [emergencyAltAddress, setEmergencyAltAddress] = useState('Rohtak, Haryana')

  // Step 3: Documents State
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: string; status: string }>>({
    photoId: { name: 'aadhaar_front_back_scan.pdf', size: '1.4 MB', status: 'Uploaded' },
    addressProof: { name: 'utility_electricity_bill.pdf', size: '840 KB', status: 'Uploaded' },
    educationCert: { name: 'matriculation_10th_certificate.pdf', size: '1.1 MB', status: 'Uploaded' },
    policeCert: { name: 'ksp_police_verification_clearance.pdf', size: '2.1 MB', status: 'Verified' },
    bankPassbook: { name: 'sbi_bank_passbook_cancelled_cheque.pdf', size: '920 KB', status: 'Uploaded' },
  })

  // Step 4: eKYC State
  const [kycMethod, setKycMethod] = useState<'Aadhaar Secure QR' | 'DigiLocker' | 'Physical'>('Aadhaar Secure QR')
  const [kycScanning, setKycScanning] = useState(false)
  const [kycVerified, setKycVerified] = useState(false)
  const [kycRef, setKycRef] = useState('UIDAI-QR-2026-99214A')
  const [kycOfficer, setKycOfficer] = useState('Kavitha Rao (Compliance Officer)')

  // Step 5: HR Review State
  const [statutoryChecked, setStatutoryChecked] = useState({
    ageVerified: true,
    policeCleared: true,
    medicalFitness: true,
    pfEsiEligible: true,
  })
  const [bankName, setBankName] = useState('State Bank of India')
  const [accountHolder, setAccountHolder] = useState('Vikramaditya Singh')
  const [accountNumber, setAccountNumber] = useState('38920194821')
  const [ifsc, setIfsc] = useState('SBIN0004123')
  const [basicSalary, setBasicSalary] = useState('18500')
  const [grossCtc, setGrossCtc] = useState('23400')
  const [pfUan, setPfUan] = useState('101928374650')
  const [esiNumber, setEsiNumber] = useState('310098273645001')

  // Step 6: Generated ID
  const [generatedEmpCode, setGeneratedEmpCode] = useState('SS-10008')

  // Step 7: ID Card State
  const [idCardReady, setIdCardReady] = useState(true)

  // Step 8: Provisioning State
  const [smsDispatched, setSmsDispatched] = useState(false)
  const [appUsername, setAppUsername] = useState('SS-10008')
  const [tempPassword, setTempPassword] = useState('SilverStar@2026')

  // Step 9: Operations Handover
  const [handoverClientId, setHandoverClientId] = useState('CLI001')
  const [handoverSiteId, setHandoverSiteId] = useState('SITE001')
  const [handoverShiftId, setHandoverShiftId] = useState('SHF001')
  const [handoverSupervisorId, setHandoverSupervisorId] = useState('EMP003')
  const [deploymentDate, setDeploymentDate] = useState('2026-11-06')
  const [isHandedOver, setIsHandedOver] = useState(false)

  // Handlers
  const handleSimulateKyc = () => {
    setKycScanning(true)
    setTimeout(() => {
      setKycScanning(false)
      setKycVerified(true)
      setKycRef(`UIDAI-QR-${Math.floor(100000 + Math.random() * 900000)}`)
    }, 1500)
  }

  const handleFinishHandover = async () => {
    setIsHandedOver(true)
    const newEmp = {
      employeeCode: generatedEmpCode,
      name: fullName,
      dob: dob || null,
      gender,
      maritalStatus,
      bloodGroup,
      phone: primaryPhone,
      email: email || `${generatedEmpCode.toLowerCase()}@silverstarindia.net`,
      address: currentAddress,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      departmentId,
      designationId,
      employmentType,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      onboardingStatus: 'Approved',
      kycStatus: 'Verified',
      kycMethod,
      deployedSiteId: handoverSiteId || null,
      deployedClientId: handoverClientId || null,
      branchId,
      status: 'Active',
      bankName,
      accountNumber,
      ifsc,
      pfNumber: pfUan || null,
    }

    try {
      const savedEmp = await api.createEmployee(newEmp)
      
      // Auto-deploy if site/client selected
      if (handoverSiteId && handoverClientId) {
        await api.createDeployment({
          siteId: handoverSiteId,
          clientId: handoverClientId,
          employeeId: savedEmp.id,
          shiftId: handoverShiftId,
          startDate: deploymentDate || new Date().toISOString().split('T')[0],
          deployedBy: 'HR Onboarding Wizard',
        }).catch(err => console.warn('Deployment save error:', err))
      }

      // Auto-save uploaded documents to database
      if (uploadedDocs.photoId?.name) {
        await api.uploadDocument({
          employeeId: savedEmp.id,
          documentType: 'Aadhaar Card',
          fileName: uploadedDocs.photoId.name,
          fileUrl: '#',
        }).catch(() => {})
      }
      if (uploadedDocs.policeCert?.name) {
        await api.uploadDocument({
          employeeId: savedEmp.id,
          documentType: 'Police Verification',
          fileName: uploadedDocs.policeCert.name,
          fileUrl: '#',
        }).catch(() => {})
      }

      onSuccess(savedEmp)
    } catch (err: any) {
      console.error('Failed to save to PostgreSQL database:', err)
      // Still notify user or fallback
      onSuccess(newEmp)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
        
        {/* Wizard Modal Top Header */}
        <div className="bg-[#202B75] px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <User size={20} className="text-[#26BCEE]" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold tracking-wide">
                Employee Onboarding Engine — 9-Step Standard Protocol
              </h2>
              <p className="text-xs text-[#26BCEE]">
                Silver Star Facility Management Pvt. Ltd. · End-to-End Workforce Provisioning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 9-Step Horizontal Progress Stepper */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex-shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {NINE_STEPS.map((s) => {
              const isPast = s.num < currentStep
              const isCurrent = s.num === currentStep
              return (
                <div
                  key={s.num}
                  onClick={() => s.num <= currentStep && setCurrentStep(s.num)}
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isCurrent ? 'opacity-100' : isPast ? 'opacity-80 hover:opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#202B75] text-white ring-4 ring-[#26BCEE]/30'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPast ? <Check size={14} /> : s.num}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#202B75]' : 'text-gray-700'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-none">{s.desc}</p>
                  </div>
                  {s.num < 9 && <ChevronRight size={14} className="text-gray-300 ml-1" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================================= */}
          {/* STEP 1: EMPLOYEE REGISTRATION */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">1</span>
                  Step 1: Employee Registration & Branch Assignment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Establish corporate organizational hierarchy, branch jurisdiction, and statutory role mapping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Operating Branch *</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Service Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Designation / Role *</label>
                  <select
                    value={designationId}
                    onChange={(e) => setDesignationId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employment Cadre / Type *</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  >
                    <option value="Permanent">Permanent Payroll Staff</option>
                    <option value="Contract">Fixed Term Contract (FTC)</option>
                    <option value="Probation">Probationary Trainee (6 Months)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Date of Joining *</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Recruitment Officer / Origin *</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#202B75] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Compliance Standard:</strong> Registering the candidate initializes the mandatory 9-step audit trail required by Silver Star's ISO 9001 Facility Management SLA and PSARA (Private Security Agencies Regulation Act) statutory guidelines.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DEMOGRAPHIC & PROFILE CAPTURE */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">2</span>
                  Step 2: Demographic & Profile Capture
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Capture full legal identification, emergency kin, blood group and multi-point residence coordinates.
                </p>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Full Legal Name (as per Govt ID) *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-bold text-red-600 focus:ring-2 focus:ring-[#202B75]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marital Status *</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs"
                  >
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Primary Mobile (for OTP & App) *</label>
                  <input
                    type="text"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Alternate Phone / Landline</label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Official / Personal Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Official Photograph Upload</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1.5 rounded border border-gray-200">
                      vikram_portrait.jpg
                    </span>
                    <button className="text-[10px] text-[#26BCEE] hover:underline font-bold">Replace</button>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Current Residential Address (Deployment City) *</label>
                  <textarea
                    rows={2}
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Permanent Hometown Address (as per Aadhaar/Domicile) *</label>
                  <textarea
                    rows={2}
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Emergency Kin */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 text-xs">
                <h4 className="font-bold text-[#202B75] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Phone size={13} className="text-red-500" /> Statutory Emergency Kin Contact (Mandatory for Field Deployment)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">Kin Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">Emergency Phone Number</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs font-mono font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[11px] mb-1">Kin Alternative City/Address</label>
                    <input
                      type="text"
                      value={emergencyAltAddress}
                      onChange={(e) => setEmergencyAltAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DOCUMENT COLLECTION */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">3</span>
                  Step 3: Document Collection & Statutory File Archival
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Collect and index mandatory government proofs, police clearance certificates and education records.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'photoId', label: '1. Government Photo ID (Aadhaar / Voter ID / Passport)', required: true },
                  { key: 'addressProof', label: '2. Permanent Residential Address Proof (Electricity / Domicile)', required: true },
                  { key: 'educationCert', label: '3. Educational Qualification (10th / 12th / ITI Certificate)', required: true },
                  { key: 'policeCert', label: '4. Police Verification Clearance Certificate (PSARA Section 10)', required: true },
                  { key: 'bankPassbook', label: '5. Bank Passbook Copy / Cancelled Cheque (for Direct Benefit Transfer)', required: true },
                ].map((item) => {
                  const doc = uploadedDocs[item.key]
                  return (
                    <div
                      key={item.key}
                      className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:border-[#202B75]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.label}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {doc?.name} ({doc?.size})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 size={12} /> {doc?.status || 'Uploaded'}
                        </span>
                        <button
                          onClick={() => alert(`Previewing ${doc?.name}...`)}
                          className="text-[11px] text-[#202B75] hover:underline font-semibold"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Drag & Drop additional certifications (e.g. Fire Safety, First Aid, CPR)</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Supports PDF, JPG, PNG up to 10MB per document</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DIGITAL eKYC VERIFICATION */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">4</span>
                  Step 4: Digital eKYC Verification Simulation
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify candidate identity via Aadhaar Secure QR offline scan or DigiLocker institutional vault.
                </p>
              </div>

              {/* Method Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'Aadhaar Secure QR' as const, title: 'Aadhaar Secure QR (Offline)', cost: '₹0 Net Cost', desc: 'Fast, secure offline cryptographic QR scan from mAadhaar app. Zero number storage.' },
                  { id: 'DigiLocker' as const, title: 'DigiLocker Institutional Vault', cost: '₹0 Net Cost', desc: 'Candidate authorizes institutional pull of verified identity from government vault.' },
                  { id: 'Physical' as const, title: 'Manual Physical Attestation', cost: 'Fallback Mode', desc: 'HR officer physically stamps original documents with gazetted verification notes.' },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setKycMethod(m.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      kycMethod === m.id
                        ? 'border-[#26BCEE] bg-[#26BCEE]/5 shadow-sm ring-2 ring-[#26BCEE]/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-[#202B75]">{m.title}</span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        {m.cost}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* Simulation Action Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live eKYC Engine Simulator ({kycMethod})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Candidate: <strong>{fullName}</strong> · Aadhaar Masked: <span className="font-mono">•••• •••• 4521</span>
                  </p>
                </div>

                {!kycVerified ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleSimulateKyc}
                      disabled={kycScanning}
                      className="px-6 py-3 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {kycScanning ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Scanning Cryptographic QR Code...</span>
                        </>
                      ) : (
                        <>
                          <QrCode size={16} />
                          <span>Trigger Cryptographic eKYC Scan</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400">
                      * Demo simulation: verifies name, DOB and biometric hash in real time without storing UIDAI raw numbers.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-lg mx-auto text-left space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 size={16} />
                      <span>Cryptographic Identity Verified & Signature Validated</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 font-mono pt-1 border-t border-emerald-200/60">
                      <div>Ref Code: <strong>{kycRef}</strong></div>
                      <div>Timestamp: <strong>02-Nov-2026 10:20 IST</strong></div>
                      <div>Masked UID: <strong>•••• •••• 4521</strong></div>
                      <div>Officer: <strong>{kycOfficer}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: HR REVIEW & APPROVAL */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">5</span>
                  Step 5: HR Review, Statutory Compliance & Salary Setup
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review mandatory statutory compliances, bank account details, and establish PF/ESI pay structures.
                </p>
              </div>

              {/* Statutory Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'ageVerified', label: 'Age >= 18 Verified' },
                  { key: 'policeCleared', label: 'Police Verification Clean' },
                  { key: 'medicalFitness', label: 'Medical Fitness Cleared' },
                  { key: 'pfEsiEligible', label: 'PF & ESI Statutory Covered' },
                ].map((item) => (
                  <div key={item.key} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-emerald-900 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Bank & PF Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-mono font-semibold text-[#202B75]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: EMPLOYEE ID GENERATION */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">6</span>
                  Step 6: Official Employee Code Generation
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated issuance of company alphanumeric identification number and database ledger entry.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#202B75] to-[#161f56] rounded-2xl p-6 text-white text-center space-y-4 max-w-lg mx-auto shadow-xl">
                <p className="text-xs text-[#26BCEE] font-bold uppercase tracking-widest">
                  Silver Star Employee Identification Code
                </p>
                <div className="text-4xl font-extrabold font-mono tracking-widest text-white bg-white/10 py-3 rounded-xl border border-white/20">
                  {generatedEmpCode}
                </div>
                <div className="text-xs text-white/80 space-y-1">
                  <p>Candidate: <strong className="text-white">{fullName}</strong></p>
                  <p>Designation: <strong className="text-[#26BCEE]">{DESIGNATIONS.find(d => d.id === designationId)?.name}</strong></p>
                  <p>Department: <strong>{DEPARTMENTS.find(d => d.id === departmentId)?.name}</strong></p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle2 size={13} /> Unique Permanent Alphanumeric Identifier Allocated
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: DIGITAL QR ID CARD GENERATION */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">7</span>
                  Step 7: Official Silver Star QR Identity Card Rendering
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-resolution photo ID badge with encrypted QR code for corporate campus gate clearance.
                </p>
              </div>

              {/* Official Silver Star Smart ID Card Component */}
              <div className="flex justify-center py-2">
                <SilverStarIDCard
                  name={fullName.toUpperCase() || 'NEW EMPLOYEE'}
                  designation={DESIGNATIONS.find(d => d.id === designationId)?.name || 'Security Officer'}
                  employeeCode={generatedEmpCode}
                  phone1={primaryPhone || '+91 9620000494'}
                  phone2={altPhone || '+91 9620008783'}
                  bloodGroup={bloodGroup}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => alert(`Demo: Downloading ID Card PDF for ${generatedEmpCode}...`)}
                  className="px-4 py-2 bg-[#202B75] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#161f56]"
                >
                  <Download size={14} /> Download Printable PDF
                </button>
                <button
                  onClick={() => alert('Demo: Sending ID badge to badge thermal printer...')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200"
                >
                  <Printer size={14} /> Send to Card Printer
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8: ACCOUNT PROVISIONING */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">8</span>
                  Step 8: Employee Mobile App Account Provisioning
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Generate self-service mobile app login credentials and dispatch welcome notification via SMS.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Key size={16} className="text-[#202B75]" /> Provisioned Mobile App Access
                </h4>

                <div className="space-y-2 font-mono">
                  <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Login ID / Code:</span>
                    <span className="font-bold text-[#202B75]">{appUsername}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Temporary Password:</span>
                    <span className="font-bold text-slate-800">{tempPassword}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400">Registered Mobile:</span>
                    <span className="font-bold text-slate-800">{primaryPhone}</span>
                  </div>
                </div>

                {!smsDispatched ? (
                  <button
                    onClick={() => setSmsDispatched(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Mail size={14} /> Dispatch Credentials via SMS (Demo)
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>SMS credentials dispatched to {primaryPhone} via DLT template.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 9: OPERATIONS HANDOVER */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#202B75] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#202B75]/10 text-[#202B75] flex items-center justify-center text-xs">9</span>
                  Step 9: Operations Handover & Field Deployment Roster
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete the HR-to-Operations handover by deploying the onboarded staff to an active client facility.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Client Corporate Account *</label>
                  <select
                    value={handoverClientId}
                    onChange={(e) => setHandoverClientId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#202B75]"
                  >
                    {CLIENTS.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deployment Facility / Site *</label>
                  <select
                    value={handoverSiteId}
                    onChange={(e) => setHandoverSiteId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#202B75]"
                  >
                    {SITES.filter(s => s.clientId === handoverClientId).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.geofenceRadius}m Geofence)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Working Shift *</label>
                  <select
                    value={handoverShiftId}
                    onChange={(e) => setHandoverShiftId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reporting Area Supervisor *</label>
                  <select
                    value={handoverSupervisorId}
                    onChange={(e) => setHandoverSupervisorId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs"
                  >
                    {EMPLOYEES.filter(e => e.designationId === 'DES002' || e.designationId === 'DES004').map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.employeeCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">First Day On Duty *</label>
                  <input
                    type="date"
                    value={deploymentDate}
                    onChange={(e) => setDeploymentDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Ready to Complete Handover to Operations
                </p>
                <p>
                  Upon clicking <strong>Complete Handover</strong>, employee <strong>{generatedEmpCode} ({fullName})</strong> will immediately be:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-700 pt-1">
                  <li>Marked as <strong>Approved & Onboarded</strong> in Super Admin & HR directories</li>
                  <li>Deployed to <strong>{SITES.find(s => s.id === handoverSiteId)?.name}</strong> on the live Operations roster</li>
                  <li>Enabled for <strong>Geofenced Punch-In</strong> on the Employee Mobile App</li>
                  <li>Included in the Client Mobile App headcount for <strong>{CLIENTS.find(c => c.id === handoverClientId)?.name}</strong></li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(c => c - 1) : onClose()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={14} />
            {currentStep > 1 ? 'Previous Step' : 'Cancel'}
          </button>

          <div className="text-xs font-bold text-gray-500">
            Step {currentStep} of 9
          </div>

          {currentStep < 9 ? (
            <button
              onClick={() => setCurrentStep(c => c + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#202B75] hover:bg-[#161f56] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#202B75]/20"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinishHandover}
              disabled={isHandedOver}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{isHandedOver ? 'Handing Over to Ops...' : 'Complete 9-Step Onboarding'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

