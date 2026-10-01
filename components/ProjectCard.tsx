"use client";

import Image from "next/image";
import { useRef } from "react";
import type { projects } from "@/lib/data";

type Project = (typeof projects)[number];

const MAX_TILT = 6;

/** Glass project card with a gentle 3D tilt that follows the pointer. */
export default function ProjectCard({ project }: { project: Project }) {
  const card = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const onLeave = () => {
    if (card.current) card.current.style.transform = "";
  };

  return (
    <article
      ref={card}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform hover:border-cyan/35 hover:shadow-[var(--glow-hover)]"
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--shine-rgb) / 0.08), transparent 45%)" }}
      />
      <div className="relative aspect-[16/10] overflow-hidden border-b border-ice/10">
        <Image
          src={project.image}
          alt={`${project.name} screenshot`}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--img-fade),transparent_60%)]" />
        <span className="glass-soft absolute left-4 top-4 rounded-md px-2 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-ice/80">
          {project.code}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-ink">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mute">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li key={t} className="rounded-md border border-cyan/20 bg-cyan/[0.06] px-2 py-1 font-mono text-[0.65rem] text-ice">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-3 border-t border-ice/10 pt-5">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="relative z-20 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-mute transition-colors hover:text-ice"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            GitHub
          </a>
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            className="relative z-20 ml-auto inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan transition-colors hover:text-ice"
          >
            Live Demo
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
