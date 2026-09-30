import { useEffect, useRef, type MouseEvent } from 'react';
import { useLocation } from 'wouter';
import { useLetterPhysics } from './useLetterPhysics';
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
  const { letters, hoverHandlers, scatter } = useLetterPhysics(title);
  const leavingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const openProject = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (leavingRef.current) return;
    leavingRef.current = true;
    if (!scatter()) {
      setLocation(href);
      return;
    }
    timerRef.current = window.setTimeout(() => setLocation(href), 850);
  };

  return (
    <a className="project-index__link" href={href} onClick={openProject} {...hoverHandlers}>
      <span className="project-index__title">
        <span className="sr-only">{title}</span>
        <span aria-hidden="true">{letters}</span>
      </span>
    </a>
  );
}

function PhysicsParagraph({ text }: { text: string }) {
  const { letters, hoverHandlers } = useLetterPhysics(text);
  return (
    <p {...hoverHandlers}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{letters}</span>
    </p>
  );
}

export default function ProjectIndex({ heading, description, projects }: ProjectIndexProps) {
  const [, setLocation] = useLocation();

  return (
    <main className="project-index">
      <button type="button" className="project-index__back" onClick={() => setLocation('/flowers')}>back</button>
      <div className="project-index__content">
        <header className="project-index__header">
          <h1>{heading.toLowerCase()}</h1>
          <PhysicsParagraph text={description.toLowerCase()} />
        </header>
        <nav className="project-index__list" aria-label={`${heading.toLowerCase()} projects`}>
          {projects.map(project => <ProjectLink key={project.href} {...project} />)}
        </nav>
      </div>
    </main>
  );
}
