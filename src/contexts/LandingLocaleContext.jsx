import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LANDING_MESSAGES,
  LANDING_STORAGE_KEY,
  SUPPORTED_LANDING_LOCALES,
  translate,
} from '../locales/landing/messages';

const LandingLocaleContext = createContext(null);

function readStoredLocale() {
  try {
    const s = localStorage.getItem(LANDING_STORAGE_KEY);
    if (SUPPORTED_LANDING_LOCALES.includes(s)) return s;
  } catch {
    // ignore
  }
  return 'en';
}

export function LandingLocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale());
  const initialHtmlLang = useRef(null);
  if (initialHtmlLang.current === null) {
    initialHtmlLang.current =
      typeof document !== 'undefined' ? (document.documentElement.getAttribute('lang') || 'en') : 'en';
  }

  const setLocale = useCallback((next) => {
    if (!SUPPORTED_LANDING_LOCALES.includes(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem(LANDING_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => {
    const copy = LANDING_MESSAGES[locale] || LANDING_MESSAGES.en;
    return {
      locale,
      setLocale,
      t: (key) => translate(locale, key),
      copy,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      isRTL: locale === 'ar',
    };
  }, [locale, setLocale]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  useLayoutEffect(() => {
    return () => {
      document.documentElement.setAttribute('lang', initialHtmlLang.current);
    };
  }, []);

  return <LandingLocaleContext.Provider value={value}>{children}</LandingLocaleContext.Provider>;
}

export function useLandingLocale() {
  const ctx = useContext(LandingLocaleContext);
  if (!ctx) {
    throw new Error('useLandingLocale must be used within LandingLocaleProvider');
  }
  return ctx;
}
