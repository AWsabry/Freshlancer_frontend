import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ArrowLeft, Star, Clock, CheckCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { LandingLocaleProvider, useLandingLocale } from '../hooks/useLandingLocale';
import { LandingLanguageSwitcher } from '../components/landing/LandingLanguageSwitcher';
import logo from '../assets/logos/01.png';

// ─── Navbar ────────────────────────────────────────────────────────────────

function ClientNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { t, isRTL, copy } = useLandingLocale();
  const nav = copy.client.nav;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const CtaIcon = isRTL ? ArrowLeft : ArrowRight;

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
        background: scrolled
          ? 'rgba(10,10,10,0.95)'
          : 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled
          ? '1px solid rgba(37,170,173,0.12)'
          : '1px solid transparent',
        transition: 'border-color 0.3s ease, background 0.3s ease',
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
          <img
            src={logo}
            alt={t('common.logoAlt')}
            style={{ height: '48px', width: 'auto', filter: 'brightness(1.15)' }}
          />
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
          className="desktop-nav"
        >
          <Link
            to="/students"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            {nav.forStudents}
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
                color: 'rgba(255,255,255,0.75)',
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
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={20} aria-hidden />
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >
              {nav.signIn}
            </Link>
          )}

          <Link
            to="/register?role=client"
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
            {nav.postAJob}
            <CtaIcon size={14} />
          </Link>

          <LandingLanguageSwitcher variant="dark" />
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          className="mobile-nav"
        >
          <LandingLanguageSwitcher variant="dark" />
          <Link
            to="/register?role=client"
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
            {nav.postAJob}
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.75)',
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
            background: 'rgba(10,10,10,0.98)',
            borderTop: '1px solid rgba(37,170,173,0.12)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="mobile-menu"
        >
          <Link
            to="/students"
            onClick={() => setMenuOpen(false)}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {nav.forStudents} <span style={{ fontSize: '12px' }}>↗</span>
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
                color: 'rgba(255,255,255,0.75)',
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
                color: 'rgba(255,255,255,0.75)',
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
        .desktop-nav { display: flex !important; }
        .mobile-nav  { display: none  !important; }
        .mobile-menu { display: flex  !important; }
        @media (max-width: 640px) {
          .desktop-nav { display: none  !important; }
          .mobile-nav  { display: flex  !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu { display: none  !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Job Card Mockup ────────────────────────────────────────────────────────

function JobCardMockup() {
  const { copy, isRTL } = useLandingLocale();
  const c = copy.client;
  const m = c.mock;
  const proposals = c.proposals;
  const CtaIcon = isRTL ? ArrowLeft : ArrowRight;

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
          width: '340px',
          height: '340px',
          background: 'radial-gradient(circle, rgba(37,170,173,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="animate-bounce-slow"
        style={{
          background: '#0d1117',
          border: '1px solid rgba(37,170,173,0.22)',
          borderRadius: '16px',
          padding: '24px',
          width: '320px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,170,173,0.08)',
          animation: 'bounce-slow 6s ease-in-out infinite',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(37,170,173,0.15)',
                color: '#25aaad',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '99px',
                border: '1px solid rgba(37,170,173,0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {m.new}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{m.timeAgo}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff', marginBottom: '6px' }}>{m.jobTitle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#25aaad', fontSize: '13px', fontWeight: 600 }}>
              <span>💰</span> {m.priceRange}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              <Clock size={12} /> {m.days}
            </span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>{m.proposals}</span>
          <span
            style={{
              background: 'rgba(37,170,173,0.12)',
              color: '#25aaad',
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '99px',
            }}
          >
            {proposals.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {proposals.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background:
                    i === 0
                      ? 'linear-gradient(135deg, #25aaad, #0f828c)'
                      : i === 1
                        ? 'linear-gradient(135deg, #065084, #25aaad)'
                        : 'linear-gradient(135deg, #0f828c, #074368)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                {p.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{p.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '12px' }}>
                    <Star size={11} fill="#f59e0b" strokeWidth={0} />
                    {p.rating}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  &ldquo;{p.snippet}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              background: 'rgba(37,170,173,0.1)',
              border: '1px solid rgba(37,170,173,0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13px', color: '#25aaad', fontWeight: 600 }}>{m.reviewProposals}</span>
            <CtaIcon size={14} color="#25aaad" />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-16px',
          insetInlineEnd: '-24px',
          background: '#0d1117',
          border: '1px solid rgba(37,170,173,0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 2,
          animation: 'bounce-slow 8s ease-in-out infinite reverse',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(37,170,173,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={16} color="#25aaad" />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{m.hiredIn24h}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{m.avgResponse}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function ClientHero() {
  const { isRTL, copy, locale } = useLandingLocale();
  const h = copy.client.hero;
  const CtaIcon = isRTL ? ArrowLeft : ArrowRight;
  const trust = [h.trust1, h.trust2, h.trust3];
  const isArabic = locale === 'ar';

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(6,80,132,0.09) 0%, transparent 55%)',
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
        className="hero-grid"
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
              color: '#25aaad',
              background: 'rgba(37,170,173,0.06)',
            }}
          >
            <span
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25aaad', display: 'inline-block' }}
            />
            {h.trustBadge}
          </div>

          <h1
            className="animate-fade-up"
            style={{
              animationDelay: '80ms',
              fontSize: isArabic ? 'clamp(2.2rem, 4.1vw, 4.4rem)' : 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              color: '#ffffff',
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
                color: 'rgba(255,255,255,0.85)',
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
              color: '#25aaad',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: '480px',
            }}
          >
            {h.h2}
          </p>

          <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
            <Link
              to="/register?role=client"
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
              {h.cta}
              <CtaIcon size={16} />
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
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                <CheckCircle size={13} color="#25aaad" fill="rgba(37,170,173,0.15)" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className="animate-fade-up hero-card-col"
          style={{
            animationDelay: '200ms',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <JobCardMockup />
        </div>
      </div>

      <style>{`
        .hero-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 60px 0 !important;
          }
          .hero-card-col {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-grid {
            padding: 40px 0 !important;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function ClientLandingContent() {
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
        background: '#0a0a0a',
        minHeight: '100dvh',
        ...fontStyle,
      }}
    >
      <ClientNavbar />
      <ClientHero />
    </div>
  );
}

export default function ClientLanding() {
  return (
    <LandingLocaleProvider>
      <ClientLandingContent />
    </LandingLocaleProvider>
  );
}
