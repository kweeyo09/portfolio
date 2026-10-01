/**
 * Armani Perfume Campaign — Product Design Case Study
 * Layout: optional full-bleed video hero → project info → render stills
 *
 * Assets are not in the repo yet. To publish them, drop the files into
 * client/public/assets and fill in HERO_VIDEO / MEDIA below — the page
 * swaps out of its placeholder state automatically.
 */

import { useLocation } from 'wouter';

// e.g. '/assets/armani-campaign_abc12345.mp4'
const HERO_VIDEO: string | null = null;

// e.g. [{ src: '/assets/armani-01_abc12345.webp', alt: 'Armani — bottle studio render' }]
const MEDIA: { src: string; alt: string }[] = [];

export default function ArmaniProject() {
  const [, setLocation] = useLocation();

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Barlow', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ── NAV BAR ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 100,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
      >
        <button
          className="liquid-glass"
          onClick={() => setLocation('/product-design')}
          style={{
            borderRadius: 8,
            color: '#fff',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            padding: '7px 16px',
            transition: 'all 0.3s ease',
            fontWeight: '400',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 12px rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.1)';
          }}
        >
          Back
        </button>

        <span
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            fontWeight: '300',
          }}
        >
          PRODUCT DESIGN · CASE STUDY
        </span>
      </div>

      {/* ── HERO VIDEO ── */}
      {HERO_VIDEO && (
        <div style={{ width: '100%', position: 'relative', background: '#000', lineHeight: 0 }}>
          <video
            src={HERO_VIDEO}
            autoPlay
            loop
            playsInline
            controls
            style={{ width: '100%', display: 'block', maxHeight: '100vh', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, transparent, #000)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* ── PROJECT INFO ── */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: HERO_VIDEO ? '60px 40px 40px' : '160px 40px 40px',
        }}
      >
        <p
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '14px',
            fontWeight: '300',
          }}
        >
          3D PRODUCT VISUALISATION
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontWeight: 'normal',
            marginBottom: '20px',
            letterSpacing: '0.03em',
            lineHeight: 1.1,
          }}
        >
          Armani Perfume Campaign
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.9,
            fontWeight: '300',
            maxWidth: '640px',
          }}
        >
          A product campaign study for Armani fragrance — exploring glass
          refraction, liquid tint, and the restrained lighting language of
          luxury perfume advertising.
        </p>
      </div>

      {/* ── RENDERS ── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px 100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {MEDIA.length > 0 ? (
          MEDIA.map((item) => (
            <div
              key={item.src}
              style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}
            >
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>
          ))
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.35)',
                fontWeight: '300',
              }}
            >
              STILLS COMING SOON
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
