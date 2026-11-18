"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data";

type Phase = "idle" | "box" | "expand" | "hold" | "out" | "done";

/** Lets the hero know the splash is finished so its walk can start underneath. */
export function signalWelcomeDone() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("portfolio-welcome-done"));
}

/**
 * Load reveal: a themed centre panel expands to full screen while the welcome
 * text grows with it, then both fade away into the home screen.
 */
export default function WelcomeOverlay() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const timers: number[] = [];
    const later = (fn: () => void, ms = 0) => {
      timers.push(window.setTimeout(fn, ms));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      later(() => {
        signalWelcomeDone();
        setPhase("done");
      });
      return () => timers.forEach(clearTimeout);
    }

    later(() => setPhase("box"));
    later(() => setPhase("expand"), 300);
    later(() => setPhase("hold"), 1250);
    later(() => setPhase("out"), 2400);
    later(() => {
      setPhase("done");
      signalWelcomeDone();
    }, 3100);

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "idle" || phase === "done") return null;

  const open = phase === "expand" || phase === "hold" || phase === "out";
  const leaving = phase === "out";

  // Text grows on the same curve as the panel width/height.
  const textScale = phase === "box" ? 0.2 : leaving ? 1.12 : 1;
  const textOpacity = phase === "box" ? 0 : leaving ? 0 : 1;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-9999 grid place-items-center overflow-hidden"
      style={{
        pointerEvents: leaving ? "none" : "auto",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.6s ease",
        background: "var(--bg-2)",
      }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: open ? "100vw" : 72,
          height: open ? "100vh" : 72,
          borderRadius: open ? 0 : 12,
          background:
            "linear-gradient(145deg, rgb(var(--accent-rgb) / 0.28), var(--glass) 42%, rgb(var(--accent-2-rgb) / 0.18))",
          border: open ? "0 solid transparent" : "1px solid rgb(var(--accent-rgb) / 0.45)",
          boxShadow: open
            ? "none"
            : "0 0 40px rgb(var(--accent-rgb) / 0.35), 0 24px 60px rgb(0 0 0 / 0.35)",
          transition: leaving
            ? "width 0.6s ease, height 0.6s ease, border-radius 0.5s ease, box-shadow 0.4s ease"
            : "width 0.95s cubic-bezier(0.76, 0, 0.24, 1), height 0.95s cubic-bezier(0.76, 0, 0.24, 1), border-radius 0.95s cubic-bezier(0.76, 0, 0.24, 1), box-shadow 0.5s ease, border 0.5s ease",
          willChange: "width, height",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_45%,rgb(var(--accent-rgb)/0.18),transparent)]"
          aria-hidden="true"
        />

        <div
          className="relative z-10 flex flex-col items-center px-6 text-center"
          style={{
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            transition: leaving
              ? "opacity 0.5s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              : "opacity 0.7s ease 0.2s, transform 0.95s cubic-bezier(0.76, 0, 0.24, 1)",
            willChange: "opacity, transform",
          }}
        >
          <p className="flex items-center gap-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.32em] text-cyan">
            <span className="status-dot" />
            sys.online
          </p>

          <h1 className="gradient-text text-glow mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Welcome
          </h1>
          <p className="mt-2 font-display text-2xl font-bold text-cyan sm:text-4xl">{profile.name}</p>

          <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-mute">
            — loading experience —
          </p>
        </div>
      </div>
    </div>
  );
}
