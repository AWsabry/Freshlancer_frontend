import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Star, Clock, CheckCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logos/01.png';

// ─── Navbar ────────────────────────────────────────────────────────────────

function ClientNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
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
        left: 0,
        right: 0,
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
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={logo} alt="FreshLancer" style={{ height: '48px', width: 'auto', filter: 'brightness(1.15)' }} />
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
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
            For Students
            <span style={{ fontSize: '12px', opacity: 0.8 }}>↗</span>
          </Link>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
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
              Sign In
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
            Post a Job
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile right side: Post a Job always visible + hamburger */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          className="mobile-nav"
        >
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
            Post a Job
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
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
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
            For Students <span style={{ fontSize: '12px' }}>↗</span>
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
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
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Responsive visibility — inline style approach */}
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

const proposals = [
  { initials: 'SA', name: 'Sara A.', rating: 4.9, snippet: 'I can deliver this in 2 days...' },
  { initials: 'OK', name: 'Omar K.', rating: 4.7, snippet: 'Great at brand identity work...' },
  { initials: 'NM', name: 'Nour M.', rating: 5.0, snippet: 'Ready to start immediately...' },
];

function JobCardMockup() {
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
      {/* Glow behind card */}
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

      {/* Main card */}
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
        {/* Card header */}
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
              New
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>2 min ago</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff', marginBottom: '6px' }}>
            Logo Design Needed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#25aaad', fontSize: '13px', fontWeight: 600 }}>
              <span>💰</span> 500–800 EGP
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              <Clock size={12} /> 3 days
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

        {/* Proposals header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
            Proposals
          </span>
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

        {/* Proposal rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {proposals.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: i === 0
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
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{p.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '12px' }}>
                    <Star size={11} fill="#f59e0b" strokeWidth={0} />
                    {p.rating}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{p.snippet}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
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
            <span style={{ fontSize: '13px', color: '#25aaad', fontWeight: 600 }}>Review proposals</span>
            <ArrowRight size={14} color="#25aaad" />
          </div>
        </div>
      </div>

      {/* Small floating stat card */}
      <div
        style={{
          position: 'absolute',
          bottom: '-16px',
          right: '-24px',
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Hired in 24h</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Avg. response time</div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function ClientHero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        backgroundImage:
          'radial-gradient(ellipse at 80% 50%, rgba(6,80,132,0.09) 0%, transparent 55%)',
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
        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>

          {/* Trust badge */}
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
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25aaad', display: 'inline-block' }} />
            Egypt's First Student Freelance Platform
          </div>

          {/* H1 */}
          <h1
            className="animate-fade-up"
            style={{
              animationDelay: '80ms',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Hire verified
            <br />
            student talent
            <br />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>fast and affordable.</span>
          </h1>

          {/* H2 */}
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
            Post a job in 2 minutes. Get proposals from
            Egypt's top university students.
          </p>

          {/* CTA */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
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
              Post a Job for Free
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trust line */}
          <div
            className="animate-fade-up"
            style={{
              animationDelay: '320ms',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {[
              'No upfront cost',
              '500+ vetted students',
              'Design, Dev, Marketing & more',
            ].map(item => (
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

        {/* ── Right Column ── */}
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

      {/* Responsive grid */}
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

export default function ClientLanding() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <ClientNavbar />
      <ClientHero />
    </div>
  );
}
