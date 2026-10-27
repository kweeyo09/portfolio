import { useEffect, useRef, useState } from 'react';

const roles = ['a designer', 'a storyteller', 'a professional fake rock lover', 'a matcha enthusiast'];

export default function IntroRole({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const hoverBounds = useRef<DOMRect | null>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const paused = hovered || focused;
  const text = paused ? roles[0] : roles[index];

  useEffect(() => {
    setSelected(false);
    if (!active || reduced || paused) return;
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (document.hidden) { schedule(); return; }
        setSelected(true);
        timer = window.setTimeout(() => {
          setIndex(value => (value + 1) % roles.length);
          timer = window.setTimeout(() => { setSelected(false); schedule(); }, 90);
        }, 90);
      }, 1000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, reduced, paused]);

  useEffect(() => {
    if (!hovered) return;
    const trackPointer = (event: PointerEvent) => {
      const original = hoverBounds.current;
      const current = roleRef.current?.getBoundingClientRect();
      const contains = (bounds: DOMRect | null | undefined) => bounds && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!contains(original) && !contains(current)) setHovered(false);
    };
    const leaveWindow = () => setHovered(false);
    window.addEventListener('pointermove', trackPointer, { passive: true });
    window.addEventListener('blur', leaveWindow);
    return () => {
      window.removeEventListener('pointermove', trackPointer);
      window.removeEventListener('blur', leaveWindow);
    };
  }, [hovered]);

  return <span
    ref={roleRef}
    className={`intro-role${selected && !paused ? ' is-selected' : ''}${paused ? ' is-paused' : ''}`}
    tabIndex={active ? 0 : -1}
    aria-label={text}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { hoverBounds.current = event.currentTarget.getBoundingClientRect(); setHovered(true); setIndex(0); } }}
    onFocus={() => { setFocused(true); setIndex(0); }}
    onBlur={() => setFocused(false)}
  >
    <span className="intro-role-text" aria-hidden="true">{text}</span>
  </span>;
}
