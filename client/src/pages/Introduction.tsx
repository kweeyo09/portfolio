import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import IntroRole from '../components/IntroRole';

import './Introduction.css';


const Flowers = lazy(() => import('./Home'));

function Letters({text}: {text: string}) {
  return <><span className="intro-sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((letter, index) => <span className="intro-letter" key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span></>;
}

export default function Introduction() {
  const introRef = useRef<HTMLElement>(null);
  const [textActive, setTextActive] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    let frame = 0;
    let textVisible = true;
    const updateScroll = () => {
      frame = 0;
      const bounds = intro.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height * 1.6));
      const complete = progress >= 1;
      intro.style.setProperty('--intro-scroll', String(progress));
      intro.classList.toggle('is-scrolled', complete);
      intro.inert = complete;
      intro.setAttribute('aria-hidden', String(complete));
      const visible = !complete && bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (visible !== textVisible) {
        textVisible = visible;
        setTextActive(visible);
      }
    };
    const scheduleScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
    };
  }, []);

  return <main className="intro-sequence">
      <section ref={introRef} className="intro-overlay" aria-label="About Kiki">
        <div className="intro-copy">
          <h1 className="intro-line intro-greeting"><span className="intro-line-inner">
            <Letters text="Hi, I’m Kiki," />
            <span className="intro-object intro-flower" aria-hidden="true"><img src="/assets/intro/chrome-flower_2bd50bb5.webp" alt="" /></span>
          </span></h1>
          <p className="intro-line intro-role-line"><span className="intro-line-inner">
            <span className="intro-punctuation" aria-hidden="true">(</span>
            <span className="intro-object intro-keyboard" aria-hidden="true"><img src="/assets/0001_655eb5c3.webp" alt="" /></span>
            <IntroRole active={textActive} reduced={reduced} />
            <span className="intro-punctuation" aria-hidden="true">)</span>
          </span></p>
          <p className="intro-line intro-location"><span className="intro-line-inner">
            <Letters text="based in" />
            <span className="intro-object intro-london" aria-hidden="true"><img src="/assets/intro/london-tower_76acff5c.webp" alt="" /></span>
            <Letters text="London." />
          </span></p>
        </div>
      </section>
      <section className="intro-flowers" aria-label="Explore my work">
        <Suspense fallback={<p className="intro-loading">Opening the studio…</p>}><Flowers /></Suspense>
      </section>
  </main>;
}

