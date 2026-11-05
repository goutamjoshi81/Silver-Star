// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CORPORATE EXPORT ENGINE
// Generates standardized, professional enterprise reports (Excel/CSV & PDF)
// Adhering to Corporate & Statutory Compliance Standards
// ============================================================

import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  format?: (val: any, row: any) => string;
}

export interface CorporateExportOptions {
  title: string;
  subtitle?: string;
  category?: string;
  dateRange?: { start: string; end: string };
  filterSummary?: Record<string, string>;
  kpis?: Array<{ label: string; value: string | number }>;
  columns: ExportColumn[];
  data: any[];
  filename?: string;
  notes?: string;
}

const COMPANY_DETAILS = {
  name: 'Silver Star Facility Management Pvt. Ltd.',
  shortName: 'Silver Star FM',
  tagline: 'Your True Business Partners',
  cin: 'U74999KA2014PTC075123',
  gstin: '29AABCS1429B1ZB',
  pan: 'AABCS1429B',
  address: 'Electronic City Phase II, Bangalore - 560100, Karnataka, India',
  phone: '+91 80 4123 4567 / +91 9620000494',
  email: 'info@silverstarindia.net / ops@silverstarindia.net',
  website: 'https://silverstarindia.net/',
  ceo: 'Ashok Majjige (CEO & Founder)',
  certifications: 'ISO 9001:2015 Certified | PSARA Licensed Facility Management Provider',
};

// Safe CSV cell escaping
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// ============================================================
// 1. CORPORATE EXCEL / CSV EXPORT
// ============================================================
export function exportToCorporateExcel(options: CorporateExportOptions) {
  const {
    title,
    subtitle,
    dateRange,
    filterSummary = {},
    kpis = [],
    columns,
    data,
    filename,
    notes,
  } = options;

  const now = new Date();
  const timestamp = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const rows: string[] = [];

  // Corporate Header Block
  rows.push(escapeCsvCell(COMPANY_DETAILS.name.toUpperCase()));
  rows.push(escapeCsvCell(`${COMPANY_DETAILS.tagline} | CIN: ${COMPANY_DETAILS.cin} | GSTIN: ${COMPANY_DETAILS.gstin}`));
  rows.push(escapeCsvCell(`Corporate Office: ${COMPANY_DETAILS.address}`));
  rows.push(escapeCsvCell(`Support: ${COMPANY_DETAILS.phone} | ${COMPANY_DETAILS.email} | ${COMPANY_DETAILS.website}`));
  rows.push(escapeCsvCell(COMPANY_DETAILS.certifications));
  rows.push('""');

  // Report Metadata Block
  rows.push([escapeCsvCell('REPORT TITLE:'), escapeCsvCell(title.toUpperCase())].join(','));
  if (subtitle) {
    rows.push([escapeCsvCell('SCOPE / PURPOSE:'), escapeCsvCell(subtitle)].join(','));
  }
  rows.push([escapeCsvCell('DOCUMENT REF:'), escapeCsvCell(`SS-DOC-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`)].join(','));
  rows.push([escapeCsvCell('GENERATED ON:'), escapeCsvCell(`${timestamp} (IST)`)].join(','));
  if (dateRange) {
    rows.push([escapeCsvCell('AUDIT PERIOD:'), escapeCsvCell(`${dateRange.start} to ${dateRange.end}`)].join(','));
  }
  rows.push([escapeCsvCell('CLASSIFICATION:'), escapeCsvCell('CONFIDENTIAL - PROPRIETARY ENTERPRISE DATA')].join(','));

  // Filter Parameters
  const filterEntries = Object.entries(filterSummary);
  if (filterEntries.length > 0) {
    const filterStr = filterEntries.map(([k, v]) => `${k}: ${v}`).join(' | ');
    rows.push([escapeCsvCell('APPLIED FILTERS:'), escapeCsvCell(filterStr)].join(','));
  }
  rows.push('""');

  // KPI Summary Row
  if (kpis.length > 0) {
    rows.push(escapeCsvCell('--- EXECUTIVE SUMMARY METRICS ---'));
    const kpiRow = kpis.map(k => `${k.label}: ${k.value}`).join('  |  ');
    rows.push(escapeCsvCell(kpiRow));
    rows.push('""');
  }

  // Structured Column Headers
  const headerRow = columns.map(c => escapeCsvCell(c.header.toUpperCase())).join(',');
  rows.push(headerRow);

  // Data Rows
  if (data.length === 0) {
    rows.push(escapeCsvCell('No matching records found for the selected reporting criteria.'));
  } else {
    data.forEach((row, idx) => {
      const line = columns.map(col => {
        let val = row[col.key];
        if (col.format) {
          val = col.format(val, row);
        } else if (col.key === 'sl_no') {
          val = idx + 1;
        }
        return escapeCsvCell(val);
      }).join(',');
      rows.push(line);
    });
  }

  // Summary / Footer Rows
  rows.push('""');
  rows.push([escapeCsvCell('TOTAL RECORDS:'), escapeCsvCell(data.length)].join(','));
  if (notes) {
    rows.push([escapeCsvCell('NOTES / COMPLIANCE:'), escapeCsvCell(notes)].join(','));
  }
  rows.push('""');

  // Signatory Block
  rows.push(escapeCsvCell('--- AUTHORIZED CORPORATE SIGN-OFF ---'));
  rows.push([
    escapeCsvCell('Prepared By: Integrated System Generated'),
    escapeCsvCell('Reviewed By: Head of Compliance & Quality'),
    escapeCsvCell(`Authorized By: ${COMPANY_DETAILS.ceo}`),
  ].join(','));

  // Trigger UTF-8 Download with BOM for Excel compatibility
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedFilename = (filename || `${title.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}`).replace(/[^a-zA-Z0-9_\-]/g, '') + '.csv';
  
  link.setAttribute('href', url);
  link.setAttribute('download', sanitizedFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Alias for CSV
export const exportToCorporateCsv = exportToCorporateExcel;

// ============================================================
// 2. CORPORATE PDF / PRINT REPORT GENERATOR
// ============================================================
export function exportToCorporatePdf(options: CorporateExportOptions) {
  const {
    title,
    subtitle,
    category = 'ENTERPRISE AUDIT REPORT',
    dateRange,
    filterSummary = {},
    kpis = [],
    columns,
    data,
    notes,
  } = options;

  const now = new Date();
  const timestamp = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const docRef = `SS-REP-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Build Table Headers HTML
  const thHtml = columns
    .map(c => `<th style="text-align: ${c.align || 'left'};">${c.header.toUpperCase()}</th>`)
    .join('');

  // Build Table Body HTML
  const trHtml = data.length === 0
    ? `<tr><td colspan="${columns.length}" style="text-align: center; color: #64748b; padding: 24px;">No records available for the selected audit scope.</td></tr>`
    : data.map((row, idx) => {
        const tds = columns.map(col => {
          let val = row[col.key];
          if (col.format) {
            val = col.format(val, row);
          } else if (col.key === 'sl_no') {
            val = idx + 1;
          }
          if (val === null || val === undefined) val = '—';

          // Status badge detection
          const sVal = String(val).trim();
          let badge = String(val);
          if (['Active', 'Verified', 'Approved', 'Present', 'Paid'].includes(sVal)) {
            badge = `<span class="badge badge-success">${sVal}</span>`;
          } else if (['Pending', 'Late', 'Half Day', 'Expiring Soon'].includes(sVal)) {
            badge = `<span class="badge badge-warning">${sVal}</span>`;
          } else if (['Inactive', 'Absent', 'Rejected', 'Overdue', 'Terminated'].includes(sVal)) {
            badge = `<span class="badge badge-danger">${sVal}</span>`;
          }

          return `<td style="text-align: ${col.align || 'left'};">${badge}</td>`;
        }).join('');

        return `<tr>${tds}</tr>`;
      }).join('');

  // Build KPI HTML
  const kpiHtml = kpis.length > 0
    ? `
      <div class="kpi-grid">
        ${kpis.map(k => `
          <div class="kpi-card">
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value">${k.value}</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  // Filter tags HTML
  const filterHtml = Object.entries(filterSummary)
    .map(([k, v]) => `<span class="filter-tag"><strong>${k}:</strong> ${v}</span>`)
    .join(' ');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${COMPANY_DETAILS.name}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 20px;
      font-size: 11px;
      line-height: 1.4;
    }
    .no-print {
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .btn-primary {
      background: #202B75;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #161f56;
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #334155;
      margin-left: 8px;
    }

    /* Corporate Header */
    .corp-header {
      border-bottom: 2.5px solid #202B75;
      padding-bottom: 12px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .corp-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .corp-logo-badge {
      width: 48px;
      height: 48px;
      background: #202B75;
      color: #26BCEE;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 22px;
      border: 2px solid #26BCEE;
    }
    .corp-name {
      font-size: 17px;
      font-weight: 800;
      color: #202B75;
      letter-spacing: -0.3px;
    }
    .corp-tagline {
      font-size: 10px;
      font-weight: 700;
      color: #26BCEE;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .corp-legal {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 3px;
    }
    .corp-meta {
      text-align: right;
      font-size: 9.5px;
      color: #475569;
    }
    .corp-doc-type {
      display: inline-block;
      padding: 3px 8px;
      background: #202B75;
      color: #ffffff;
      font-weight: 700;
      font-size: 9px;
      border-radius: 4px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .corp-ref {
      font-family: monospace;
      font-weight: bold;
      color: #202B75;
      font-size: 10px;
    }

    /* Title Block */
    .title-block {
      margin-bottom: 14px;
    }
    .report-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .report-subtitle {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .filter-bar {
      margin-top: 6px;
      font-size: 10px;
      color: #334155;
    }
    .filter-tag {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 4px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #202B75;
      padding: 8px 10px;
      border-radius: 6px;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .kpi-value {
      font-size: 14px;
      font-weight: 800;
      color: #202B75;
      margin-top: 2px;
    }

    /* Data Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    th {
      background: #202B75;
      color: #ffffff;
      padding: 7px 8px;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.4px;
      border: 1px solid #202B75;
    }
    td {
      padding: 6px 8px;
      font-size: 9.5px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5px;
      text-transform: uppercase;
    }
    .badge-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    /* Sign-off & Footer */
    .signoff-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
      border: 1px solid #e2e8f0;
      padding: 10px;
      border-radius: 6px;
      background: #ffffff;
    }
    .sign-role {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .sign-name {
      font-size: 10px;
      font-weight: 700;
      color: #1e293b;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      display: inline-block;
      min-width: 140px;
    }
    .sign-title {
      font-size: 8.5px;
      color: #64748b;
    }

    .corp-footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #94a3b8;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Print Control Banner -->
  <div class="no-print">
    <div>
      <strong style="color: #202B75; font-size: 13px;">Silver Star Enterprise Report Preview</strong>
      <span style="color: #64748b; margin-left: 10px;">Click Print to generate physical copy or Save as PDF.</span>
    </div>
    <div>
      <button onclick="window.print()" class="btn btn-primary">🖨️ Print / Save as PDF</button>
      <button onclick="window.close()" class="btn btn-secondary">Close Preview</button>
    </div>
  </div>

  <!-- Corporate Header -->
  <div class="corp-header">
    <div class="corp-brand">
      <div class="corp-logo-badge">SS</div>
      <div>
        <div class="corp-name">${COMPANY_DETAILS.name}</div>
        <div class="corp-tagline">${COMPANY_DETAILS.tagline}</div>
        <div class="corp-legal">
          CIN: ${COMPANY_DETAILS.cin} | GSTIN: ${COMPANY_DETAILS.gstin} | PAN: ${COMPANY_DETAILS.pan}
          <br>${COMPANY_DETAILS.address}
        </div>
      </div>
    </div>
    <div class="corp-meta">
      <div class="corp-doc-type">${category}</div>
      <div>Ref: <span class="corp-ref">${docRef}</span></div>
      <div>Date: <strong>${timestamp} (IST)</strong></div>
      <div>Classification: <strong style="color: #dc2626;">CONFIDENTIAL</strong></div>
    </div>
  </div>

  <!-- Title & Metadata -->
  <div class="title-block">
    <div class="report-title">${title}</div>
    ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}
    <div class="filter-bar">
      ${dateRange ? `<span class="filter-tag"><strong>Date Range:</strong> ${dateRange.start} to ${dateRange.end}</span>` : ''}
      ${filterHtml}
      <span class="filter-tag"><strong>Total Records:</strong> ${data.length}</span>
    </div>
  </div>

  <!-- KPI Metrics -->
  ${kpiHtml}

  <!-- Data Table -->
  <table>
    <thead>
      <tr>${thHtml}</tr>
    </thead>
    <tbody>
      ${trHtml}
    </tbody>
  </table>

  ${notes ? `<div style="font-size: 9.5px; color: #475569; margin-bottom: 15px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #26BCEE;"><strong>Audit Note:</strong> ${notes}</div>` : ''}

  <!-- Corporate Sign-off Block -->
  <div class="signoff-grid">
    <div class="sign-box">
      <div class="sign-role">Prepared By</div>
      <div class="sign-name">Enterprise ERP System</div>
      <div class="sign-title">Digital Report Processor</div>
    </div>
    <div class="sign-box">
      <div class="sign-role">Verified By</div>
      <div class="sign-name">Head of Compliance & Quality</div>
      <div class="sign-title">HR & Operations Audit</div>
    </div>
    <div class="sign-box">
      <div class="sign-role">Authorized Corporate Signatory</div>
      <div class="sign-name">${COMPANY_DETAILS.ceo}</div>
      <div class="sign-title">Silver Star Facility Management Pvt. Ltd.</div>
    </div>
  </div>

  <!-- Corporate Footer -->
  <div class="corp-footer">
    <div>${COMPANY_DETAILS.certifications}</div>
    <div>Strictly Confidential • For Corporate Enterprise Governance Only</div>
    <div>Page 1 of 1</div>
  </div>

  <script>
    // Auto trigger print dialog after document is rendered
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  } else {
    alert('Please allow popups to view and download the corporate PDF report.');
  }
}

// ============================================================
// 3. OFFICIAL GST TAX INVOICE GENERATOR (FORM GST INV-1)
// ============================================================
export function generateTaxInvoicePdf(invoice: {
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate?: string;
  clientName: string;
  clientAddress?: string;
  clientGstin?: string;
  serviceDescription?: string;
  subtotal: number;
  taxRate?: number;
  notes?: string;
}) {
  const invDate = invoice.invoiceDate || new Date().toISOString().split('T')[0];
  const dueDate = invoice.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  const subtotal = Number(invoice.subtotal) || 0;
  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 18;
  const cgst = (subtotal * (taxRate / 2)) / 100;
  const sgst = (subtotal * (taxRate / 2)) / 100;
  const grandTotal = subtotal + cgst + sgst;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice ${invoice.invoiceNumber} - Silver Star</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 15px; }
    .no-print { margin-bottom: 20px; padding: 10px 15px; background: #f1f5f9; border-radius: 8px; display: flex; justify-content: space-between; }
    .btn { padding: 6px 12px; background: #202B75; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .header { border-bottom: 2px solid #202B75; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; }
    .title { font-size: 18px; font-weight: 800; color: #202B75; }
    .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #202B75; color: white; padding: 7px; text-align: left; font-size: 10px; }
    td { padding: 7px; border: 1px solid #cbd5e1; font-size: 10px; }
    .totals { width: 280px; margin-left: auto; margin-bottom: 15px; }
    .totals td { padding: 4px 8px; }
    .bank-box { border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; font-size: 10px; width: 60%; }
    .sign-box { text-align: right; margin-top: 20px; font-size: 10px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print">
    <div><strong>Official GST Tax Invoice Preview</strong> (Form GST INV-1)</div>
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <div class="title">${COMPANY_DETAILS.name}</div>
      <div style="color: #26BCEE; font-weight: bold;">${COMPANY_DETAILS.tagline}</div>
      <div>${COMPANY_DETAILS.address}</div>
      <div>GSTIN: <strong>${COMPANY_DETAILS.gstin}</strong> | PAN: <strong>${COMPANY_DETAILS.pan}</strong> | State: 29 Karnataka</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 14px; font-weight: bold; color: #202B75; text-transform: uppercase;">TAX INVOICE</div>
      <div>Invoice No: <strong>${invoice.invoiceNumber}</strong></div>
      <div>Invoice Date: <strong>${invDate}</strong></div>
      <div>Due Date: <strong>${dueDate}</strong></div>
      <div>Reverse Charge: <strong>No</strong></div>
    </div>
  </div>

  <div class="party-grid">
    <div>
      <strong style="color: #202B75; text-transform: uppercase;">Billed To (Client):</strong>
      <div style="font-size: 12px; font-weight: bold; margin-top: 3px;">${invoice.clientName}</div>
      <div>${invoice.clientAddress || 'Corporate Facility Campus, Bengaluru'}</div>
      <div>GSTIN: <strong>${invoice.clientGstin || '29AAACH2382K1Z8'}</strong></div>
      <div>State Code: 29 Karnataka</div>
    </div>
    <div>
      <strong style="color: #202B75; text-transform: uppercase;">Place of Supply:</strong>
      <div>Bengaluru, Karnataka (State Code: 29)</div>
      <div>Category: Integrated Facility & Manpower Services</div>
      <div>SAC Code: <strong>998533 (Security Services) / 998539 (Cleaning Services)</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description of Services Provided</th>
        <th style="width: 80px;">SAC Code</th>
        <th style="width: 100px; text-align: right;">Taxable Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <strong>${invoice.serviceDescription || 'Integrated Physical Security, Housekeeping & Facility Services'}</strong>
          <div style="font-size: 9px; color: #64748b;">Comprehensive monthly deployment roster & geofenced muster compliance for period</div>
        </td>
        <td>9985</td>
        <td style="text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div class="bank-box">
      <strong style="color: #202B75;">Bank Transfer Details for NEFT / RTGS:</strong>
      <div>Beneficiary Name: <strong>${COMPANY_DETAILS.name}</strong></div>
      <div>Bank: State Bank of India | Electronic City Phase II Branch</div>
      <div>Account No: <strong>389201948210</strong> (Current Account)</div>
      <div>IFSC Code: <strong>SBIN0004123</strong></div>
    </div>

    <table class="totals">
      <tr>
        <td>Subtotal Taxable Amount:</td>
        <td style="text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>CGST (9.0%):</td>
        <td style="text-align: right;">₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td>SGST (9.0%):</td>
        <td style="text-align: right;">₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr style="background: #202B75; color: white; font-weight: bold; font-size: 11px;">
        <td style="color: white;">Invoice Total (INR):</td>
        <td style="text-align: right; color: white;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <div class="sign-box">
    <div>For <strong>${COMPANY_DETAILS.name}</strong></div>
    <div style="margin-top: 40px; font-weight: bold;">Authorized Corporate Signatory</div>
    <div style="color: #64748b; font-size: 9px;">(Digitally Authenticated Commercial Invoice)</div>
  </div>

  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 500));
  </script>
</body>
</html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  } else {
    alert('Please allow popups to download and print the Tax Invoice.');
  }
}

// ============================================================
// 4. BULK UPLOAD TEMPLATES & CSV PARSER ENGINE
// Matching columns for Clients and Employees bulk import
// ============================================================

export const CLIENT_BULK_TEMPLATE_CSV = `Company Name,Contact Person,Email,Phone,Address,Monthly Billing (INR),Services Provided,Contract Start,Contract End,Status
Infosys Campus Electronic City,Rajesh Kumar,operations@infosys-ecity.com,+91 98860 12345,Electronic City Phase 1 Bangalore,450000,Security Services; Housekeeping,2026-01-01,2027-12-31,Active
Wipro Sarjapur Facility,Priya Sharma,admin@wipro-campus.com,+91 99001 54321,Sarjapur Main Road Bangalore,320000,Security Services; Electro-Mechanical,2026-02-15,2027-02-14,Active
Prestige Tech Cloud,Anil Deshmukh,facility@prestigegroup.com,+91 98450 98765,Hebbal Outer Ring Road Bangalore,280000,Housekeeping; Horticulture,2026-03-01,2027-02-28,Active`;

export const EMPLOYEE_BULK_TEMPLATE_CSV = `Employee Code,Full Name,Phone,Email,Department,Designation,Employment Type,Gender,Date of Birth,Blood Group,Address,Joining Date,Bank Name,Account Number,IFSC Code,PF UAN,Status
SS-10020,Suresh Gowda,+91 98765 11001,suresh.gowda@silverstarindia.net,Security Services,Security Guard,Permanent,Male,1992-05-14,O+,BTM 2nd Stage Bangalore,2025-06-01,State Bank of India,30291827364,SBIN0004051,100928374615,Active
SS-10021,Manjula R,+91 98765 11002,manjula.r@silverstarindia.net,Housekeeping,Housekeeping Attendant,Permanent,Female,1995-08-22,B+,Bommanahalli Bangalore,2025-07-15,HDFC Bank,501004928371,HDFC0000128,100928374616,Active
SS-10022,Karthik Nair,+91 98765 11003,karthik.nair@silverstarindia.net,Electro-Mechanical,Electrical Technician,Permanent,Male,1990-11-03,AB+,Koramangala 4th Block Bangalore,2025-08-01,ICICI Bank,000201584920,ICIC0000002,100928374617,Active`;

/**
 * Download Client Bulk Upload CSV Template
 */
export function downloadClientTemplate() {
  const blob = new Blob(['\uFEFF' + CLIENT_BULK_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Client_Bulk_Upload_Template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download Client Bulk Upload Excel (.xlsx) Template with multi-sheet validation rules
 */
export function downloadClientExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template
  const headers = [
    'Company Name *',
    'Contact Person *',
    'Email Address *',
    'Phone Number *',
    'Facility Address',
    'Monthly Billing (INR) *',
    'Services Provided',
    'Contract Start Date',
    'Contract End Date',
    'Account Status'
  ];

  const sampleData = [
    [
      'Infosys Campus Electronic City',
      'Rajesh Kumar',
      'operations@infosys-ecity.com',
      '+91 98860 12345',
      'Electronic City Phase 1, Bangalore - 560100',
      450000,
      'Security Services; Housekeeping',
      '2026-01-01',
      '2027-12-31',
      'Active'
    ],
    [
      'Wipro Sarjapur Facility',
      'Priya Sharma',
      'admin@wipro-campus.com',
      '+91 99001 54321',
      'Doddakannelli, Sarjapur Road, Bangalore - 560035',
      320000,
      'Security Services; Electro-Mechanical',
      '2026-02-15',
      '2027-02-14',
      'Active'
    ],
    [
      'Prestige Tech Cloud',
      'Anil Deshmukh',
      'facility@prestigegroup.com',
      '+91 98450 98765',
      'Hebbal Outer Ring Road, Bangalore - 560045',
      280000,
      'Housekeeping; Horticulture',
      '2026-03-01',
      '2027-02-28',
      'Active'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 34 }, { wch: 22 }, { wch: 32 }, { wch: 20 },
    { wch: 45 }, { wch: 24 }, { wch: 36 }, { wch: 20 },
    { wch: 20 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Client Upload Template');

  // Sheet 2: Guidelines
  const guideHeaders = ['Field Name', 'Mandatory / Optional', 'Allowed Values / Constraints', 'Description & Guidance'];
  const guideRows = [
    ['Company Name *', 'Mandatory', 'Any valid company / entity name (2-255 chars)', 'Official legal name of client organization.'],
    ['Contact Person *', 'Mandatory', 'Full name of corporate contact', 'Designated facility manager or corporate representative.'],
    ['Email Address *', 'Mandatory', 'Valid email format (user@domain.com)', 'Official communication & automated GST invoice recipient.'],
    ['Phone Number *', 'Mandatory', 'Valid 10-digit or international format with +91', 'Primary emergency and operational contact phone.'],
    ['Facility Address', 'Optional', 'Street, Area, City, State, PIN', 'Physical premises or corporate headquarters location.'],
    ['Monthly Billing (INR) *', 'Mandatory', 'Numeric value > 0 (e.g. 250000)', 'Contractual monthly service fee in Indian Rupees.'],
    ['Services Provided', 'Optional', 'Separated by semicolon (;)', 'e.g. Security Services; Housekeeping; Electro-Mechanical'],
    ['Contract Start Date', 'Optional', 'YYYY-MM-DD (e.g. 2026-01-01)', 'Commencement date of facility agreement (defaults to today).'],
    ['Contract End Date', 'Optional', 'YYYY-MM-DD (e.g. 2027-01-01)', 'Contract expiration / renewal date (defaults to 1 year).'],
    ['Account Status', 'Optional', 'Active | Pending | Expired | Terminated', 'Current operational status of client account (default: Active).']
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [{ wch: 26 }, { wch: 24 }, { wch: 42 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Guidelines & Validation Rules');

  XLSX.writeFile(wb, 'SilverStar_Client_Bulk_Template.xlsx');
}

/**
 * Download Employee Bulk Upload CSV Template
 */
export function downloadEmployeeTemplate() {
  const blob = new Blob(['\uFEFF' + EMPLOYEE_BULK_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Employee_Bulk_Upload_Template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download Employee Bulk Upload Excel (.xlsx) Template with multi-sheet master data reference
 */
export function downloadEmployeeExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template
  const headers = [
    'Employee Code',
    'Full Name *',
    'Phone Number *',
    'Official Email',
    'Department *',
    'Designation *',
    'Employment Type',
    'Gender',
    'Date of Birth',
    'Blood Group',
    'Residential Address',
    'Joining Date',
    'Bank Name',
    'Account Number',
    'IFSC Code',
    'PF UAN Number',
    'Employment Status'
  ];

  const sampleData = [
    [
      'SS-10020',
      'Suresh Gowda',
      '+91 98765 11001',
      'suresh.gowda@silverstarindia.net',
      'Security Services',
      'Security Guard',
      'Permanent',
      'Male',
      '1992-05-14',
      'O+',
      '#42, 2nd Main, BTM 2nd Stage, Bangalore - 560076',
      '2025-06-01',
      'State Bank of India',
      '30291827364',
      'SBIN0004051',
      '100928374615',
      'Active'
    ],
    [
      'SS-10021',
      'Manjula R',
      '+91 98765 11002',
      'manjula.r@silverstarindia.net',
      'Housekeeping',
      'Housekeeping Attendant',
      'Permanent',
      'Female',
      '1995-08-22',
      'B+',
      '#15, 4th Cross, Bommanahalli, Bangalore - 560068',
      '2025-07-15',
      'HDFC Bank',
      '501004928371',
      'HDFC0000128',
      '100928374616',
      'Active'
    ],
    [
      'SS-10022',
      'Karthik Nair',
      '+91 98765 11003',
      'karthik.nair@silverstarindia.net',
      'Electro-Mechanical',
      'Electrical Technician',
      'Permanent',
      'Male',
      '1990-11-03',
      'AB+',
      '#88, 1st Cross, Koramangala 4th Block, Bangalore - 560034',
      '2025-08-01',
      'ICICI Bank',
      '000201584920',
      'ICIC0000002',
      '100928374617',
      'Active'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 18 }, { wch: 24 }, { wch: 20 }, { wch: 34 },
    { wch: 24 }, { wch: 26 }, { wch: 18 }, { wch: 12 },
    { wch: 16 }, { wch: 14 }, { wch: 45 }, { wch: 16 },
    { wch: 24 }, { wch: 22 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Employee Upload Template');

  // Sheet 2: Master Data Reference
  const guideHeaders = ['Department Code', 'Department Name', 'Approved Designations'];
  const guideRows = [
    ['DEP001', 'Housekeeping', 'Housekeeping Attendant, Housekeeping Supervisor, Floor Specialist'],
    ['DEP002', 'Security Services', 'Security Guard, Security Supervisor, Armed Guard, Patrol Officer'],
    ['DEP003', 'Electro-Mechanical', 'HVAC Technician, Electrical Technician, Plumber, BMS Operator'],
    ['DEP004', 'Horticulture', 'Gardener / Horticulturist, Landscaping Supervisor'],
    ['DEP005', 'Administration', 'Admin Executive, Facility Coordinator, Store Incharge'],
    ['DEP006', 'Guest House Management', 'Guest House Caretaker, Front Desk Assistant, Chef']
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 26 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Departments & Roles Guide');

  XLSX.writeFile(wb, 'SilverStar_Employee_Bulk_Template.xlsx');
}

/**
 * Universal Spreadsheet parser supporting both .xlsx and .csv files
 */
export async function parseSpreadsheetFile(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
  if (isCsv) {
    const text = await file.text();
    return parseCsvText(text);
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  return { headers, rows: rawRows };
}

/**
 * Standard CSV Parser handling quotes, delimiters, newlines and commas
 */
export function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return { headers: [], rows: [] };

  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Carriage return, check if \n follows
        if (nextChar === '\n') i++;
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push last field & line
  if (currentField.length > 0 || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f.length > 0)) {
      lines.push(currentLine);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map(h => h.trim());
  const dataRows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowObj: Record<string, string> = {};
    const cols = lines[i];
    headers.forEach((hdr, idx) => {
      rowObj[hdr] = cols[idx] !== undefined ? cols[idx] : '';
    });
    // Ignore completely empty rows
    if (Object.values(rowObj).some(val => val.trim().length > 0)) {
      dataRows.push(rowObj);
    }
  }

  return { headers, rows: dataRows };
}

// Helper to find a value by flexible header names
function getRowValue(row: Record<string, any>, possibleKeys: string[]): string {
  const normKeys = Object.keys(row).map(k => ({
    original: k,
    normalized: k.toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));

  for (const candidate of possibleKeys) {
    const candNorm = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = normKeys.find(k => k.normalized === candNorm);
    if (found && row[found.original] !== undefined && row[found.original] !== null && row[found.original] !== '') {
      return String(row[found.original]).trim();
    }
  }
  return '';
}

/**
 * Map CSV / Excel rows to Client entities
 */
export function mapClientCsvRows(rows: Record<string, any>[]) {
  return rows.map((row, index) => {
    const name = getRowValue(row, ['Company Name', 'Client Name', 'Name', 'Company', 'Organization']);
    const contactPerson = getRowValue(row, ['Contact Person', 'Contact', 'Representative', 'Person']);
    const email = getRowValue(row, ['Email', 'Email Address', 'Official Email']);
    const phone = getRowValue(row, ['Phone', 'Phone Number', 'Mobile', 'Contact No']);
    const address = getRowValue(row, ['Address', 'Location', 'Site Address', 'City']);
    const billingStr = getRowValue(row, ['Monthly Billing (INR)', 'Monthly Billing', 'Billing', 'Amount']);
    const servicesStr = getRowValue(row, ['Services Provided', 'Services', 'Service']);
    const contractStart = getRowValue(row, ['Contract Start', 'Start Date', 'From']);
    const contractEnd = getRowValue(row, ['Contract End', 'End Date', 'To', 'Expiry Date']);
    const status = getRowValue(row, ['Status', 'Account Status']) || 'Active';

    const monthlyBilling = parseFloat(billingStr.replace(/[^0-9.]/g, '')) || 0;
    const servicesProvided = servicesStr
      ? servicesStr.split(/[;,|]/).map(s => s.trim()).filter(Boolean)
      : ['Security Services'];

    return {
      _rowIndex: index + 1,
      name,
      contactPerson: contactPerson || 'Facility Manager',
      email: email || (name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.silverstarindia.net` : ''),
      phone: phone || '+91 98765 00000',
      address,
      monthlyBilling,
      servicesProvided,
      contractStart: contractStart || new Date().toISOString().split('T')[0],
      contractEnd: contractEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: ['Active', 'Pending', 'Expired', 'Terminated'].includes(status) ? status : 'Active',
      isValid: Boolean(name && name.trim().length > 1),
      error: !name || name.trim().length <= 1 ? 'Company Name is required' : undefined,
    };
  });
}

/**
 * Map CSV / Excel rows to Employee entities
 */
export function mapEmployeeCsvRows(rows: Record<string, any>[]) {
  return rows.map((row, index) => {
    const employeeCode = getRowValue(row, ['Employee Code', 'Emp Code', 'Code', 'Staff ID']);
    const name = getRowValue(row, ['Full Name', 'Name', 'Employee Name', 'Staff Name']);
    const phone = getRowValue(row, ['Phone', 'Phone Number', 'Mobile', 'Mobile Number']);
    const email = getRowValue(row, ['Email', 'Email Address', 'Official Email']);
    const department = getRowValue(row, ['Department', 'Dept', 'Division']);
    const designation = getRowValue(row, ['Designation', 'Role', 'Title', 'Post']);
    const employmentType = getRowValue(row, ['Employment Type', 'Type', 'Job Type']) || 'Permanent';
    const gender = getRowValue(row, ['Gender', 'Sex']) || 'Male';
    const dob = getRowValue(row, ['Date of Birth', 'DOB', 'Birth Date']);
    const bloodGroup = getRowValue(row, ['Blood Group', 'Blood', 'BG']) || 'B+';
    const address = getRowValue(row, ['Address', 'Residential Address', 'City']);
    const joiningDate = getRowValue(row, ['Joining Date', 'Date of Joining', 'DOJ']) || new Date().toISOString().split('T')[0];
    const bankName = getRowValue(row, ['Bank Name', 'Bank']);
    const accountNumber = getRowValue(row, ['Account Number', 'A/C Number', 'Account No']);
    const ifsc = getRowValue(row, ['IFSC Code', 'IFSC']);
    const pfNumber = getRowValue(row, ['PF UAN', 'PF Number', 'UAN']);
    const status = getRowValue(row, ['Status', 'Employment Status']) || 'Active';

    const isValid = Boolean(name && name.trim().length > 1 && phone && phone.trim().length >= 8);
    let error: string | undefined;
    if (!name || name.trim().length <= 1) error = 'Full Name is required';
    else if (!phone || phone.trim().length < 8) error = 'Valid Phone is required';

    return {
      _rowIndex: index + 1,
      employeeCode: employeeCode || '',
      name,
      phone,
      email: email || (name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@silverstarindia.net` : ''),
      department: department || 'Security Services',
      designation: designation || 'Security Guard',
      employmentType: ['Permanent', 'Contract', 'Probation'].includes(employmentType) ? employmentType : 'Permanent',
      gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Male',
      dob: dob || '',
      bloodGroup,
      address,
      joiningDate,
      bankName,
      accountNumber,
      ifsc,
      pfNumber,
      status: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Inactive'].includes(status) ? status : 'Active',
      isValid,
      error,
    };
  });
}


