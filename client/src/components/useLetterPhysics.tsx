import { Fragment, useCallback, useEffect, useRef } from 'react';
import { Bodies, Body, Composite, Constraint, Engine } from 'matter-js';

/**
 * Letters that jiggle on hover and ease back into place when `reset()` is called.
 */
export function useLetterPhysics(text: string) {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const constraintsRef = useRef<Constraint[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const resettingRef = useRef(false);
  const scatteredRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const engine = Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;
    let frame = 0;
    let active = true;
    let origins: { x: number; y: number }[] = [];

    const rebuild = () => {
      if (scatteredRef.current) return;
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
          frictionAir: 0.085,
          collisionFilter: { group: -1 },
        });
      });
      constraintsRef.current = bodiesRef.current.map((body, index) => Constraint.create({
        pointA: origins[index],
        bodyB: body,
        length: 0,
        stiffness: 0.055,
        damping: 0.14,
      }));
      Composite.add(engine.world, [...bodiesRef.current, ...constraintsRef.current]);
    };

    const animate = () => {
      if (!active) return;
      Engine.update(engine, 1000 / 60);
      if (resettingRef.current && !scatteredRef.current) {
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
  }, [text]);

  const jiggle = useCallback((index: number) => {
    if (scatteredRef.current) return;
    const body = bodiesRef.current[index];
    if (!body) return;
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 6.5, y: -4.5 - Math.random() * 2.8 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.24);
  }, []);

  /** Drops the letters under gravity; returns false when physics is disabled. */
  const scatter = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return false;
    scatteredRef.current = true;
    constraintsRef.current.forEach(constraint => Composite.remove(engine.world, constraint));
    engine.gravity.y = 1.15;
    bodiesRef.current.forEach(body => {
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: -4 - Math.random() * 3 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.17);
    });
    return true;
  }, []);

  const hoverHandlers = {
    onPointerEnter: () => { resettingRef.current = false; },
    onPointerLeave: () => { resettingRef.current = true; },
  };

  let letterIndex = 0;
  const letters = text.split(' ').map((word, wordIndex) => (
    <Fragment key={`${word}-${wordIndex}`}>
      {wordIndex > 0 && ' '}
      <span className="physics-word">
        {Array.from(word).map(character => {
          const index = letterIndex++;
          return <span className="physics-letter" key={index} ref={element => { lettersRef.current[index] = element; }} onPointerEnter={() => jiggle(index)}>{character}</span>;
        })}
      </span>
    </Fragment>
  ));

  return { letters, hoverHandlers, scatter };
}
