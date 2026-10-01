import { skillGroups, technologies } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        index="02"
        label="skills"
        title="Skills & Technologies"
        description="The tools I reach for every day, across the frontend, the backend and everything that ships them."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {skillGroups.map((group, i) => {
          const techs = technologies.filter((t) => t.group === group.title);
          return (
            <Reveal key={group.title} delay={i * 0.08}>
              <article className="glass group h-full rounded-2xl p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan/30 hover:shadow-[var(--glow-hover)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan/30 bg-cyan/10 font-mono text-xs text-cyan">
                    0{i + 1}
                  </span>
                  <span className="hud-label">{group.code}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{group.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{group.description}</p>

                <ul className="mt-6 space-y-4">
                  {techs.map((t) => (
                    <li key={t.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink/90">{t.name}</span>
                        <span className="font-mono text-xs text-cyan/80">{t.level}%</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ice/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky to-cyan shadow-[var(--glow-line)]"
                          style={{ width: `${t.level}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-ice/10 pt-5">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-md bg-ice/5 px-2 py-1 font-mono text-[0.65rem] text-mute">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
