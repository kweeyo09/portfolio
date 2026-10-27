import { useEffect, useState } from 'react';

const roles = ['a designer', 'a storyteller', 'a professional fake rock lover', 'a matcha enthusiast'];

export default function IntroRole({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
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
          timer = window.setTimeout(() => { setSelected(false); schedule(); }, 180);
        }, 180);
      }, 2200);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, reduced, paused]);

  return <span
    className={`intro-role${selected && !paused ? ' is-selected' : ''}`}
    tabIndex={active ? 0 : -1}
    aria-label={text}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { setHovered(true); setIndex(0); } }}
    onPointerLeave={event => { if (event.pointerType !== 'touch') setHovered(false); }}
    onFocus={() => { setFocused(true); setIndex(0); }}
    onBlur={() => setFocused(false)}
  >
    <span className="intro-role-text" aria-hidden="true">{text}</span>
  </span>;
}
