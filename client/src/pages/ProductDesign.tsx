import ProjectIndex from '../components/ProjectIndex';

const projects = [
  { title: 'Red Bull', href: '/product-design/redbull' },
  { title: 'Keyboard Commercial', href: '/product-design/keyboard' },
];

export default function ProductDesign() {
  return (
    <ProjectIndex
      heading="Product Design"
      description="Thoughtfully designed products that balance aesthetics with functionality."
      projects={projects}
    />
  );
}
