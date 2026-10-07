import CaseStudy from '../components/CaseStudy';
import NotFound from './NotFound';
import { CAMPAIGN_PROJECTS } from './graphicCampaignProjects';

export default function GraphicCampaignProject({ params }: { params: { slug: string } }) {
  const project = CAMPAIGN_PROJECTS.find((p) => p.slug === params.slug);
  if (!project) return <NotFound />;

  return (
    <CaseStudy
      section="Graphic & Campaign"
      backHref="/graphic-campaign"
      eyebrow={project.eyebrow}
      title={project.title}
      description={project.description}
      note={project.note}
      layout={project.layout}
      media={project.media}
    />
  );
}
