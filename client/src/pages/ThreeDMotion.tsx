import ProjectIndex from '../components/ProjectIndex';

const projects = [
  { title: 'Red Bull', href: '/product-design/redbull' },
  { title: 'Keyboard Commercial', href: '/product-design/keyboard' },
  { title: 'Armani Perfume Campaign', href: '/product-design/armani' },
  { title: 'Jelly Flower', href: '/3d-motion/jellyflower' },
];

export default function ThreeDMotion() {
  return (
    <ProjectIndex
      heading="3D & Motion"
      description="3D product visualisation, animation and motion graphics that bring ideas to life."
      projects={projects}
    />
  );
}
