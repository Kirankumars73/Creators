// RFC 4180 CSV. Member-supplied text goes into this file and then into a spreadsheet,
// so cells that a spreadsheet would run as a formula are prefixed with an apostrophe.
const FORMULA = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  let s = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  if (FORMULA.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return [columns.join(','), ...rows.map((r) => columns.map((c) => cell(r[c])).join(','))].join('\r\n');
}
