import ProjectIndex from '../components/ProjectIndex';
import { CAMPAIGN_PROJECTS } from './graphicCampaignProjects';

const projects = [{ title: 'Armani Perfume Campaign', href: '/graphic-campaign/armani' }, ...CAMPAIGN_PROJECTS.map(({ title, slug }) => ({
  title,
  href: `/graphic-campaign/${slug}`,
}))];

export default function GraphicCampaign() {
  return (
    <ProjectIndex
      heading="Graphic & Campaign"
      description="Campaigns, social content and print — brand briefs, internship work and personal projects."
      projects={projects}
    />
  );
}
