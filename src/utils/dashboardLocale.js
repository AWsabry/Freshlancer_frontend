/**
 * BCP 47 locale for `toLocaleDateString` / `toLocaleString` from dashboard language key.
 */
export function getDashboardDateLocale(lang) {
  if (lang === 'ar') return 'ar-EG';
  if (lang === 'it') return 'it-IT';
  return 'en-US';
}
