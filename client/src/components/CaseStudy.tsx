/**
 * Shared case-study layout for the Graphic & Campaign projects (and other
 * image/video-led pages): nav bar → project info + context note → gallery.
 * Unlike the 3D pages there is no full-bleed hero, because square and
 * portrait posters crop badly when stretched to the viewport width.
 */

import { useLocation } from 'wouter';

export interface CaseStudyMedia {
  src: string;
  alt: string;
  type?: 'image' | 'video';
}

interface CaseStudyProps {
  section: string;
  backHref: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Short context line, e.g. who the work was for and where it ran. */
  note?: string;
  media: CaseStudyMedia[];
  /** 'grid' for poster series, 'stack' for one piece per row. */
  layout?: 'grid' | 'stack';
}

export default function CaseStudy({
  section,
  backHref,
  eyebrow,
  title,
  description,
  note,
  media,
  layout = 'stack',
}: CaseStudyProps) {
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
          onClick={() => setLocation(backHref)}
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
          {section.toUpperCase()} · CASE STUDY
        </span>
      </div>

      {/* ── PROJECT INFO ── */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '160px 40px 56px',
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
          {eyebrow.toUpperCase()}
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
          {title}
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
          {description}
        </p>
        {note && (
          <p
            style={{
              marginTop: '28px',
              paddingLeft: '16px',
              borderLeft: '1px solid rgba(255,255,255,0.3)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8,
              fontWeight: '400',
              maxWidth: '640px',
            }}
          >
            {note}
          </p>
        )}
      </div>

      {/* ── GALLERY ── */}
      <div
        style={{
          maxWidth: layout === 'grid' ? '1400px' : '1100px',
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 40px) 100px',
          ...(layout === 'grid'
            ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '24px',
                alignItems: 'start',
              }
            : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }),
        }}
      >
        {media.map((item) =>
          item.type === 'video' ? (
            <video
              key={item.src}
              src={item.src}
              aria-label={item.alt}
              autoPlay
              muted
              loop
              playsInline
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '88vh',
                display: 'block',
                borderRadius: '8px',
                background: '#000',
              }}
            />
          ) : (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              loading="lazy"
              style={{
                maxWidth: '100%',
                width: layout === 'grid' ? '100%' : 'auto',
                maxHeight: layout === 'grid' ? undefined : '88vh',
                height: 'auto',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
