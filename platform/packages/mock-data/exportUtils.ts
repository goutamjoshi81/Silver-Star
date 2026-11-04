// ============================================================
// SILVER STAR FACILITY MANAGEMENT - CORPORATE EXPORT ENGINE
// Generates standardized, professional enterprise reports (Excel/CSV & PDF)
// Adhering to Corporate & Statutory Compliance Standards
// ============================================================

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
