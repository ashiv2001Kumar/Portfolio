import { experience } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        index="04"
        label="experience"
        title="Experience"
        description="Where I've been building, and what I've been building with."
      />

      <div className="relative">
        {/* The glowing spine of the timeline. */}
        <div
          className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-cyan via-sky/50 to-transparent shadow-[var(--glow-line)] md:left-1/2"
          aria-hidden="true"
        />
        <ol>
        {experience.map((item, i) => {
          const right = i % 2 === 1;
          const current = "current" in item && item.current;
          return (
            <li key={item.year} className="relative pb-10 pl-12 last:pb-0 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
              <span
                className={`absolute left-[9px] top-6 grid h-[13px] w-[13px] place-items-center rounded-full border border-cyan bg-bg md:left-1/2 md:-translate-x-1/2 ${
                  current ? "shadow-[var(--glow-dot-strong)]" : "shadow-[var(--glow-dot)]"
                }`}
                aria-hidden="true"
              >
                <span className="h-[5px] w-[5px] rounded-full bg-cyan" />
              </span>

              <Reveal delay={0.05} className={right ? "md:col-start-2" : "md:text-right"}>
                <article className="glass rounded-2xl p-6 transition-[border-color,box-shadow] duration-300 hover:border-cyan/30 hover:shadow-[var(--glow-hover)]">
                  <div className={`flex items-center gap-3 ${right ? "" : "md:flex-row-reverse"}`}>
                    <span className="font-display text-2xl font-bold text-cyan text-glow">{item.year}</span>
                    {current && (
                      <span className="flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">
                        <span className="status-dot !h-1.5 !w-1.5" /> now
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">{item.role}</h3>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-mute">{item.company}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{item.description}</p>
                  <ul className={`mt-4 flex flex-wrap gap-1.5 ${right ? "" : "md:justify-end"}`}>
                    {item.tags.map((t) => (
                      <li key={t} className="rounded-md bg-ice/5 px-2 py-1 font-mono text-[0.65rem] text-ice/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          );
        })}
        </ol>
      </div>
    </section>
  );
}
