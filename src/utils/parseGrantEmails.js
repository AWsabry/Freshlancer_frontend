const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/**
 * Parse emails from pasted text or CSV content.
 * Supports:
 * - Header row: email (or Email)
 * - One email per line
 * - Comma/semicolon separated
 */
export function parseGrantEmails(input) {
  if (!input || !String(input).trim()) return [];

  const lines = String(input)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const first = lines[0].toLowerCase();
  const hasHeader = first === 'email' || first.startsWith('email,');

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const emails = new Set();

  for (const line of dataLines) {
    const parts = line.split(/[,;]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
    for (const part of parts) {
      if (!part) continue;
      const candidate = part.includes('@') ? part : null;
      if (candidate && EMAIL_RE.test(candidate)) {
        emails.add(candidate.toLowerCase());
      }
    }
  }

  return Array.from(emails);
}

export const GRANT_EMAILS_CSV_SAMPLE = `email
student1@university.edu
student2@university.edu
`;

export function downloadGrantEmailsSample() {
  const blob = new Blob([GRANT_EMAILS_CSV_SAMPLE], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'education-badge-grant-emails-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}
