import React from 'react';
import { useLandingLocale } from '../../hooks/useLandingLocale';

const OPTIONS = [
  { id: 'en', label: 'EN' },
  { id: 'it', label: 'IT' },
  { id: 'ar', label: 'العربية' },
];

/**
 * @param {object} props
 * @param {'dark' | 'light'} [props.variant]
 */
export function LandingLanguageSwitcher({ variant = 'light' }) {
  const { locale, setLocale } = useLandingLocale();
  const isDark = variant === 'dark';
  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 3,
        borderRadius: 8,
        border: isDark ? '1px solid rgba(37,170,173,0.25)' : '1px solid #e2e8f0',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.9)',
      }}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLocale(opt.id)}
            style={{
              border: 'none',
              background: active
                ? isDark
                  ? 'rgba(37,170,173,0.35)'
                  : 'rgba(37,170,173,0.2)'
                : 'transparent',
              color: active
                ? isDark
                  ? '#fff'
                  : '#0f172a'
                : isDark
                  ? 'rgba(255,255,255,0.55)'
                  : '#64748b',
              fontSize: opt.id === 'ar' ? 12 : 11,
              fontWeight: active ? 700 : 500,
              padding: '4px 7px',
              borderRadius: 6,
              cursor: 'pointer',
              lineHeight: 1.2,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
