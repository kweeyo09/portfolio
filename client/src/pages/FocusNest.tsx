import { useLocation } from 'wouter';

// Embeds FocusNest (the procrastination helper), hosted on GitHub Pages, inside
// the portfolio via an iframe so it feels like a native page.
const FOCUSNEST_URL = 'https://kweeyo09.github.io/procastination-helper/';

export default function FocusNest() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* Back button */}
      <button
        onClick={() => setLocation('/ui-design')}
        style={{
          position: 'fixed', bottom: 32, left: 32,
          border: 'none', borderRadius: 8,
          background: '#000', color: '#fff',
          fontFamily: "'Barlow', sans-serif",
          fontSize: '0.75rem', letterSpacing: '0.15em', padding: '10px 18px',
          transition: 'opacity 0.3s ease', zIndex: 100, fontWeight: '400',
          cursor: 'pointer', opacity: 0.85,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
      >
        Back
      </button>

      <iframe
        src={FOCUSNEST_URL}
        title="FocusNest"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="fullscreen"
      />
    </div>
  );
}
