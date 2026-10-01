import { navLinks, profile, socials } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl px-5 pb-10 pt-6 sm:px-8">
      <div className="glass rounded-2xl px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 font-display text-sm font-bold text-ice">
              AK
            </span>
            <div>
              <p className="font-display font-semibold text-ink">{profile.name}</p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mute">{profile.role}</p>
            </div>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="transition-colors hover:text-cyan">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-ice/15 font-mono text-[0.65rem] text-ice transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  {s.short}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ice/10 pt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="status-dot !h-1.5 !w-1.5" /> built with next.js · end of transmission
          </p>
        </div>
      </div>
    </footer>
  );
}
