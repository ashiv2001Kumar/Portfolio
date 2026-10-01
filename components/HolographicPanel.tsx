import { profile } from "@/lib/data";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/** The intro card in the hero: name, role, tagline and the two calls to action. */
export default function HolographicPanel() {
  const [first, ...others] = profile.name.toUpperCase().split(" ");
  const rest = others.join(" ");

  return (
    <div className="glass hud-corners hero-panel relative overflow-hidden rounded-2xl p-5 sm:p-8">
      <div className="scanline" />
      <div className="dark-only pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan/10 blur-3xl" />
      <div className="light-only pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />

      <div className="intro-item flex items-center justify-between gap-4" style={d(0.15)}>
        <div className="flex items-center gap-2.5">
          <span className="status-dot" />
          <span className="hud-label">sys.online</span>
        </div>
        <span className="hud-label hidden sm:inline">id · ak-01 / 2026</span>
      </div>

      <div className="intro-item mt-4 h-px sm:mt-6 bg-gradient-to-r from-cyan/50 via-ice/10 to-transparent" style={d(0.25)} />

      <p className="intro-item hud-label mt-4 !text-[0.75rem] !text-cyan sm:mt-6" style={d(0.35)}>
        Hello, I&apos;m
      </p>
      <h1
        className="intro-item gradient-text text-glow mt-2 font-display text-[2.35rem] font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-[4.2rem]"
        style={d(0.45)}
      >
        {first}
        {rest && <span className="name-accent"> {rest}</span>}
      </h1>
      <p className="intro-item mt-3 font-mono text-xs uppercase sm:mt-4 sm:text-base tracking-[0.28em] text-ice hero-role" style={d(0.6)}>
        {profile.role}
        <span className="cursor-blink ml-1 text-cyan">_</span>
      </p>
      <p className="intro-item mt-3 max-w-md text-[0.95rem] leading-relaxed text-mute sm:mt-4 sm:text-lg" style={d(0.72)}>
        {profile.tagline}
      </p>

      <div className="intro-item mt-6 flex flex-wrap gap-3 sm:mt-8" style={d(0.85)}>
        <a href="#projects" className="btn-primary max-sm:gap-2 max-sm:px-4 max-sm:text-[0.7rem] max-sm:tracking-[0.12em]">
          VIEW PROJECTS
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
        <a href="#contact" className="btn-ghost max-sm:px-4 max-sm:text-[0.7rem] max-sm:tracking-[0.12em]">
          CONTACT ME
        </a>
      </div>

      <div
        className="intro-item mt-8 hidden grid-cols-3 gap-2 border-t sm:grid border-ice/10 pt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mute sm:text-[0.7rem]"
        style={d(1)}
      >
        <div>
          <div className="text-ice/40">status</div>
          <div className="mt-1 flex items-center gap-1.5 text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[var(--glow-dot)]" />
            available
          </div>
        </div>
        <div>
          <div className="text-ice/40">stack</div>
          <div className="mt-1 text-ice/80">full · web</div>
        </div>
        <div>
          <div className="text-ice/40">signal</div>
          <div className="mt-1 flex items-end gap-0.5" aria-hidden="true">
            {[4, 7, 10, 13].map((h) => (
              <span key={h} className="w-1 rounded-sm bg-cyan/80" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
