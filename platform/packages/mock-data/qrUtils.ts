// ============================================================
// SILVER STAR FACILITY MANAGEMENT - QR & VCARD ENGINE
// Generates scannable, authentic 2D matrix QR codes & vCard records
// ============================================================

import QRCode from 'qrcode';

/**
 * Returns the public verification URL for an employee badge
 */
export function getEmployeeVerificationUrl(codeOrId: string): string {
  const origin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'http://localhost:5174';
  return `${origin}/verify/${encodeURIComponent(codeOrId || 'SS-10001')}`;
}

/**
 * Generates an ultra-crisp, branded QR Code Data URL (Base64 PNG)
 */
export async function generateQrCodeDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#1A2B79', // Silver Star Brand Navy
        light: '#FFFFFF',
      },
      ...options,
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Generates standard vCard 3.0 content for smartphone contact integration
 */
export function generateVCard(emp: {
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  employeeCode?: string;
  department?: string;
}): string {
  const cleanPhone = (emp.phone || '').replace(/\s+/g, '');
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${emp.name}`,
    `N:;${emp.name};;;`,
    'ORG:Silver Star Facility Management Pvt. Ltd.',
    `TITLE:${emp.designation || 'Staff Member'}`,
    `ROLE:${emp.department || 'Operations'}`,
    cleanPhone ? `TEL;TYPE=CELL,VOICE:${cleanPhone}` : '',
    emp.email ? `EMAIL;TYPE=PREF,INTERNET:${emp.email}` : '',
    'URL:https://silverstarindia.net/',
    `NOTE:Verified Silver Star Employee Badge ID: ${emp.employeeCode || ''}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

/**
 * Triggers instant vCard (.vcf) download on mobile/desktop browsers
 */
export function downloadVCard(emp: {
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  employeeCode?: string;
  department?: string;
}) {
  const vcardText = generateVCard(emp);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (emp.name || 'SilverStar_Staff').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `${safeName}_SilverStar.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
