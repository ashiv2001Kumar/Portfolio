"use client";

import { useEffect, useState } from "react";

/**
 * A full-screen welcome splash shown only on the very first visit.
 * Fades out after ~2.4 s and is never shown again (stored in sessionStorage).
 */
export default function WelcomeOverlay() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem("welcomed")) return;
    sessionStorage.setItem("welcomed", "1");
    setPhase("show");
    const fadeTimer = setTimeout(() => setPhase("fade"), 2200);
    const doneTimer = setTimeout(() => setPhase("hidden"), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "var(--bg)",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Radial glow behind the text */}
      <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,rgb(34_211_238/0.12),transparent)]" />

      <p
        className="font-mono text-xs uppercase tracking-[0.4em] text-cyan"
        style={{
          animation: "intro-in 0.6s cubic-bezier(0.2,0.7,0.2,1) 0.1s both",
        }}
      >
        sys.online · initialising
      </p>

      <h1
        className="gradient-text text-glow mt-4 text-center font-display text-4xl font-bold sm:text-6xl"
        style={{
          animation: "intro-in 0.7s cubic-bezier(0.2,0.7,0.2,1) 0.3s both",
        }}
      >
        Welcome to<br />
        <span className="text-cyan">Ashiv&apos;s World</span>
      </h1>

      <p
        className="mt-4 font-mono text-sm tracking-[0.2em] text-mute"
        style={{
          animation: "intro-in 0.7s cubic-bezier(0.2,0.7,0.2,1) 0.55s both",
        }}
      >
        — loading experience —
      </p>

      {/* Animated progress bar */}
      <div
        className="mt-8 h-px w-48 overflow-hidden rounded bg-ice/10"
        style={{ animation: "intro-in 0.5s cubic-bezier(0.2,0.7,0.2,1) 0.7s both" }}
      >
        <div
          className="h-full rounded bg-gradient-to-r from-cyan to-sky"
          style={{
            animation: "welcome-bar 1.8s cubic-bezier(0.4,0,0.2,1) 0.5s both",
          }}
        />
      </div>

      <style>{`
        @keyframes welcome-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
