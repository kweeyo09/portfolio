import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Introduction.css';

gsap.registerPlugin(ScrollTrigger);
const Flowers = lazy(() => import('./Home'));
const roles = ['a designer', 'a product designer', 'a vibecoder'];

function Letters({text}: {text: string}) {
  return <><span className="intro-sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((letter, index) => <span className="intro-letter" key={index}>{letter === ' ' ? '\u00a0' : letter}</span>)}</span></>;
}

function HighlightRole({active, reduced}: {active: boolean; reduced: boolean}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (!active || reduced) return;
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (document.hidden) { schedule(); return; }
        setSelected(true);
        timer = window.setTimeout(() => {
          setIndex(value => (value + 1) % roles.length);
          timer = window.setTimeout(() => { setSelected(false); schedule(); }, 180);
        }, 180);
      }, 1200);
    };
    setSelected(false);
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, reduced]);
  return <span className={`intro-role${selected && active ? ' is-selected' : ''}`}>{roles[index]}</span>;
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
    const context = gsap.context(() => {
      const timeline = gsap.timeline({scrollTrigger: {
        trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: self => { setReady(self.progress >= .999); setTextActive(self.progress === 0); },
      }});
      if (reduced) {
        timeline.to('.intro-copy', {opacity: 0, duration: 1, ease: 'none'}, 0);
      } else {
        timeline.to('.intro-line-inner', {yPercent: -100, duration: .8, stagger: .1, ease: 'none'}, 0);
      }
      timeline.fromTo('.intro-flowers', {opacity: 0}, {opacity: 1, duration: .35, ease: 'none'}, .65);    }, root);
    return () => context.revert();
  }, [reduced]);

  return <main className="intro-sequence intro-slide" ref={root}>
    <div className="intro-stage">
      <section className="intro-flowers" aria-label="Explore my work" inert={!ready}>
        <Suspense fallback={<p className="intro-loading">Opening the studio…</p>}><Flowers /></Suspense>
      </section>
      <section className="intro-overlay" aria-label="About Kiki" aria-hidden={ready}>
        <div className="intro-copy">
          <h1 className="intro-line"><span className="intro-line-inner"><Letters text="Hi, I’m Kiki." /></span></h1>
          <p className="intro-line intro-role-line"><span className="intro-line-inner"><HighlightRole active={textActive} reduced={reduced} /></span></p>
          <p className="intro-line intro-location"><span className="intro-line-inner"><Letters text="based in London." /></span></p>
        </div>
      </section>
    </div>
  </main>;
}
