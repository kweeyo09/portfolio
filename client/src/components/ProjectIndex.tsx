import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Bodies, Body, Composite, Constraint, Engine } from 'matter-js';
import { useLocation } from 'wouter';
import './ProjectIndex.css';

interface Project {
  title: string;
  href: string;
}

interface ProjectIndexProps {
  heading: string;
  description: string;
  projects: Project[];
}

function ProjectLink({ title, href }: Project) {
  const [, setLocation] = useLocation();
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const leavingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const engine = Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;
    let frame = 0;
    let active = true;
    let origins: { x: number; y: number }[] = [];

    const rebuild = () => {
      if (leavingRef.current) return;
      Composite.clear(engine.world, false);
      const letters = lettersRef.current.filter((letter): letter is HTMLSpanElement => Boolean(letter));
      letters.forEach(letter => { letter.style.transform = ''; });
      origins = letters.map(letter => {
        const bounds = letter.getBoundingClientRect();
        return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      });
      bodiesRef.current = letters.map((letter, index) => {
        const bounds = letter.getBoundingClientRect();
        return Bodies.rectangle(origins[index].x, origins[index].y, Math.max(bounds.width, 8), Math.max(bounds.height, 16), {
          frictionAir: 0.14,
          collisionFilter: { group: -1 },
        });
      });
      constraintsRef.current = bodiesRef.current.map((body, index) => Constraint.create({
        pointA: origins[index],
        bodyB: body,
        length: 0,
        stiffness: 0.075,
        damping: 0.22,
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
  }, [title]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const jiggle = (index: number) => {
    if (leavingRef.current) return;
    const body = bodiesRef.current[index];
    if (!body) return;
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.5, y: -1.7 - Math.random() });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
  };

  const jiggleAll = () => bodiesRef.current.forEach((_, index) => jiggle(index));

  const openProject = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);

    const engine = engineRef.current;
    if (!engine) {
      setLocation(href);
      return;
    }
    constraintsRef.current.forEach(constraint => Composite.remove(engine.world, constraint));
    engine.gravity.y = 1.15;
    bodiesRef.current.forEach(body => {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: -4 - Math.random() * 3 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.17);
    });
    timerRef.current = window.setTimeout(() => setLocation(href), 850);
  };

  let letterIndex = 0;
  return (
    <a className={`project-index__link${leaving ? ' project-index__link--leaving' : ''}`} href={href} onClick={openProject} onPointerEnter={jiggleAll} aria-label={`View ${title}`}>
      <span className="project-index__title" aria-hidden="true">
        {title.split(' ').map((word, wordIndex) => (
          <Fragment key={`${word}-${wordIndex}`}>
            {wordIndex > 0 && ' '}
            <span className="project-index__word">
              {Array.from(word).map(character => {
                const index = letterIndex++;
                return <span className="project-index__letter" key={index} ref={element => { lettersRef.current[index] = element; }} onPointerEnter={() => jiggle(index)}>{character}</span>;
              })}
            </span>
          </Fragment>
        ))}
      </span>
      <svg className="project-index__arrow" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 16h21m-8-8 8 8-8 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export default function ProjectIndex({ heading, description, projects }: ProjectIndexProps) {
  const [, setLocation] = useLocation();

  return (
    <main className="project-index">
      <button type="button" className="project-index__back" onClick={() => setLocation('/flowers')}>← Back to flowers</button>
      <div className="project-index__content">
        <header className="project-index__header">
          <h1>{heading}</h1>
          <p>{description}</p>
        </header>
        <nav className="project-index__list" aria-label={`${heading} projects`}>
          {projects.map(project => <ProjectLink key={project.href} {...project} />)}
        </nav>
      </div>
    </main>
  );
}
