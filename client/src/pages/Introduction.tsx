import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Introduction.css';

gsap.registerPlugin(ScrollTrigger);
const Flowers = lazy(() => import('./Home'));
const roles = ['a designer', 'a product designer', 'a vibecoder'];
const variants = ['drift', 'slide', 'dissolve'] as const;
type Variant = typeof variants[number];

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
  const requested = new URLSearchParams(window.location.search).get('intro');
  const variant: Variant = variants.includes(requested as Variant) ? requested as Variant : 'drift';
  const comparing = variants.includes(requested as Variant);

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
        onUpdate: self => { setReady(self.progress >= .98); setTextActive(self.progress < .08); },
      }});
      timeline.to('.intro-scroll-hint', {opacity: 0, duration: .1}, 0);
      if (reduced) {
        timeline.to('.intro-copy', {opacity: 0, duration: .4}, .1);
      } else if (variant === 'drift') {
        timeline.to('.intro-letter', {
          x: (i: number) => ((i % 7) - 3) * 15,
          y: (i: number) => -75 - (i % 5) * 16,
          rotation: (i: number) => ((i % 5) - 2) * 6,
          opacity: 0, duration: .4, stagger: {amount: .15}, ease: 'power1.in',
        }, .06).to('.intro-role-line', {y: -65, opacity: 0, duration: .4}, .13);
      } else if (variant === 'slide') {
        timeline.to('.intro-line-inner', {yPercent: -115, duration: .45, stagger: .08, ease: 'power2.inOut'}, .06);
      } else {
        timeline.to('.intro-copy', {filter: 'blur(14px)', scale: 1.08, opacity: 0, duration: .52, ease: 'power1.in'}, .06);
      }
      timeline.fromTo('.intro-flowers', {opacity: 0}, {opacity: 1, duration: .4, ease: 'none'}, .6);
    }, root);
    return () => context.revert();
  }, [variant, reduced]);

  return <main className={`intro-sequence intro-${variant}`} ref={root}>
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
        <p className="intro-scroll-hint">Scroll to explore <span aria-hidden="true">↓</span></p>
      </section>
    </div>
    {comparing && <nav className="intro-variants" aria-label="Compare intro animations">
      {variants.map((option, i) => <a key={option} href={`/?intro=${option}`} aria-current={variant === option ? 'page' : undefined}>{i + 1}. {option === 'drift' ? 'Letter drift' : option === 'slide' ? 'Silk slide' : 'Soft dissolve'}</a>)}
    </nav>}
  </main>;
}
