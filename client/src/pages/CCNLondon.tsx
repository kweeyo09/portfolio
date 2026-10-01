import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

// Embeds the CCN London (Cambridge Consulting Network) site, hosted on Vercel,
// inside the portfolio via an iframe so it feels like a native page.
const CCN_LONDON_URL = 'https://ccnlondon-v1.vercel.app/';
const CCN_LONDON_ORIGIN = 'https://ccnlondon-v1.vercel.app';

export default function CCNLondon() {
  const [, setLocation] = useLocation();
  const [loaded, setLoaded] = useState(false);

  // Warm up DNS/TLS to the embed origin as soon as the route mounts, so the
  // iframe request itself does not pay the handshake cost.
  useEffect(() => {
    const links = (['preconnect', 'dns-prefetch'] as const).map(rel => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = CCN_LONDON_ORIGIN;
      link.crossOrigin = '';
      document.head.appendChild(link);
      return link;
    });
    return () => { links.forEach(link => link.remove()); };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* Placeholder while the embed loads, so the route never shows a dead
          black screen. Fades out once the iframe fires onLoad. */}
      <div
        aria-hidden={loaded}
        style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#000',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 420ms ease',
          pointerEvents: loaded ? 'none' : 'auto',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            fontWeight: 300,
            animation: 'ccn-pulse 1.4s ease-in-out infinite',
          }}
        >
          LOADING
        </span>
        <style>{'@keyframes ccn-pulse { 0%,100% { opacity: 0.35 } 50% { opacity: 1 } }'}</style>
      </div>

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
        src={CCN_LONDON_URL}
        title="CCN London"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', border: 'none', display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 420ms ease',
        }}
        allow="fullscreen"
      />
    </div>
  );
}
