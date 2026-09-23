import { useEffect, useRef, useState } from 'react';
import { Bodies, Body, Composite, Constraint, Engine } from 'matter-js';
import { useLocation } from 'wouter';
import SocialLinks from '../components/SocialLinks';
import './Intro.css';

const lines = [
  [
    { text: "I'm" }, { text: 'Kiki,' }, { text: 'a' },
    { text: 'designer', accent: 'designer' }, { text: 'based' },
    { text: 'in' }, { text: 'London.' },
  ],
  [
    { text: 'Welcome' }, { text: 'to' },
    { text: 'KIXIZZ', accent: 'studio' }, { text: 'studio.', accent: 'studio' },
  ],
] as const;

type Accent = 'designer' | 'studio' | null;

export default function Intro({ flowersReady }: { flowersReady: boolean }) {
  const [, setLocation] = useLocation();
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const exitingRef = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [entryRequested, setEntryRequested] = useState(false);
  const [hoveredAccent, setHoveredAccent] = useState<Accent>(null);

  useEffect(() => {
    const engine = Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;
    let frame = 0;
    let active = true;
    let origins: { x: number; y: number }[] = [];

    const rebuild = () => {
      if (exitingRef.current) return;
      Composite.clear(engine.world, false);
      const letters = lettersRef.current.filter((letter): letter is HTMLSpanElement => Boolean(letter));
      letters.forEach(letter => { letter.style.transform = ''; });
      origins = letters.map(letter => {
        const bounds = letter.getBoundingClientRect();
        return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      });
      bodiesRef.current = letters.map((letter, index) => {
        const bounds = letter.getBoundingClientRect();
        const origin = origins[index];
        return Bodies.rectangle(origin.x, origin.y, Math.max(bounds.width, 8), Math.max(bounds.height, 16), {
          frictionAir: 0.12,
          collisionFilter: { group: -1 },
        });
      });
      constraintsRef.current = bodiesRef.current.map((body, index) => Constraint.create({
        pointA: origins[index],
        bodyB: body,
        length: 0,
        stiffness: 0.07,
        damping: 0.2,
      }));
      Composite.add(engine.world, [...bodiesRef.current, ...constraintsRef.current]);
    };

    const animate = () => {
      if (!active) return;
      Engine.update(engine, 1000 / 60);
      bodiesRef.current.forEach((body, index) => {
        const letter = lettersRef.current[index];
        const origin = origins[index];
        if (letter && origin) {
          letter.style.transform = `translate3d(${body.position.x - origin.x}px, ${body.position.y - origin.y}px, 0) rotate(${body.angle}rad)`;
        }
      });
      frame = requestAnimationFrame(animate);
    };

    document.fonts.ready.then(() => {
      if (!active) return;
      rebuild();
      animate();
    });
    window.addEventListener('resize', rebuild);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', rebuild);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engineRef.current = null;
    };
  }, []);

  const jiggle = (index: number) => {
    if (exitingRef.current) return;
    const body = bodiesRef.current[index];
    if (body) {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 3.2, y: -2.4 - Math.random() * 1.3 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
    }
  };

  useEffect(() => {
    if (!entryRequested || !flowersReady || exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    const engine = engineRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!engine || reducedMotion) {
      setLocation('/flowers');
      return;
    }
    constraintsRef.current.forEach(constraint => Composite.remove(engine.world, constraint));
    engine.gravity.y = 1.3;
    bodiesRef.current.forEach(body => {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 8, y: -5 - Math.random() * 4 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.23);
    });
    window.setTimeout(() => setLocation('/flowers'), 1150);
  }, [entryRequested, flowersReady, setLocation]);

  const enter = () => setEntryRequested(true);

  let letterIndex = 0;

  return (
    <main className={`intro ${exiting ? 'intro--exiting' : ''}`}>
      <header className="intro-header">
        <img src="/assets/kixiz-logo_ce4a8d4a.png" alt="KIXIZZ Studio" className="intro-logo" />
        <SocialLinks />
      </header>

      <div className="intro-center">
        <div className="intro-title">Kiki Zhang</div>
        <button type="button" className="intro-enter" onClick={enter} aria-label="I'm Kiki, a designer based in London. Welcome to KIXIZZ studio. Click to explore the portfolio.">
          {lines.map((line, lineIndex) => (
            <span className="intro-line" key={lineIndex} aria-hidden="true">
              {line.map((word, wordIndex) => {
                const accent = 'accent' in word ? word.accent : null;
                return (
                  <span key={`${lineIndex}-${wordIndex}`} className={`intro-word ${accent ? 'intro-word--accent' : ''} ${accent && hoveredAccent === accent ? 'intro-word--active' : ''}`}
                    onPointerEnter={accent ? () => setHoveredAccent(accent) : undefined}
                    onPointerLeave={accent ? () => setHoveredAccent(null) : undefined}>
                    {Array.from(word.text).map(character => {
                      const index = letterIndex++;
                      return <span className="intro-letter" key={index} ref={element => { lettersRef.current[index] = element; }} onPointerEnter={() => jiggle(index)}>{character}</span>;
                    })}
                  </span>
                );
              }).reduce<React.ReactNode[]>((nodes, word, index) => {
                if (index > 0) nodes.push(<span className="intro-space" key={`space-${index}`}> </span>);
                nodes.push(word);
                return nodes;
              }, [])}
            </span>
          ))}
        </button>
      </div>

      <div className="intro-edge" aria-hidden="true">KIXIZZ STUDIO · LONDON</div>
    </main>
  );
}
