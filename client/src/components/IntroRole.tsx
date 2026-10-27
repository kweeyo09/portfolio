import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bodies, Body, Composite, Constraint, Engine } from 'matter-js';

const roles = ['a designer', 'a storyteller', 'a professional fake rock lover', 'a matcha enthusiast'];

export default function IntroRole({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const firstRender = useRef(true);
  const paused = hovered || focused;
  const text = roles[index];

  useEffect(() => {
    if (!active || reduced || paused) return;
    let timer: number;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.hidden) schedule();
        else setIndex(value => (value + 1) % roles.length);
      }, 2600);
    };
    const resume = () => {
      if (!document.hidden) schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', resume);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [active, reduced, paused, index]);

  useLayoutEffect(() => {
    const letters = lettersRef.current.filter((letter): letter is HTMLSpanElement => Boolean(letter));
    const reset = () => letters.forEach(letter => { letter.style.transform = ''; });
    reset();
    if (firstRender.current) { firstRender.current = false; return; }
    if (!active || reduced || paused) return;

    const engine = Engine.create();
    engine.gravity.y = 0;
    const origins = letters.map(letter => {
      const bounds = letter.getBoundingClientRect();
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, width: bounds.width, height: bounds.height };
    });
    const bodies = origins.map((origin, letterIndex) => {
      const body = Bodies.rectangle(origin.x, origin.y, Math.max(origin.width, 4), origin.height, {
        frictionAir: 0.12,
        collisionFilter: { group: -1 },
      });
      Body.translate(body, { x: Math.sin(letterIndex * 1.7) * 12, y: -20 - (letterIndex % 4) * 7 });
      Body.setAngle(body, Math.sin(letterIndex * 2.3) * 0.13);
      return body;
    });
    const constraints = bodies.map((body, letterIndex) => Constraint.create({
      pointA: { x: origins[letterIndex].x, y: origins[letterIndex].y },
      bodyB: body,
      length: 0,
      stiffness: 0.065,
      damping: 0.2,
    }));
    Composite.add(engine.world, [...bodies, ...constraints]);
    let frame = 0;
    let previous = performance.now();
    const started = previous;
    const animate = (now: number) => {
      Engine.update(engine, Math.min(now - previous, 1000 / 30));
      previous = now;
      bodies.forEach((body, letterIndex) => {
        const origin = origins[letterIndex];
        Body.setAngle(body, body.angle * 0.88);
        letters[letterIndex].style.transform = `translate3d(${body.position.x - origin.x}px, ${body.position.y - origin.y}px, 0) rotate(${body.angle}rad)`;
      });
      if (now - started < 1100) frame = requestAnimationFrame(animate);
      else reset();
    };
    frame = requestAnimationFrame(animate);
    const stop = () => { cancelAnimationFrame(frame); reset(); };
    window.addEventListener('resize', stop);
    return () => {
      stop();
      window.removeEventListener('resize', stop);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [text, active, reduced, paused]);

  let letterIndex = 0;
  return <span
    className="intro-role"
    tabIndex={active ? 0 : -1}
    aria-label={text}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { setHovered(true); setIndex(0); } }}
    onPointerLeave={event => { if (event.pointerType !== 'touch') setHovered(false); }}
    onFocus={() => { setFocused(true); setIndex(0); }}
    onBlur={() => setFocused(false)}
  >
    <span aria-hidden="true">{text.split(' ').map((word, wordIndex) => <Fragment key={`${wordIndex}-${word}`}>
      {wordIndex > 0 && ' '}
      <span className="intro-role-word">{Array.from(word).map((character, characterIndex) => {
        const current = letterIndex++;
        return <span className="intro-role-letter" key={characterIndex} ref={element => { lettersRef.current[current] = element; }}>{character}</span>;
      })}</span>
    </Fragment>)}</span>
  </span>;
}
