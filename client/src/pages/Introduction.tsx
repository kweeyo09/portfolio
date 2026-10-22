import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useLetterPhysics } from '../components/useLetterPhysics';
import './Introduction.css';

gsap.registerPlugin(ScrollTrigger, SplitText);
const roles = ['a designer', 'a product designer', 'a vibecoder'];

function Role({ text, onNext, reduced }: { text: string; onNext: () => void; reduced: boolean }) {
  const { letters, hoverHandlers, scatter } = useLetterPhysics(text);
  useEffect(() => {
    if (reduced) return;
    let replacement: number;
    const timer = window.setTimeout(() => {
      scatter();
      replacement = window.setTimeout(onNext, 650);
    }, 3300);
    return () => { window.clearTimeout(timer); window.clearTimeout(replacement); };
  }, [onNext, reduced, scatter]);
  return <span className="intro-role" {...hoverHandlers} aria-label={text}>
    <span aria-hidden="true">{letters}</span>
  </span>;
}

export default function Introduction() {
  const root = useRef<HTMLElement>(null);
  const first = useRef<HTMLVideoElement>(null);
  const second = useRef<HTMLVideoElement>(null);
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState(0);
  const [role, setRole] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const advanceRole = useRef(() => setRole(value => (value + 1) % roles.length)).current;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    let split: SplitText | undefined;
    let titleTween: gsap.core.Tween | undefined;
    let active = true;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({scrollTrigger: {
        trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : .65,
        onUpdate: self => setPhase(self.progress < .32 ? 0 : 1),
        onLeave: () => { if (active) { window.scrollTo(0, 0); navigate('/flowers'); } },
      }});
      timeline.to('.intro-first', {opacity: 0, scale: reduced ? 1 : 1.06, duration: .3}, .05)
        .fromTo('.intro-second', {opacity: 0, yPercent: reduced ? 0 : 9}, {opacity: 1, yPercent: 0, duration: .35}, .2)
        .to('.intro-second', {opacity: 0, yPercent: reduced ? 0 : -6, duration: .15}, .85);
      document.fonts.ready.then(() => {
        if (!active || reduced) return;
        split = SplitText.create('.intro-hello', {type: 'chars', mask: 'chars'});
        titleTween = gsap.from(split.chars, {yPercent: 110, rotate: 6, opacity: 0, duration: .85, stagger: .045, ease: 'power3.out',
          scrollTrigger: {trigger: root.current, start: 'top -55%', toggleActions: 'play none none reverse'}});
      });
    }, root);
    return () => { active = false; titleTween?.scrollTrigger?.kill(); titleTween?.kill(); split?.revert(); context.revert(); };
  }, [navigate, reduced]);

  useEffect(() => {
    const update = () => {
      [first.current, second.current].forEach((video, index) => {
        if (!video) return;
        if (document.hidden || reduced || paused || phase !== index) video.pause();
        else void video.play().catch(() => {});
      });
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [phase, reduced, paused]);

  const next = () => {
    if (phase === 1) { window.scrollTo(0, 0); navigate('/flowers'); }
    else window.scrollTo({top: window.innerHeight * 1.05, behavior: reduced ? 'instant' : 'smooth'});
  };

  return <main className="intro" ref={root}>
    <div className="intro-stage">
      <section className="intro-scene intro-first" aria-label="Kixizz Studio, portfolio 2026" aria-hidden={phase !== 0}>
        <video ref={first} className="intro-film" src="/assets/intro/studio_3aa2d22f.mp4" poster="/assets/intro/studio_0aa08e4b.jpg" muted playsInline loop preload="auto" aria-hidden="true" />
        <h1 className="sr-only">Kixizz Studio — Portfolio ’26</h1>
      </section>
      <section className="intro-scene intro-second" aria-label="About Kiki" aria-hidden={phase !== 1}>
        <video ref={second} className="intro-film" src="/assets/intro/about_6b9a5f64.mp4" poster="/assets/intro/about_bdf6ea31.jpg" muted playsInline loop preload="metadata" aria-hidden="true" />
        <div className="intro-bio">
          <h2 className="intro-hello">Hi, I’m Kiki.</h2>
          <div className="intro-role-space">{phase === 1 && (reduced || paused
            ? <span className="intro-role">{roles[role]}</span>
            : <Role key={role} text={roles[role]} onNext={advanceRole} reduced={false} />)}</div>
          <p>based in London.</p>
        </div>
      </section>
      <nav className="intro-nav" aria-label="Introduction navigation">
        {!reduced && <button className="intro-pause" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button>}
        <a href="/flowers">Skip to work <span aria-hidden="true">↗</span></a>
        <button onClick={next}>{phase === 0 ? 'Scroll to meet me' : 'Scroll to explore my work'} <span aria-hidden="true">↓</span></button>
      </nav>
    </div>
  </main>;
}
