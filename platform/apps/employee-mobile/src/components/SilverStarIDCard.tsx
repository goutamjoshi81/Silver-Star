import { useState, useEffect } from 'react';
import { RotateCw, Download, Phone, ExternalLink, Heart, Shield } from 'lucide-react';
import { COMPANY, generateQrCodeDataUrl, getEmployeeVerificationUrl, downloadVCard } from '@mock/mockData';

interface IDCardProps {
  name?: string;
  designation?: string;
  employeeCode?: string;
  phone1?: string;
  phone2?: string;
  bloodGroup?: string;
  initialSide?: 'front' | 'back';
}

export default function SilverStarIDCard({
  name = 'RAMESH KUMAR',
  designation = 'SECURITY GUARD',
  employeeCode = 'SS-10001',
  phone1 = '+91 98765 43210',
  phone2 = '+91 80 4123 4567',
  bloodGroup = 'B+',
  initialSide = 'front',
}: IDCardProps) {
  const [side, setSide] = useState<'front' | 'back'>(initialSide);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const verificationUrl = getEmployeeVerificationUrl(employeeCode || 'SS-10001');

  useEffect(() => {
    let active = true;
    generateQrCodeDataUrl(verificationUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1A2B79',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => console.error('Failed to generate verification QR code:', err));

    return () => {
      active = false;
    };
  }, [verificationUrl]);

  const handleDownloadVCard = () => {
    try {
      downloadVCard({
        name,
        phone: phone1,
        designation,
        employeeCode,
      });
    } catch (err) {
      console.warn('vCard download error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Front / Back Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold shadow-inner border border-slate-200">
        <button
          type="button"
          onClick={() => setSide('front')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            side === 'front'
              ? 'bg-[#1A2B79] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Card Front
        </button>
        <button
          type="button"
          onClick={() => setSide('back')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            side === 'back'
              ? 'bg-[#1A2B79] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Card Back (QR)
        </button>
        <button
          type="button"
          onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
          className="p-1.5 text-slate-500 hover:text-[#1A2B79] rounded-xl hover:bg-slate-200 transition-colors"
          title="Flip Card"
        >
          <RotateCw size={13} />
        </button>
      </div>

      {/* Realistic ID Badge Card Body */}
      <div className="w-[280px] h-[450px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative flex flex-col justify-between overflow-hidden">
        
        {/* Subtle Brand Gradient Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#26BCEE] via-[#1A2B79] to-[#26BCEE]" />

        {side === 'front' ? (
          <div className="h-full flex flex-col justify-between items-center py-3 text-center">
            
            {/* Top Bar with RFID Badge */}
            <div className="w-full flex items-center justify-between">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                OFFICIAL CREDENTIAL
              </span>
              <span className="text-[8px] font-mono font-bold text-[#1A2B79] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                RFID · NFC
              </span>
            </div>

            {/* Central Badge Graphic */}
            <div className="flex flex-col items-center space-y-2.5 my-auto">
              <div className="w-20 h-20 relative flex items-center justify-center p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 50,10 C 28,10 12,26 12,48 C 12,56 16,63 22,68 C 24,62 30,57 40,55 C 56,52 68,44 68,30 C 68,18 60,10 50,10 Z"
                    fill="#42B8EE"
                  />
                  <path
                    d="M 50,90 C 72,90 88,74 88,52 C 88,44 84,37 78,32 C 76,38 70,43 60,45 C 44,48 32,56 32,70 C 32,82 40,90 50,90 Z"
                    fill="#1A2B79"
                  />
                  <circle cx="50" cy="50" r="11" fill="#FFFFFF" />
                  <path
                    d="M 44,48 C 44,44 47,41 51,41 C 55,41 58,44 58,48 C 58,54 44,54 44,60 C 44,62 46,63 48,63"
                    fill="none"
                    stroke="#42B8EE"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-xl font-black text-[#1A2B79] tracking-tight font-serif">
                  Silver Star
                </h1>
                <p className="text-[9px] font-medium text-slate-500 tracking-wide">
                  Your True Business Partners
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{name}</p>
                <p className="text-[10px] font-bold text-[#1A2B79] uppercase">{designation}</p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {employeeCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Contactless Waves Icon */}
            <div className="w-full flex justify-between items-center text-slate-400 text-[9px] px-1">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Heart size={10} className="fill-rose-600" /> {bloodGroup}
              </span>
              <div className="flex items-center gap-1 text-[#1A2B79]">
                <span className="text-[8px] font-mono">TAP</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between py-2">
            
            {/* Top row with vCard trigger and QR Code */}
            <div className="flex items-start justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="text-[8px] font-bold text-slate-500 hover:text-[#1A2B79] [writing-mode:vertical-lr] rotate-180 self-center cursor-pointer p-1 rounded hover:bg-slate-50 transition-colors"
                title="Click to Save Contact (.vcf)"
              >
                Tap or Scan to Add Contact
              </button>

              <div
                className="w-22 h-22 bg-white p-1 border-2 border-slate-200 rounded-2xl shadow-sm flex items-center justify-center relative transition-all"
                title="Gate checkpoint scan"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Verification code for ${employeeCode}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-[8px] text-slate-400 font-mono">
                    Generating...
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#1A2B79] text-white p-1 rounded-full shadow-sm text-[8px]">
                  <ExternalLink size={9} />
                </div>
              </div>
            </div>

            {/* Back Information & Contact Details */}
            <div className="space-y-2 py-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M 50,10 C 28,10 12,26 12,48 C 12,56 16,63 22,68 C 24,62 30,57 40,55 C 56,52 68,44 68,30 C 68,18 60,10 50,10 Z"
                      fill="#42B8EE"
                    />
                    <path
                      d="M 50,90 C 72,90 88,74 88,52 C 88,44 84,37 78,32 C 76,38 70,43 60,45 C 44,48 32,56 32,70 C 32,82 40,90 50,90 Z"
                      fill="#1A2B79"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1A2B79] leading-tight font-serif">Silver Star</h3>
                  <p className="text-[7px] text-slate-400">Your True Business Partners</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1">
                <p className="text-[11px] font-black text-slate-900 uppercase">
                  OWNED BY {name}
                </p>
                <p className="text-[9px] font-bold text-[#1A2B79] uppercase">
                  {designation}
                </p>
                <div className="font-mono text-[10px] font-bold text-slate-800 pt-0.5 space-y-0.5">
                  <p className="flex items-center gap-1">
                    <Phone size={10} className="text-slate-400" /> {phone1}
                  </p>
                  {phone2 && (
                    <p className="text-[9px] text-slate-500">HQ: {phone2}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1 text-[9px]">
                  <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Blood: {bloodGroup}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Social & Channel Icons */}
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

      {/* Action Buttons Below Badge */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setSide(side === 'front' ? 'back' : 'front')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2B79] hover:bg-[#152361] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <RotateCw size={13} />
          <span>{side === 'front' ? 'Show Back & QR' : 'Show Front Face'}</span>
        </button>
        <button
          type="button"
          onClick={handleDownloadVCard}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#26BCEE] hover:bg-[#1ea8d6] text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Download size={13} />
          <span>Save Contact</span>
        </button>
      </div>
    </div>
  );
}
