import { experience, profile, skillGroups, technologies } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function CardHeader({ code, title }: { code: string; title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <span className="hud-label">{code}</span>
    </div>
  );
}

export default function About() {
  const current = experience[experience.length - 1];
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        index="01"
        label="about"
        title="A developer's workspace, built for shipping."
        description="I design and build complete products, from the first sketch of an interface to the database that powers it."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <article className="glass hud-corners h-full rounded-2xl p-6 sm:p-8">
            <CardHeader code="usr.profile" title="About Me" />
            <div className="mt-5 space-y-4 leading-relaxed text-mute">
              {profile.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {profile.stats.map((s) => (
                <div key={s.label} className="glass-soft rounded-xl p-4">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mute">{s.label}</dt>
                  <dd className="gradient-text mt-1 font-display text-2xl font-bold sm:text-3xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.1}>
          <article className="glass h-full rounded-2xl p-6 sm:p-8">
            <CardHeader code="log.career" title="Experience" />
            <div className="mt-5 flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan/30 bg-cyan/10 font-mono text-sm text-cyan">
                {current.year.slice(2)}
              </div>
              <div>
                <p className="font-medium text-ink">{current.role}</p>
                <p className="text-sm text-mute">{current.company}</p>
              </div>
            </div>
            <ol className="mt-6 space-y-3 border-l border-cyan/20 pl-5">
              {experience.map((e) => (
                <li key={e.year} className="relative text-sm">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-cyan shadow-[var(--glow-dot)]" />
                  <span className="font-mono text-cyan/80">{e.year}</span>
                  <span className="ml-3 text-ink/90">{e.role}</span>
                </li>
              ))}
            </ol>
            <a href="#experience" className="mt-6 inline-flex font-mono text-xs uppercase tracking-[0.2em] text-cyan hover:text-ice">
              full timeline →
            </a>
          </article>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.05}>
          <article className="glass h-full rounded-2xl p-6 sm:p-8">
            <CardHeader code="sys.skills" title="Skills" />
            <ul className="mt-5 space-y-4">
              {skillGroups.map((g) => (
                <li key={g.title}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">{g.title}</span>
                    <span className="font-mono text-[0.65rem] text-mute">{g.code}</span>
                  </div>
                  <p className="mt-1 text-sm text-mute">{g.items.slice(0, 3).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.15}>
          <article className="glass h-full rounded-2xl p-6 sm:p-8">
            <CardHeader code="pkg.stack" title="Technologies" />
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {technologies.map((t) => (
                <li
                  key={t.name}
                  className="rounded-lg border border-cyan/20 bg-cyan/[0.06] px-3.5 py-2 font-mono text-xs text-ice transition-colors hover:border-cyan/50 hover:bg-cyan/10"
                >
                  {t.name}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
