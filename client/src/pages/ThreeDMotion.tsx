import ProjectIndex from '../components/ProjectIndex';

const projects = [
  { title: 'Jelly Flower', href: '/3d-motion/jellyflower' },
];

export default function ThreeDMotion() {
  return (
    <ProjectIndex
      heading="3D & Motion"
      description="Immersive 3D models and dynamic motion graphics that bring ideas to life."
      projects={projects}
    />
  );
}
