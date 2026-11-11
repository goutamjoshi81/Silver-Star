import { useState, useEffect } from 'react'
import { RotateCw, Download, Printer, Phone, ExternalLink, ShieldCheck } from 'lucide-react'
import { COMPANY, generateQrCodeDataUrl, getEmployeeVerificationUrl, downloadVCard } from '@mock/mockData'

interface IDCardProps {
  name?: string
  designation?: string
  employeeCode?: string
  photo?: string | null
  phone1?: string
  phone2?: string
  bloodGroup?: string
  department?: string
  isFounder?: boolean
  initialSide?: 'front' | 'back'
}

export default function SilverStarIDCard({
  name = 'ASHOK MAJJIGE',
  designation = 'CEO & FOUNDER.',
  employeeCode = 'SS-EXEC-01',
  photo = null,
  phone1 = '+919620000494',
  phone2 = '+919620008783',
  bloodGroup = 'O+',
  department = 'Executive Management',
  isFounder = false,
  initialSide = 'front'
}: IDCardProps) {
  const [side, setSide] = useState<'front' | 'back'>(initialSide)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [imgError, setImgError] = useState(false)

  const initials = (name || 'SS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  const verificationUrl = getEmployeeVerificationUrl(employeeCode || 'SS-10001')

  useEffect(() => {
    let active = true
    generateQrCodeDataUrl(verificationUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#1A2B79', // Official Silver Star Brand Navy
        light: '#FFFFFF'
      }
    })
      .then(url => {
        if (active) setQrDataUrl(url)
      })
      .catch(err => console.error('Failed to generate verification QR code:', err))

    return () => { active = false }
  }, [verificationUrl])

  const handleDownloadVCard = () => {
    downloadVCard({
      name,
      phone: phone1,
      designation,
      employeeCode,
      department
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Front / Back Toggle Buttons */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setSide('front')}
          className={`px-3 py-1 rounded-lg transition-all ${
            side === 'front' ? 'bg-white text-[#202B75] shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Card Front
        </button>
        <button
          onClick={() => setSide('back')}
          className={`px-3 py-1 rounded-lg transition-all ${
            side === 'back' ? 'bg-white text-[#202B75] shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Card Back (QR & Details)
        </button>
        <button
          onClick={() => setSide(s => s === 'front' ? 'back' : 'front')}
          className="p-1 text-gray-500 hover:text-[#202B75] ml-1"
          title="Flip Card"
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* The Physical Card Container (Aspect Ratio ~ 85.6mm x 53.98mm) */}
      <div className="w-[300px] h-[480px] bg-white rounded-3xl p-6 shadow-2xl border border-gray-200/90 relative flex flex-col justify-between overflow-hidden transition-all duration-300">
        
        {/* ===================== FRONT SIDE ===================== */}
        {side === 'front' ? (
          <div className="h-full flex flex-col justify-between items-center py-4 animate-in fade-in duration-200 text-center">
            {/* Top Bar with RFID Badge */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <img src="/silverstar-icon-512.png" alt="Silver Star" className="w-5 h-5 object-contain" />
                <span className="text-[11px] font-black text-[#1A2B79] font-serif uppercase tracking-wider">
                  Silver Star
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#1A2B79] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                RFID · NFC
              </span>
            </div>

            {/* Employee Portrait Photo Container */}
            <div className="relative my-2">
              <div className="w-28 h-32 rounded-2xl overflow-hidden border-2 border-[#1A2B79] shadow-md ring-4 ring-[#26BCEE]/15 bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
                {photo && !imgError ? (
                  <img
                    src={photo}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A2B79] to-[#26BCEE] flex flex-col items-center justify-center text-white p-2">
                    <span className="text-2xl font-black font-mono tracking-wider">{initials}</span>
                    <span className="text-[9px] font-bold uppercase mt-1 tracking-widest opacity-80">Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Identity & Designation Details */}
            <div className="space-y-1 w-full px-2">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[260px]">
                {name}
              </p>
              <p className="text-xs font-bold text-[#1A2B79] uppercase truncate">
                {designation}
              </p>
              {department && (
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  {department}
                </p>
              )}
              <div className="pt-1.5">
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-3.5 py-1 rounded-full border border-slate-200 inline-block shadow-sm">
                  {employeeCode}
                </span>
              </div>
            </div>

            {/* Bottom Contactless / NFC Symbol */}
            <div className="w-full flex justify-between items-center text-slate-400 text-xs px-2 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1 font-semibold text-rose-600 text-[10px]">
                ❤️ {bloodGroup}
              </span>
              <div className="flex items-center gap-1 text-[#1A2B79]">
                <span className="text-[9px] font-mono font-bold">CONTACTLESS</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* ===================== BACK SIDE ===================== */
          <div className="h-full flex flex-col justify-between py-2 animate-in fade-in duration-200">
            {/* Top: Working Scannable QR Code & Contact Action */}
            <div className="flex items-start justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="text-[9px] font-semibold text-gray-500 hover:text-[#1A2B79] tracking-tight [writing-mode:vertical-lr] rotate-180 self-center cursor-pointer transition-colors p-1"
                title="Click to Download Phone Contact (.vcf)"
              >
                Scan or Click to Add Contact
              </button>

              {/* Scannable 2D Matrix QR Code */}
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="w-24 h-24 bg-white p-1 border-2 border-slate-200 hover:border-[#1A2B79] rounded-2xl shadow-sm flex items-center justify-center relative group transition-all"
                title="Scan with phone or click to open Employee Verification Page"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Scannable QR Verification code for ${employeeCode}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-[9px] text-slate-400 font-mono">
                    Generating QR...
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#1A2B79] text-white p-1 rounded-full shadow-sm text-[8px] opacity-90 group-hover:opacity-100">
                  <ExternalLink size={9} />
                </div>
              </a>
            </div>

            {/* Center: Silver Star Logo & Member Information */}
            <div className="space-y-3 py-2">
              {/* Official Enhanced Silver Star Logo */}
              <div className="flex items-center">
                <img
                  src="/silverstar-logo.png"
                  alt="Silver Star"
                  className="h-8 w-auto object-contain max-w-[190px]"
                />
              </div>

              {/* Person Identity */}
              <div className="border-t border-gray-100 pt-2 space-y-0.5">
                <p className="text-[11px] font-black tracking-wider text-slate-900 uppercase">
                  OWNED BY {name}
                </p>
                <p className="text-[10px] font-extrabold text-slate-700 tracking-wide uppercase">
                  {designation}
                </p>
                <div className="pt-1 font-mono text-[11px] font-bold text-slate-900 space-y-0.5">
                  <p>{phone1}</p>
                  {phone2 && <p>{phone2}</p>}
                </div>
              </div>
            </div>

            {/* Bottom Row of 8 Social App Icons */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between px-1">
                {/* YouTube */}
                <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-white" title="YouTube">
                  <span className="text-[9px] font-black">▶</span>
                </div>
                {/* Telegram */}
                <div className="w-5 h-5 rounded-full bg-[#27A7E7] flex items-center justify-center text-white text-[9px] font-bold" title="Telegram">
                  ✈
                </div>
                {/* WhatsApp */}
                <div className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center text-white text-[9px] font-bold" title="WhatsApp">
                  <Phone size={10} />
                </div>
                {/* LinkedIn */}
                <div className="w-5 h-5 rounded bg-[#0077B5] flex items-center justify-center text-white text-[9px] font-bold" title="LinkedIn">
                  in
                </div>
                {/* Facebook */}
                <div className="w-5 h-5 rounded bg-[#1877F2] flex items-center justify-center text-white text-[9px] font-bold" title="Facebook">
                  f
                </div>
                {/* Instagram */}
                <div className="w-5 h-5 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold" title="Instagram">
                  📷
                </div>
                {/* Twitter / X */}
                <div className="w-5 h-5 rounded bg-[#1DA1F2] flex items-center justify-center text-white text-[9px] font-bold" title="Twitter/X">
                  𝕏
                </div>
                {/* TikTok */}
                <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white text-[9px] font-bold" title="TikTok">
                  ♪
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <a
          href={verificationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold shadow-sm"
          title="Open public employee verification webpage"
        >
          <ExternalLink size={13} /> Verify Online
        </a>
        <button
          onClick={handleDownloadVCard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#26BCEE] hover:bg-[#1ea8d6] text-slate-900 rounded-lg transition-colors font-semibold shadow-sm"
        >
          <Download size={13} /> Save Contact (.vcf)
        </button>
        <button
          onClick={() => alert(`Downloading high-resolution print PDF for ${employeeCode}...`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202B75] text-white rounded-lg hover:bg-[#161f56] transition-colors"
        >
          <Download size={13} /> Download PDF
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer size={13} /> Print Card
        </button>
      </div>
    </div>
  )
}
