import { useEffect, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { CAMPAIGN_PROJECTS } from '../pages/graphicCampaignProjects';
import './ProjectIndex.css';

interface Project { title: string; href: string; }
interface ProjectIndexProps { heading: string; description: string; projects: Project[]; }
const covers: Record<string, string> = {
  '/paper-art': '/assets/paper-art-postcard-v1.webp',
  '/focusnest': '/assets/focusnest-postcard-v1.webp',
  '/ccn-london': '/assets/ccn-postcard-v1.webp',
  '/limelight': '/assets/limelight-postcard-v1.webp',
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
  return null;
}

export default function ProjectIndex({heading, projects}: ProjectIndexProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <main className="project-index">
    <Link className="project-index__back" href="/flowers">← back</Link>
    <nav className="postcard-gallery" aria-label={`${heading} projects`}>
      {projects.map((project, index) => <Link key={project.href} href={project.href} className="project-postcard" aria-label={project.title} style={{'--tilt': `${rotations[index % rotations.length]}deg`} as CSSProperties}>
        <div className="project-postcard__visual"><Cover project={project} /></div>
      </Link>)}
    </nav>
  </main>;
}
