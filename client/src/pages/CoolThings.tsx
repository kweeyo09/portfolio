import ProjectIndex from '../components/ProjectIndex';

export default function CoolThings() {
  return <ProjectIndex
    heading="Cool things I've been working on"
    description="Small experiments in art, interaction and making things for the joy of it. Try them for yourself."
    projects={[{title:'Paper in Bloom — a Chinese paper-cutting studio',href:'/paper-art'}]}
  />;
}
