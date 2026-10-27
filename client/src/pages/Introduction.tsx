import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import IntroRole from '../components/IntroRole';

import './Introduction.css';


const Flowers = lazy(() => import('./Home'));

function Letters({text}: {text: string}) {
  return <><span className="intro-sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((letter, index) => <span className="intro-letter" key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span></>;
}

export default function Introduction() {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [textActive, setTextActive] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useLayoutEffect(() => {
    let started = false;
    let complete = false;
    let touchY: number | null = null;
    let lastGesture = 0;
    let timeline: gsap.core.Timeline;
    const context = gsap.context(() => {
      timeline = gsap.timeline({paused: true, onComplete: () => {
        complete = true;
        lastGesture = performance.now();
        setReady(true);
      }});
      if (reduced) {
        timeline.to('.intro-copy', {opacity: 0, duration: .15}, 0);
        timeline.to('.intro-flowers', {opacity: 1, duration: .15}, 0);
      } else {
        timeline.to('.intro-line-inner', {
          yPercent: -105, duration: .65, stagger: .055, ease: 'power2.inOut',
        }, 0);
        timeline.to('.intro-flowers', {opacity: 1, duration: .34, ease: 'power1.out'}, .42);
      }
    }, root);
    const reveal = () => {
      if (started) return;
      started = true;
      setTextActive(false);
      timeline.play(0);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return;
      const now = performance.now();
      if (complete && now - lastGesture > 220) return;
      lastGesture = now;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.deltaY > 0) reveal();
    };
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const touchMove = (event: TouchEvent) => {
      if (complete || event.touches.length !== 1) return;
      event.preventDefault();
      if (touchY !== null && touchY - event.touches[0].clientY > 8) reveal();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (complete || !['ArrowDown', 'PageDown', 'Space'].includes(event.code)) return;
      event.preventDefault(); event.stopImmediatePropagation(); reveal();
    };
    window.addEventListener('wheel', wheel, {passive: false, capture: true});
    window.addEventListener('touchstart', touchStart, {passive: true});
    window.addEventListener('touchmove', touchMove, {passive: false});
    window.addEventListener('keydown', keyDown, true);
    return () => {
      context.revert();
      window.removeEventListener('wheel', wheel, true);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('keydown', keyDown, true);
    };
  }, [reduced]);
  return <main className="intro-sequence intro-slide" ref={root}>
    <div className="intro-stage">
      <section className="intro-flowers" aria-label="Explore my work" inert={!ready}>
        <Suspense fallback={<p className="intro-loading">Opening the studio…</p>}><Flowers /></Suspense>
      </section>
      <section className="intro-overlay" aria-label="About Kiki" aria-hidden={ready}>
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
            <span className="intro-object intro-rock" aria-hidden="true"><img src="/assets/intro/resin-rock_eb5c7d60.webp" alt="" /></span>
            <Letters text="London." />
          </span></p>
        </div>
      </section>
    </div>
  </main>;
}

