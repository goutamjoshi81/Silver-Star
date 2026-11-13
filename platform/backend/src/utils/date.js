// Safe date formatting utility to prevent TypeError: val.toISOString is not a function
// Works with Date objects, date strings (ISO or SQL), timestamps, and null/undefined

export function toDateStr(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? '' : val.toISOString().split('T')[0];
  }
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString().split('T')[0];
  } catch {
    return String(val);
  }
}

export function toDateTimeStr(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? '' : val.toISOString().replace('T', ' ').slice(0, 16);
  }
  if (typeof val === 'string') {
    return val.replace('T', ' ').slice(0, 16);
  }
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString().replace('T', ' ').slice(0, 16);
  } catch {
    return String(val);
  }
}

