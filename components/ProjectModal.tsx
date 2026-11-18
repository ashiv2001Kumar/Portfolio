"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { projects } from "@/lib/data";

type Project = (typeof projects)[number];

/** Full-screen pop-out for a project card: scales in over a dimmed backdrop. */
export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[color:var(--bg)]/70"
        style={{ animation: "project-backdrop-in 0.28s ease both" }}
      />

      <article
        className="glass relative z-10 flex max-h-[min(92svh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-[var(--glow-hover)]"
        style={{ animation: "project-pop-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-ice/15 bg-bg/70 font-mono text-lg text-ink transition-colors hover:border-cyan/40 hover:text-cyan"
          aria-label="Close project"
        >
          ×
        </button>

        <div className="relative aspect-[16/9] shrink-0 overflow-hidden border-b border-ice/10">
          <Image
            src={project.image}
            alt={`${project.name} screenshot`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--img-fade),transparent_55%)]" />
          <span className="glass-soft absolute left-4 top-4 rounded-md px-2 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-ice/80">
            {project.code}
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
          <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">{project.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-mute sm:text-base">{project.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li
                key={t}
                className="rounded-md border border-cyan/25 bg-cyan/[0.08] px-2.5 py-1 font-mono text-[0.7rem] font-semibold text-ice"
              >
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-ice/10 pt-6">
            {project.github ? (
              <a href={project.github} target="_blank" rel="noreferrer" className="btn-ghost !px-4 !py-2.5 !text-[0.7rem]">
                GitHub
              </a>
            ) : null}
            {project.live ? (
              <a href={project.live} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2.5 !text-[0.7rem]">
                Live Demo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <style>{`
        @keyframes project-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes project-pop-in {
          from { opacity: 0; transform: scale(0.86) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .glass[style] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
