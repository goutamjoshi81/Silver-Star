import { useState } from 'react'
import { EMPLOYEES, SITES, SHIFTS, ATTENDANCE_TODAY } from '@mock/mockData'
import {
  MapPin, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
  Navigation, RefreshCw, XCircle, ChevronRight, Radio
} from 'lucide-react'

export default function DutyHome() {
  const emp = EMPLOYEES.find(e => e.id === 'EMP001')!
  const site = SITES.find(s => s.id === emp.deployedSiteId)!
  const supervisor = EMPLOYEES.find(e => e.id === site.supervisorId)
  const shift = SHIFTS[0] // Morning shift

  // State
  const [punchedIn, setPunchedIn] = useState(true)
  const [punchTime, setPunchTime] = useState('08:52 AM')
  const [isVerifying, setIsVerifying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulateOutside, setSimulateOutside] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultSuccess, setResultSuccess] = useState(true)

  const handlePunchAction = () => {
    setIsVerifying(true)
    setCurrentStep(1)

    // Step 1: GPS Acquisition (800ms)
    setTimeout(() => {
      setCurrentStep(2)
      // Step 2: Anti-Spoofing (800ms)
      setTimeout(() => {
        setCurrentStep(3)
        // Step 3: Distance Calc (800ms)
        setTimeout(() => {
          setCurrentStep(4)
          // Step 4: Outcome (600ms)
          setTimeout(() => {
            setIsVerifying(false)
            if (simulateOutside) {
              setResultSuccess(false)
            } else {
              setResultSuccess(true)
              const now = new Date()
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              if (punchedIn) {
                setPunchedIn(false)
                setPunchTime(timeStr)
              } else {
                setPunchedIn(true)
                setPunchTime(timeStr)
              }
            }
            setShowResultModal(true)
          }, 600)
        }, 800)
      }, 800)
    }, 800)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Shift Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#26BCEE]">Current Shift</span>
          <h2 className="text-sm font-bold text-slate-900 mt-0.5">{shift.name}</h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{shift.startTime} – {shift.endTime} (IST)</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            punchedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${punchedIn ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {punchedIn ? 'ON DUTY' : 'OFF DUTY'}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Punch: {punchTime}</p>
        </div>
      </div>

      {/* Assigned Site & Supervisor Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#202B75] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs text-slate-900">{site.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{site.address}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span>Geofence: <strong className="text-slate-700">{site.geofenceRadius}m</strong></span>
              <span>•</span>
              <span>Supervisor: <strong className="text-slate-700">{supervisor?.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Punch Action Button Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center space-y-4">
        <div>
          <p className="text-xs font-bold text-[#202B75] uppercase tracking-wider">Geofenced Attendance</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isVerifying ? 'Verifying coordinates with GPS satellites...' :
             punchedIn ? 'Tap button below to record shift departure' : 'Tap button below to record shift arrival'}
          </p>
        </div>

        {/* Big Animated Punch Button */}
        <div className="py-2 flex justify-center">
          <button
            onClick={handlePunchAction}
            disabled={isVerifying}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center font-bold text-white transition-all transform active:scale-95 shadow-xl relative ${
              isVerifying
                ? 'bg-slate-400 cursor-not-allowed animate-pulse'
                : punchedIn
                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-rose-500/30 ring-8 ring-rose-50'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/30 ring-8 ring-emerald-50'
            }`}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={32} className="animate-spin mb-1" />
                <span className="text-xs uppercase tracking-wider">Verifying</span>
                <span className="text-[10px] font-normal text-white/80">Step {currentStep}/4</span>
              </>
            ) : punchedIn ? (
              <>
                <Clock size={32} className="mb-1" />
                <span className="text-sm uppercase tracking-wider">PUNCH OUT</span>
                <span className="text-[10px] font-normal text-white/90">End Shift Duty</span>
              </>
            ) : (
              <>
                <Navigation size={32} className="mb-1" />
                <span className="text-sm uppercase tracking-wider">PUNCH IN</span>
                <span className="text-[10px] font-normal text-white/90">Begin Shift Duty</span>
              </>
            )}
          </button>
        </div>

        {/* GPS Verification Multi-Step Pipeline Indicator */}
        {isVerifying && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span className={currentStep >= 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                1. GPS Triangulation: Lat 12.8456, Lng 77.6603 (±4m)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={currentStep >= 2 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                2. Anti-Spoofing Check: Mock Location = False
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={currentStep >= 3 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                3. Spherical Math: {simulateOutside ? '185m from center' : '38m from center'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={currentStep >= 4 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                4. Perimeter Evaluation: Boundary Limit {site.geofenceRadius}m
              </span>
            </div>
          </div>
        )}

        {/* Prototype Demo Toggle: Outside Geofence Test */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Radio size={12} className="text-[#202B75]" />
            Test Boundary Breach Mode:
          </span>
          <button
            onClick={() => setSimulateOutside(!simulateOutside)}
            className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all ${
              simulateOutside
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {simulateOutside ? 'Outside Site (185m)' : 'Inside Site (38m)'}
          </button>
        </div>
      </div>

      {/* Outcome Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              resultSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {resultSuccess ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>

            <div>
              <h3 className={`text-base font-bold ${resultSuccess ? 'text-emerald-700' : 'text-rose-600'}`}>
                {resultSuccess ? 'Attendance Verified & Logged' : 'Punch Blocked: Outside Geofence'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {resultSuccess
                  ? `Recorded successfully at ${site.name} at ${punchTime}.`
                  : `Your device is 185 meters from ${site.name}. Perimeter boundary is ${site.geofenceRadius}m. Please step inside the premises.`}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-left text-[11px] space-y-1 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span>12.8456° N, 77.6603° E</span>
              </div>
              <div className="flex justify-between">
                <span>GPS Accuracy:</span>
                <span className="text-emerald-600">±4.2 meters</span>
              </div>
              <div className="flex justify-between">
                <span>Mock Spoofing:</span>
                <span>Detected: None (Pass)</span>
              </div>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#202B75] text-white text-xs font-semibold hover:bg-[#161f56]"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

