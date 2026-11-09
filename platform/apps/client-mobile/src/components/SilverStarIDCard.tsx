import { useState, useEffect } from 'react'
import { RotateCw, Download, Phone, ExternalLink } from 'lucide-react'
import { COMPANY, generateQrCodeDataUrl, getEmployeeVerificationUrl, downloadVCard } from '@mock/mockData'

interface IDCardProps {
  name?: string
  designation?: string
  employeeCode?: string
  phone1?: string
  phone2?: string
  bloodGroup?: string
  initialSide?: 'front' | 'back'
}

export default function SilverStarIDCard({
  name = 'RAMESH KUMAR',
  designation = 'SECURITY GUARD',
  employeeCode = 'SS-10001',
  phone1 = '+91 98765 43210',
  phone2 = '+91 80 4123 4567',
  bloodGroup = 'B+',
  initialSide = 'front'
}: IDCardProps) {
  const [side, setSide] = useState<'front' | 'back'>(initialSide)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  const verificationUrl = getEmployeeVerificationUrl(employeeCode || 'SS-10001')

  useEffect(() => {
    let active = true
    generateQrCodeDataUrl(verificationUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1A2B79',
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
      employeeCode
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setSide('front')}
          className={`px-3 py-1 rounded-lg transition-all ${
            side === 'front' ? 'bg-white text-[#202B75] shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Card Front
        </button>
        <button
          onClick={() => setSide('back')}
          className={`px-3 py-1 rounded-lg transition-all ${
            side === 'back' ? 'bg-white text-[#202B75] shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Card Back (QR)
        </button>
        <button
          onClick={() => setSide(s => s === 'front' ? 'back' : 'front')}
          className="p-1 text-slate-500 hover:text-[#202B75]"
        >
          <RotateCw size={13} />
        </button>
      </div>

      <div className="w-[280px] h-[450px] bg-white rounded-3xl p-5 shadow-xl border border-slate-200 relative flex flex-col justify-between overflow-hidden">
        {side === 'front' ? (
          <div className="h-full flex flex-col justify-between items-center py-4 text-center">
            <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-widest self-end">
              RFID · NFC
            </span>

            <div className="flex flex-col items-center space-y-2.5 my-auto">
              <div className="w-20 h-20 relative flex items-center justify-center">
                <img
                  src="/silverstar-icon-512.png"
                  alt="Silver Star Emblem"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <div>
                <h1 className="text-xl font-black text-[#1A2B79] tracking-tight font-serif">
                  Silver Star
                </h1>
                <p className="text-[10px] font-medium text-slate-500 tracking-wide">
                  Your True Business Partners
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {employeeCode}
                </span>
              </div>
            </div>

            <div className="w-full flex justify-end items-center pr-1 text-slate-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                <path d="M15.5 21.5a12 12 0 0 0 0-19" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between py-1">
            <div className="flex items-start justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="text-[8px] font-medium text-slate-500 hover:text-[#1A2B79] [writing-mode:vertical-lr] rotate-180 self-center cursor-pointer p-0.5"
                title="Click to Save Contact (.vcf)"
              >
                Scan or Click to Add Contact
              </button>

              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="w-20 h-20 bg-white p-1 border-2 border-slate-200 hover:border-[#1A2B79] rounded-xl shadow-sm flex items-center justify-center relative group transition-all"
                title="Scan with phone or click to verify online"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Verification code for ${employeeCode}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-[8px] text-slate-400 font-mono">
                    Generating...
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#1A2B79] text-white p-0.5 rounded-full shadow-sm text-[7px]">
                  <ExternalLink size={8} />
                </div>
              </a>
            </div>

            <div className="space-y-2 py-1">
              {/* Official Enhanced Silver Star Logo */}
              <div className="flex items-center">
                <img
                  src="/silverstar-logo.png"
                  alt="Silver Star"
                  className="h-7 w-auto object-contain max-w-[170px]"
                />
              </div>

              <div className="border-t border-slate-100 pt-1.5 space-y-0.5">
                <p className="text-[10px] font-black text-slate-900 uppercase">
                  OWNED BY {name}
                </p>
                <p className="text-[9px] font-extrabold text-slate-700 uppercase">
                  {designation}
                </p>
                <div className="font-mono text-[10px] font-bold text-slate-900 pt-0.5">
                  <p>{phone1}</p>
                  {phone2 && <p>{phone2}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 flex items-center justify-between px-1">
              <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-white text-[8px] font-black">▶</div>
              <div className="w-4 h-4 rounded-full bg-[#27A7E7] flex items-center justify-center text-white text-[8px]">✈</div>
              <div className="w-4 h-4 rounded bg-[#25D366] flex items-center justify-center text-white text-[8px]"><Phone size={8} /></div>
              <div className="w-4 h-4 rounded bg-[#0077B5] flex items-center justify-center text-white text-[8px] font-bold">in</div>
              <div className="w-4 h-4 rounded bg-[#1877F2] flex items-center justify-center text-white text-[8px] font-bold">f</div>
              <div className="w-4 h-4 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-[8px]">📷</div>
              <div className="w-4 h-4 rounded bg-[#1DA1F2] flex items-center justify-center text-white text-[8px] font-bold">𝕏</div>
              <div className="w-4 h-4 rounded bg-black flex items-center justify-center text-white text-[8px]">♪</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <a
          href={verificationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <ExternalLink size={12} /> Verify Online
        </a>
        <button
          onClick={handleDownloadVCard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#26BCEE] hover:bg-[#1ea8d6] text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Download size={12} /> Save vCard
        </button>
      </div>
    </div>
  )
}
