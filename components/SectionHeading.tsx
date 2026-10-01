import Reveal from "./Reveal";

export default function SectionHeading({
  index,
  label,
  title,
  description,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-12 max-w-2xl sm:mb-14">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-cyan">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-cyan to-transparent" />
        <span className="hud-label">{label}</span>
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-mute sm:text-lg">{description}</p>}
    </Reveal>
  );
}
