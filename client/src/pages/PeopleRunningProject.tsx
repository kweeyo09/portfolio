/**
 * People Running — 3D & Motion
 * After Effects piece; portrait video shown at full height, no stills.
 */

import CaseStudy from '../components/CaseStudy';

export default function PeopleRunningProject() {
  return (
    <CaseStudy
      section="3D & Motion"
      backHref="/3d-motion"
      eyebrow="Motion Graphics · Personal Project"
      title="People Running"
      description="A short motion piece made in After Effects — a figure turned to light, set against a field and sky, with hand-drawn scribbles animating around it."
      media={[
        {
          type: 'video',
          src: '/assets/people-running_c627b711.mp4',
          alt: 'Glowing figure in a green field with hand-drawn line animation',
        },
      ]}
    />
  );
}
