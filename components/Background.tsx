"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Deterministic pseudo-random numbers, so server and client render the same scene. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Tower = { x: number; w: number; h: number; lights: { x: number; y: number }[] };

function skyline(seed: number, count: number, maxH: number): Tower[] {
  const rand = seeded(seed);
  const towers: Tower[] = [];
  let x = 0;
  for (let i = 0; i < count && x < 1440; i++) {
    const w = 28 + rand() * 60;
    const h = maxH * (0.25 + rand() * 0.75);
    const lights = Array.from({ length: Math.floor(rand() * 4) }, () => ({
      x: x + 6 + rand() * (w - 12),
      y: 200 - h + 10 + rand() * (h - 20),
    }));
    towers.push({ x, w, h, lights });
    x += w + rand() * 26;
  }
  return towers;
}

const FAR_TOWERS = skyline(7, 40, 120);
const NEAR_TOWERS = skyline(19, 30, 170);

const PARTICLES = (() => {
  const rand = seeded(42);
  return Array.from({ length: 22 }, () => ({
    left: rand() * 100,
    top: 20 + rand() * 75,
    size: 1 + rand() * 2,
    dur: 14 + rand() * 16,
    delay: -rand() * 30,
    dx: (rand() - 0.5) * 80,
    o: 0.25 + rand() * 0.45,
  }));
})();

function Skyline({ towers, fill, lightOpacity }: { towers: Tower[]; fill: string; lightOpacity: number }) {
  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      {towers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={200 - t.h} width={t.w} height={t.h} style={{ fill }} />
          {i % 3 === 0 && <rect x={t.x + t.w / 2 - 0.6} y={200 - t.h - 14} width={1.2} height={14} style={{ fill }} />}
          {t.lights.map((l, j) => (
            <rect key={j} x={l.x} y={l.y} width={2.4} height={1.6} style={{ fill: "var(--window)" }} opacity={lightOpacity} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * Fixed scene behind the whole page: sky, clouds and a distant city fading
 * into haze on the horizon. Layers drift at different speeds as the page
 * scrolls; with reduced motion everything stays still.
 */
export default function Background() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const layers = Array.from(root.current?.querySelectorAll<HTMLDivElement>("[data-depth]") ?? []);
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      layers.forEach((el) => {
        el.style.transform = `translate3d(0, ${-Math.min(y * Number(el.dataset.depth), 140)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg" aria-hidden="true">
      {/* Sky: one continuous gradient, brightest at the horizon behind the city. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_28%,var(--sky-low)_48%,var(--sky-horizon)_62%,var(--sky-low)_76%,var(--sky-bottom)_100%)]" />
      <div className="absolute -right-[10%] -top-[20%] h-[90%] w-[70%] bg-[conic-gradient(from_200deg_at_70%_0%,transparent_0deg,rgb(var(--atmo-rgb)/0.07)_18deg,transparent_34deg,rgb(var(--atmo-2-rgb)/0.05)_52deg,transparent_70deg)] [mask-image:radial-gradient(60%_70%_at_70%_20%,black,transparent)]" />
      <div className="absolute inset-x-[-10%] top-[45%] h-[35%] bg-[radial-gradient(50%_50%_at_50%_55%,rgb(var(--atmo-rgb)/0.14),transparent)]" />

      {/* Clouds */}
      <div data-depth="0.02" className="absolute inset-0 will-change-transform">
        <div className="absolute left-[-10%] top-[12%] h-[22%] w-[55%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-rgb)/0.1),transparent)]" />
        <div className="absolute right-[-5%] top-[24%] h-[18%] w-[45%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-rgb)/0.07),transparent)]" />
        <div className="absolute left-[30%] top-[38%] h-[14%] w-[50%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-2-rgb)/0.07),transparent)]" />
      </div>

      {/* Distant city, fading into haze at its base so there is no hard horizon. */}
      <div
        data-depth="0.05"
        className="absolute inset-x-0 top-[48%] h-[18%] opacity-90 will-change-transform [mask-image:linear-gradient(180deg,black_55%,transparent)]"
      >
        <Skyline towers={FAR_TOWERS} fill="var(--city-far)" lightOpacity={0.45} />
      </div>
      <div
        data-depth="0.08"
        className="absolute inset-x-0 top-[50%] h-[18%] will-change-transform [mask-image:linear-gradient(180deg,black_45%,transparent)]"
      >
        <Skyline towers={NEAR_TOWERS} fill="var(--city-near)" lightOpacity={0.75} />
      </div>
      <div className="absolute inset-x-0 top-[58%] h-[22%] bg-[linear-gradient(180deg,transparent,rgb(var(--atmo-rgb)/0.08),transparent)]" />

      {/* Particles */}
      <div className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                "--dur": `${p.dur}s`,
                "--delay": `${p.delay}s`,
                "--dx": `${p.dx}px`,
                "--o": p.o,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_55%,var(--vignette))]" />
    </div>
  );
}
