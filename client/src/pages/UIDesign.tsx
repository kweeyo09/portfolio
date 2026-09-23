import ProjectIndex from '../components/ProjectIndex';

const projects = [
  { title: 'Budget App', href: '/budget-app' },
  { title: 'Limelight', href: '/limelight' },
];

export default function UIDesign() {
  return (
    <ProjectIndex
      heading="UI Design"
      description="Digital experiences crafted with attention to detail and user-centered design principles."
      projects={projects}
    />
  );
}
