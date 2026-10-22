import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Introduction.css';

const Flowers = lazy(() => import('./Home'));
const roles = ['a designer', 'a product designer', 'a vibecoder'];

function HighlightRole({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (!active || reduced) return;
    let timer: number;
    let stopped = false;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (stopped || document.hidden) { if (!stopped) schedule(); return; }
        setSelected(true);
        timer = window.setTimeout(() => {
          setIndex(value => (value + 1) % roles.length);
          timer = window.setTimeout(() => { setSelected(false); schedule(); }, 350);
        }, 450);
      }, 3000);
    };
    schedule();
    return () => { stopped = true; window.clearTimeout(timer); setSelected(false); };
  }, [active, reduced]);
  return <span className="sky-role-slot"><span className={`sky-role${selected ? ' is-selected' : ''}`}>{roles[index]}</span></span>;
}

export default function Introduction() {
  const root = useRef<HTMLElement>(null);
  const about = useRef<HTMLElement>(null);
  const work = useRef<HTMLElement>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === about.current) setAboutVisible(entry.isIntersecting);
        if (entry.target === work.current && entry.isIntersecting) setShowWork(true);
      }
    }, {threshold: .1});
    if (about.current) observer.observe(about.current);
    if (work.current) observer.observe(work.current);
    void import('./Home');
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from('.sky-brand-line', {y: 28, duration: 1.15, stagger: .12, ease: 'power3.out'});
    }, root);
    return () => context.revert();
  }, [reduced]);

  return <main className="sky-introduction" ref={root}>
    <div className="sky-story">
      <div className="sky-backdrop" aria-hidden="true"><img src="/assets/intro/sky_d554efb3.webp" alt="" fetchPriority="high" /></div>
      <section className="sky-panel sky-welcome" aria-label="Kixizz Studio">
        <div className="sky-edition"><span>KIXIZZ</span><span>PORTFOLIO ’26</span></div>
        <h1><span className="sky-brand-line">Kixizz</span><span className="sky-brand-line">Studio.</span></h1>
        <p className="sky-scroll">Scroll to meet me <span aria-hidden="true">↓</span></p>
      </section>
      <section className="sky-panel sky-about" ref={about} aria-label="About Kiki">
        <div className="sky-bio">
          <h2>Hi, I’m Kiki.</h2>
          <p><HighlightRole active={aboutVisible} reduced={reduced} /><span className="sky-location">based in London.</span></p>
        </div>
        <p className="sky-scroll">Keep scrolling to explore <span aria-hidden="true">↓</span></p>
      </section>
    </div>
    <section className="sky-work" ref={work} aria-label="Explore my work">
      {showWork && <Suspense fallback={<span className="sky-loading">Opening the studio…</span>}><Flowers /></Suspense>}
    </section>
  </main>;
}
