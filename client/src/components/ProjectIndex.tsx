import { useEffect, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { CAMPAIGN_PROJECTS } from '../pages/graphicCampaignProjects';
import './ProjectIndex.css';

interface Project { title: string; href: string; }
interface ProjectIndexProps { heading: string; description: string; projects: Project[]; }
const covers: Record<string, string> = {
  '/budget-app': '/assets/budget-app-full_9f9cebd2.png',
  '/graphic-campaign/armani': '/assets/armani-01_ea2ea9c0.webp',
  '/product-design/redbull': '/assets/0072_a1b84a09.webp',
  '/product-design/keyboard': '/assets/0001_655eb5c3.webp',
  '/3d-motion/jellyflower': '/assets/jellyflower_bf91d6d2.webp',
  ...Object.fromEntries(CAMPAIGN_PROJECTS.map(project => [`/graphic-campaign/${project.slug}`, project.media[0].src])),
};
const rotations = [-3, 2.5, -1.8, 3, -2, 1.5];

function Cover({project}: {project: Project}) {
  const src = covers[project.href];
  if (src) return <img src={src} alt="" loading="lazy" decoding="async" />;
  const kind = project.href.slice(1);
  return <div className={`postcard-art postcard-art--${kind}`} aria-hidden="true">
    {kind === 'focusnest' ? <><span className="postcard-orbit">✳</span><strong>FocusNest</strong><small>A little space to focus.</small></> :
      kind === 'limelight' ? <><small>TAKE YOUR SEAT</small><strong>Limelight<span>★★★★★</span></strong><small>For the love of theatre.</small></> :
      kind === 'ccn-london' ? <><small>CAMBRIDGE CONSULTING NETWORK</small><strong>CCN<br /><em>London.</em></strong><span className="postcard-rule" /></> :
      <><span className="postcard-paper">囍</span><strong>Paper in Bloom</strong><small>剪纸 · A paper-cutting studio</small></>}
  </div>;
}

export default function ProjectIndex({heading, description, projects}: ProjectIndexProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <main className="project-index">
    <Link className="project-index__back" href="/flowers">← back</Link>
    <header className="project-index__header"><h1>{heading}</h1><p>{description}</p></header>
    <nav className="postcard-gallery" aria-label={`${heading} projects`}>
      {projects.map((project, index) => <Link key={project.href} href={project.href} className="project-postcard" style={{'--tilt': `${rotations[index % rotations.length]}deg`} as CSSProperties}>
        <div className="project-postcard__visual"><Cover project={project} /></div>
        <span className="project-postcard__caption">{project.title}<span aria-hidden="true">↗</span></span>
      </Link>)}
    </nav>
  </main>;
}
