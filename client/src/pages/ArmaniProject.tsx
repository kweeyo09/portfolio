/**
 * Armani Perfume Campaign — Product Design Case Study
 * Stills only (no video). Layout: full-bleed hero still → project info →
 * remaining stills stacked.
 *
 * To publish the visuals, copy them in with the hash-naming helper:
 *   bash scripts/add-assets.sh armani <your-files...>
 * then paste its output into MEDIA below. The page leaves its placeholder
 * state as soon as MEDIA is non-empty.
 */

import { useLocation } from 'wouter';

const MEDIA: { src: string; alt: string }[] = [
  { src: '/assets/armani-01_dba33603.webp', alt: "Emporio Armani Because It's You — bottle and orchid on a rose-pink set" },
  { src: '/assets/armani-02_6bf76acc.webp', alt: "Emporio Armani Because It's You — vertical composition with orchid stem" },
  { src: '/assets/armani-03_aba8539c.webp', alt: "Emporio Armani Because It's You — bottle with a dried flower bouquet" },
  { src: '/assets/armani-04_36459b45.webp', alt: 'Emporio Armani Stronger With You Intensely — amber bottle with dried flowers' },
];

const [hero, ...rest] = MEDIA;

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

      {/* ── HERO STILL ── */}
      {hero && (
        <div style={{ width: '100%', position: 'relative', background: '#000', lineHeight: 0 }}>
          <img
            src={hero.src}
            alt={hero.alt}
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
          padding: hero ? '60px 40px 40px' : '160px 40px 40px',
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
          A campaign study for Emporio Armani fragrance, rendered in Blender.
          Because It's You and Stronger With You Intensely are set against
          rose and oxblood backdrops with orchid and dried florals — a study
          in glass refraction, liquid tint, and soft directional light.
        </p>
      </div>

      {/* ── STILLS ── */}
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
          rest.map((item) => (
            <div
              key={item.src}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden',
                lineHeight: 0,
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  maxHeight: '88vh',
                  width: 'auto',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px',
                }}
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
