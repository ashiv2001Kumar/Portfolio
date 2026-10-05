"use client";

import { useEffect, useRef, useState } from "react";
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
  return Array.from({ length: 40 }, (_, i) => ({
    left: rand() * 100,   // % of viewport width
    top: 10 + rand() * 85, // % of viewport height
    size: 0.8 + rand() * 2.5,
    dur: 10 + rand() * 20,
    delay: -rand() * 40,
    dx: (rand() - 0.5) * 120,
    o: 0.55 + rand() * 0.45,
    twinkle: i % 3 === 0,
    twinkleDur: 2 + rand() * 3,
    twinkleDelay: -rand() * 5,
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

type Ripple = { id: number; x: number; y: number };

// Per-particle physics state (lives outside React state to avoid re-renders)
type ParticleState = {
  vx: number; vy: number;   // current velocity
  ox: number; oy: number;   // offset from original position (px)
};

const REPEL_RADIUS = 180;   // px — how far the blast reaches
const REPEL_FORCE = 320;    // px/s impulse at point-blank
const FRICTION = 0.88;      // velocity multiplied each frame (< 1 = decay)
const RETURN_SPRING = 0.04; // how strongly stars spring back to origin

export default function Background() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  // Refs to every particle DOM element
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Physics state per particle
  const physics = useRef<ParticleState[]>(
    PARTICLES.map(() => ({ vx: 0, vy: 0, ox: 0, oy: 0 }))
  );
  const rafId = useRef(0);
  const active = useRef(false); // true while any star is still moving

  // Physics loop — runs only while stars are in motion
  const startLoop = () => {
    if (active.current) return;
    active.current = true;
    const loop = () => {
      let anyMoving = false;
      const els = particleRefs.current;
      const states = physics.current;

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        const el = els[i];
        if (!el) continue;

        // Spring back toward origin
        s.vx += -s.ox * RETURN_SPRING;
        s.vy += -s.oy * RETURN_SPRING;

        // Friction
        s.vx *= FRICTION;
        s.vy *= FRICTION;

        s.ox += s.vx;
        s.oy += s.vy;

        // Write to DOM
        el.style.translate = `${s.ox.toFixed(2)}px ${s.oy.toFixed(2)}px`;

        if (Math.abs(s.ox) > 0.3 || Math.abs(s.oy) > 0.3 ||
            Math.abs(s.vx) > 0.1 || Math.abs(s.vy) > 0.1) {
          anyMoving = true;
        }
      }

      if (anyMoving) {
        rafId.current = requestAnimationFrame(loop);
      } else {
        // Snap everything back to origin cleanly
        for (let i = 0; i < states.length; i++) {
          states[i].ox = 0; states[i].oy = 0;
          states[i].vx = 0; states[i].vy = 0;
          const el = els[i];
          if (el) el.style.translate = "0px 0px";
        }
        active.current = false;
      }
    };
    rafId.current = requestAnimationFrame(loop);
  };

  // Parallax scroll
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
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [reduced]);

  // Click → ripple + star repel
  useEffect(() => {
    if (reduced) return;

    const handleClick = (e: MouseEvent) => {
      // Ripple
      const id = nextId.current++;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 2000);

      // Repel stars
      const cx = e.clientX;
      const cy = e.clientY;
      const els = particleRefs.current;
      const states = physics.current;

      for (let i = 0; i < PARTICLES.length; i++) {
        const el = els[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const sx = rect.left + rect.width / 2;
        const sy = rect.top + rect.height / 2;
        const dx = sx - cx;
        const dy = sy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          // Stronger push for closer stars
          const strength = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          states[i].vx += (dx / dist) * strength;
          states[i].vy += (dy / dist) * strength;
        }
      }

      startLoop();
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafId.current);
    };
  }, [reduced]);

  return (
    <div ref={root} className="fixed inset-0 -z-10 overflow-hidden bg-bg" aria-hidden="true">
      {/* Sky */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_28%,var(--sky-low)_48%,var(--sky-horizon)_62%,var(--sky-low)_76%,var(--sky-bottom)_100%)]" />
      <div className="absolute -right-[10%] -top-[20%] h-[90%] w-[70%] bg-[conic-gradient(from_200deg_at_70%_0%,transparent_0deg,rgb(var(--atmo-rgb)/0.07)_18deg,transparent_34deg,rgb(var(--atmo-2-rgb)/0.05)_52deg,transparent_70deg)] [mask-image:radial-gradient(60%_70%_at_70%_20%,black,transparent)]" />
      <div className="absolute inset-x-[-10%] top-[45%] h-[35%] bg-[radial-gradient(50%_50%_at_50%_55%,rgb(var(--atmo-rgb)/0.14),transparent)]" />

      {/* Clouds */}
      <div data-depth="0.02" className="absolute inset-0 will-change-transform">
        <div className="absolute left-[-10%] top-[12%] h-[22%] w-[55%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-rgb)/0.1),transparent)]" />
        <div className="absolute right-[-5%] top-[24%] h-[18%] w-[45%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-rgb)/0.07),transparent)]" />
        <div className="absolute left-[30%] top-[38%] h-[14%] w-[50%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--atmo-2-rgb)/0.07),transparent)]" />
      </div>

      {/* Distant city */}
      <div data-depth="0.05" className="absolute inset-x-0 top-[48%] h-[18%] opacity-90 will-change-transform [mask-image:linear-gradient(180deg,black_55%,transparent)]">
        <Skyline towers={FAR_TOWERS} fill="var(--city-far)" lightOpacity={0.45} />
      </div>
      <div data-depth="0.08" className="absolute inset-x-0 top-[50%] h-[18%] will-change-transform [mask-image:linear-gradient(180deg,black_45%,transparent)]">
        <Skyline towers={NEAR_TOWERS} fill="var(--city-near)" lightOpacity={0.75} />
      </div>
      <div className="absolute inset-x-0 top-[58%] h-[22%] bg-[linear-gradient(180deg,transparent,rgb(var(--atmo-rgb)/0.08),transparent)]" />

      {/* Stars / particles — each gets a ref for imperative repel */}
      <div className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            ref={(el) => { particleRefs.current[i] = el; }}
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
                willChange: "translate",
                ...(p.twinkle && {
                  animation: `drift ${p.dur}s linear ${p.delay}s infinite, star-twinkle ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
                }),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_55%,var(--vignette))]" />

      {/* Ripple rings */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="pointer-events-none absolute"
          style={{ left: r.x, top: r.y, transform: "translate(-50%,-50%)" }}
        >
          {[0, 0.18, 0.36].map((delay, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                borderRadius: "50%",
                border: "1.5px solid rgb(34 211 238 / 0.7)",
                boxShadow: "0 0 8px 2px rgb(34 211 238 / 0.35)",
                animation: `ripple-expand 1.3s cubic-bezier(0.15,0.5,0.5,1) ${delay}s both`,
              }}
            />
          ))}
          {/* Flash dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgb(186 243 255 / 0.95)",
              boxShadow: "0 0 18px 6px rgb(34 211 238 / 0.8)",
              animation: "ripple-flash 0.5s ease-out both",
            }}
          />
        </div>
      ))}
    </div>
  );
}
