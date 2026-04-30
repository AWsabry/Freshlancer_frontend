import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Star, Briefcase, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { LandingLocaleProvider, useLandingLocale } from '../hooks/useLandingLocale';
import { LandingLanguageSwitcher } from '../components/landing/LandingLanguageSwitcher';
import logo from '../assets/logos/01.png';
// CV Checker button routes to a dedicated page (no heavy UI in landing)

// ─── Student Navbar ─────────────────────────────────────────────────────────

function StudentNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { copy, isRTL } = useLandingLocale();
  const nav = copy.student.nav;
  const CtaIcon = isRTL ? ArrowLeft : ArrowRight;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
        transition: 'border-color 0.3s ease, background 0.3s ease',
        boxShadow: scrolled ? '0 1px 0 rgba(15,23,42,0.04)' : 'none',
      }}
    >
      <nav
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={logo} alt={copy.common.logoAlt} style={{ height: '48px', width: 'auto' }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav-s">
          <Link
            to="/"
            style={{
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            {nav.forClients}
            <span style={{ fontSize: '12px', opacity: 0.8 }}>↗</span>
          </Link>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label={nav.logout}
              title={nav.logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                transition: 'color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={20} aria-hidden />
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              {nav.signIn}
            </Link>
          )}

          <Link
            to="/register?role=student"
            style={{
              background: '#25aaad',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s ease, transform 0.1s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0f828c';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#25aaad';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {nav.startEarning}
            <CtaIcon size={14} />
          </Link>

          <LandingLanguageSwitcher variant="light" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mobile-nav-s">
          <LandingLanguageSwitcher variant="light" />
          <Link
            to="/register?role=student"
            style={{
              background: '#25aaad',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {nav.startEarning}
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={nav.toggleMenu}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="mobile-menu-s"
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{
              color: '#64748b',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {nav.forClients} <span style={{ fontSize: '12px' }}>↗</span>
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label={nav.logout}
              title={nav.logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LogOut size={22} aria-hidden />
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                color: '#0f172a',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {nav.signIn}
            </Link>
          )}
        </div>
      )}

      <style>{`
        .desktop-nav-s { display: flex !important; }
        .mobile-nav-s  { display: none  !important; }
        .mobile-menu-s { display: flex  !important; }
        @media (max-width: 640px) {
          .desktop-nav-s { display: none  !important; }
          .mobile-nav-s  { display: flex  !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu-s { display: none  !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Earnings Card Mockup ───────────────────────────────────────────────────

function EarningsCardMockup() {
  const { copy } = useLandingLocale();
  const s = copy.student;
  const m = s.mock;
  const rows = s.rows;
  const egp = copy.common.egp;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        paddingTop: '24px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
          height: '360px',
          background: 'radial-gradient(circle, rgba(37,170,173,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          width: '320px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 12px 40px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04)',
          animation: 'bounce-slow 6s ease-in-out infinite',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(37,170,173,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color="#25aaad" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{m.recentEarnings}</span>
          </div>
          <span
            style={{
              background: 'rgba(37,170,173,0.1)',
              color: '#0f828c',
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '99px',
              border: '1px solid rgba(37,170,173,0.2)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {m.live}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rows.map((e, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    i === 0
                      ? 'linear-gradient(135deg, #25aaad, #0f828c)'
                      : i === 1
                        ? 'linear-gradient(135deg, #065084, #25aaad)'
                        : 'linear-gradient(135deg, #0f828c, #074368)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {e.initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>{e.name}</div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.skill}
                </div>
              </div>

              <div style={{ textAlign: 'end', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#25aaad' }}>
                  {e.amount} {egp}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{e.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{m.studentsEarning}</span>
          <div style={{ display: 'flex' }}>
            {['AK', 'SM', 'NR', '+'].map((init, i) => (
              <div
                key={i}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: i === 3 ? 'rgba(37,170,173,0.2)' : 'linear-gradient(135deg, #25aaad, #065084)',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 700,
                  color: i === 3 ? '#25aaad' : '#ffffff',
                  marginInlineStart: i > 0 ? '-6px' : 0,
                }}
              >
                {init}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-12px',
          insetInlineEnd: '-28px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
          zIndex: 2,
          animation: 'bounce-slow 8s ease-in-out infinite reverse',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(37,170,173,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Briefcase size={15} color="#25aaad" />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{m.firstProject}</div>
          <div style={{ fontSize: '11px', color: '#0f828c', fontWeight: 600 }}>{m.avg48}</div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '12px',
          insetInlineStart: '-28px',
          background: '#ffffff',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
          zIndex: 2,
          animation: 'bounce-slow 7s ease-in-out infinite 1s',
        }}
      >
        <Star size={14} color="#f59e0b" fill="#f59e0b" />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{m.rating}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>{m.fromClients}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function StudentHero() {
  const { isRTL, copy, locale } = useLandingLocale();
  const h = copy.student.hero;
  const CtaIcon = isRTL ? ArrowLeft : ArrowRight;
  const trust = [h.trust1, h.trust2, h.trust3];
  const isArabic = locale === 'ar';

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        backgroundImage: 'radial-gradient(ellipse at 15% 45%, rgba(37,170,173,0.1) 0%, transparent 55%)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        paddingTop: '68px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          gap: '64px',
          padding: '80px 0',
        }}
        className="student-hero-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
          <div
            className="animate-fade-up"
            style={{
              animationDelay: '0ms',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(37,170,173,0.35)',
              borderRadius: '99px',
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#0f828c',
              background: 'rgba(37,170,173,0.1)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#25aaad',
                display: 'inline-block',
              }}
            />
            {h.topBadge}
          </div>

          <h1
            className="animate-fade-up"
            style={{
              animationDelay: '80ms',
              fontSize: isArabic ? 'clamp(2.2rem, 5.2vw, 4.4rem)' : 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: isArabic ? 1.18 : 1.1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {h.h1a}
            <br />
            {h.h1b}
            <br />
            <span
              style={{
                color: '#334155',
                fontSize: isArabic ? '0.92em' : '1em',
              }}
            >
              {h.h1c}
            </span>
          </h1>

          <p
            className="animate-fade-up"
            style={{
              animationDelay: '160ms',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
              fontWeight: 400,
              color: '#0f828c',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: '480px',
            }}
          >
            {h.h2}
          </p>

          <div
            className="animate-fade-up"
            style={{
              animationDelay: '240ms',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register?role=student"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25aaad',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background 0.2s ease, transform 0.1s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0f828c';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#25aaad';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {h.ctaStart}
              <CtaIcon size={16} />
            </Link>

            <Link
              to="/cv-checker?role=student"
              className="student-ghost-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#065084',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1.5px solid #065084',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(6,80,132,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {locale === 'ar' ? 'فاحص السيرة الذاتية' : 'CV Checker'}
            </Link>
          </div>

          <div
            className="animate-fade-up"
            style={{
              animationDelay: '320ms',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {trust.map((item) => (
              <span
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#64748b',
                }}
              >
                <CheckCircle size={13} color="#0f828c" fill="rgba(37,170,173,0.2)" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className="animate-fade-up student-hero-card-col"
          style={{
            animationDelay: '200ms',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <EarningsCardMockup />
        </div>
      </div>

      <style>{`
        .student-hero-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .student-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 60px 0 !important;
          }
          .student-hero-card-col {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .student-hero-grid { padding: 40px 0 !important; }
          .student-ghost-cta  { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function StudentLandingContent() {
  const { dir, locale } = useLandingLocale();
  const fontStyle =
    locale === 'ar'
      ? {
          fontFamily:
            'system-ui, "Segoe UI", Tahoma, "Noto Sans Arabic", "Helvetica Neue", sans-serif',
        }
      : undefined;

  return (
    <div
      dir={dir}
      lang={locale}
      style={{
        background: '#f8fafc',
        minHeight: '100dvh',
        ...fontStyle,
      }}
    >
      <StudentNavbar />
      <StudentHero />
    </div>
  );
}

export default function StudentLanding() {
  return (
    <LandingLocaleProvider>
      <StudentLandingContent />
    </LandingLocaleProvider>
  );
}
