import { useState, useEffect } from 'react';

/**
 * Tracks `dashboardLanguage` from localStorage and the `languageChanged` event.
 * Use for student/client pages that mirror DashboardLayout language.
 */
export function useDashboardLanguage() {
  const [language, setLanguage] = useState(() => localStorage.getItem('dashboardLanguage') || 'en');

  useEffect(() => {
    const onLang = (event) => {
      setLanguage(event.detail?.language || localStorage.getItem('dashboardLanguage') || 'en');
    };
    const onStorage = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('languageChanged', onLang);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('languageChanged', onLang);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return {
    language,
    isRTL: language === 'ar',
    /** BCP 47 tag for date/time formatting (en-US, it-IT, ar-EG) */
    dateLocale: language === 'ar' ? 'ar-EG' : language === 'it' ? 'it-IT' : 'en-US',
    /** Pick a string from a per-page translations object */
    pick: (dict) => dict[language] || dict.en,
  };
}
