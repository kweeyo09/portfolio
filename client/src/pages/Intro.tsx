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

export default function Intro({ flowersReady, onEnterComplete }: { flowersReady: boolean; onEnterComplete: () => void }) {
  const [, setLocation] = useLocation();
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const exitingRef = useRef(false);
  const resettingRef = useRef(false);
  const [exiting, setExiting] = useState(false);
  const [entryRequested, setEntryRequested] = useState(false);

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
      if (resettingRef.current && !exitingRef.current) {
        let settled = true;
        bodiesRef.current.forEach((body, index) => {
          const origin = origins[index];
          if (!origin) return;
          const dx = origin.x - body.position.x;
          const dy = origin.y - body.position.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(body.angle) > 0.001) settled = false;
          Body.setPosition(body, { x: body.position.x + dx * 0.18, y: body.position.y + dy * 0.18 });
          Body.setAngle(body, body.angle * 0.82);
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
        });
        if (settled) {
          bodiesRef.current.forEach((body, index) => {
            if (origins[index]) Body.setPosition(body, origins[index]);
            Body.setAngle(body, 0);
          });
          resettingRef.current = false;
        }
      }
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
    const completeEntry = () => {
      onEnterComplete();
      setLocation('/flowers');
    };
    if (!engine || reducedMotion) {
      completeEntry();
      return;
    }
    constraintsRef.current.forEach(constraint => Composite.remove(engine.world, constraint));
    engine.gravity.y = 1.3;
    bodiesRef.current.forEach(body => {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 8, y: -5 - Math.random() * 4 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.23);
    });
    window.setTimeout(completeEntry, 1150);
  }, [entryRequested, flowersReady, onEnterComplete, setLocation]);

  const enter = () => setEntryRequested(true);

  let letterIndex = 0;

  return (
    <main className={`intro ${exiting ? 'intro--exiting' : ''}`}>
      <header className="intro-header">
        <SocialLinks />
      </header>

      <div className="intro-center">
        <img src="/assets/kixiz-logo_ce4a8d4a.png" alt="KIXIZZ Studio" className="intro-logo" />
        <button type="button" className="intro-enter" onClick={enter} aria-label="I'm Kiki, a designer based in London. Welcome to KIXIZZ studio. Click to explore the portfolio.">
          <span className="intro-text" aria-hidden="true"
            onPointerEnter={() => { resettingRef.current = false; }}
            onPointerLeave={() => { resettingRef.current = true; }}>
            {lines.map((line, lineIndex) => {
              const groups = line.reduce<{ accent: string | null; words: string[] }[]>((result, word) => {
                const accent = 'accent' in word ? word.accent : null;
                const last = result[result.length - 1];
                if (accent && last?.accent === accent) last.words.push(word.text);
                else result.push({ accent, words: [word.text] });
                return result;
              }, []);
              const renderWord = (text: string, key: string) => (
                <span key={key} className="intro-word">
                  {Array.from(text).map(character => {
                    const index = letterIndex++;
                    return <span className="intro-letter" key={index} ref={element => { lettersRef.current[index] = element; }} onPointerEnter={() => jiggle(index)}>{character}</span>;
                  })}
                </span>
              );
              const withSpaces = (nodes: React.ReactNode[], prefix: string) => nodes.reduce<React.ReactNode[]>((result, node, index) => {
                if (index > 0) result.push(<span className="intro-space" key={`${prefix}-space-${index}`}> </span>);
                result.push(node);
                return result;
              }, []);
              return (
                <span className="intro-line" key={lineIndex}>
                  {withSpaces(groups.map((group, groupIndex) => {
                    const key = `${lineIndex}-${groupIndex}`;
                    const words = group.words.map((text, wordIndex) => renderWord(text, `${key}-${wordIndex}`));
                    return group.accent
                      ? <span key={key} className="intro-accent">{withSpaces(words, key)}</span>
                      : words[0];
                  }), `${lineIndex}`)}
                </span>
              );
            })}
          </span>
        </button>
      </div>

      <div className="intro-edge" aria-hidden="true">KIXIZZ STUDIO · LONDON</div>
    </main>
  );
}
