import { projects } from "@/lib/data";
import ProjectSlider from "./ProjectSlider";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Projects() {
  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        index="03"
        label="projects"
        title="Selected Projects"
        description="A few things I've designed and built recently, end to end."
      />
      <Reveal>
        <ProjectSlider items={projects} />
      </Reveal>
    </section>
  );
}
