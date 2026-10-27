import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import IntroRole from '../components/IntroRole';

import './Introduction.css';


const Flowers = lazy(() => import('./Home'));

function Letters({text}: {text: string}) {
  return <><span className="intro-sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((letter, index) => <span className="intro-letter" key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span></>;
}

export default function Introduction() {
  const rootRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const committed = useRef(false);
  const [landed, setLanded] = useState(false);
  const [flowerReady, setFlowerReady] = useState(false);
  const onFlowerReady = useCallback(() => setFlowerReady(true), []);
  const [textActive, setTextActive] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const intro = introRef.current;
    const stage = stageRef.current;
    if (!root || !intro || !stage || landed) return;
    const lines = Array.from(intro.querySelectorAll<HTMLElement>('.intro-line-inner'));
    let frame = 0;
    let playing = true;
    const updateScroll = () => {
      frame = 0;
      if (committed.current) return;
      const bounds = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - stage.offsetHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / distance));
      root.classList.toggle('is-revealing', progress > .78);
      root.style.setProperty('--flower-reveal', String(Math.min(1, Math.max(0, (progress - .78) / .22))));
      lines.forEach((line, index) => {
        const amount = Math.min(1, Math.max(0, (progress - index * .08) / .6));
        line.style.transform = reduced ? '' : `translate3d(0, ${-110 * amount}%, 0)`;
        line.style.opacity = reduced ? String(1 - amount) : '1';
      });
      intro.inert = progress > 0;
      const active = progress === 0;
      if (active !== playing) {
        playing = active;
        setTextActive(active);
      }
      if (progress >= 1 && flowerReady) {
        committed.current = true;
        setLanded(true);
      }
    };
    const scheduleScroll = () => {
      if (!frame && !committed.current) frame = requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', scheduleScroll);
    };
  }, [landed, flowerReady, reduced]);

  useLayoutEffect(() => {
    if (landed) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [landed]);

  return <main ref={rootRef} className={`intro-sequence${landed ? ' is-landed' : ''}`}>
    <div ref={stageRef} className="intro-stage">
      <section className="intro-flowers" aria-label="Explore my work" inert={!landed} aria-hidden={!landed}>
        <Suspense fallback={<p className="intro-loading">Opening the studio…</p>}><Flowers onReady={onFlowerReady} /></Suspense>
      </section>
      {!landed && <section ref={introRef} className="intro-overlay" aria-label="About Kiki">
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
      </section>}
    </div>
  </main>;
}

