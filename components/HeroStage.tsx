"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CHARACTER_MODEL } from "@/lib/character-model";
import { computeLayout, type SceneLayout } from "@/lib/hero-timeline";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import AnimeCharacter, { CHARACTER_IMAGES } from "./AnimeCharacter";
import FuturisticDesk from "./FuturisticDesk";

const Character3D = dynamic(() => import("./Character3D"), { ssr: false });

/**
 * Lays out the intro panel and the workstation scene, then plays the
 * character's walk-and-sit once, as soon as his images have loaded. It never
 * replays: scrolling away and back leaves him seated at the desk.
 */
export default function HeroStage({ panel }: { panel: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [layout, setLayout] = useState<SceneLayout | null>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  // Which figure plays: the 3D model when one is configured and loads, otherwise the drawn one.
  const [figure, setFigure] = useState<"pending" | "3d" | "2d">(CHARACTER_MODEL ? "pending" : "2d");
  const reduced = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    const panelEl = panelRef.current;
    if (!stage || !panelEl) return;
    const observer = new ResizeObserver(() => {
      const s = stage.getBoundingClientRect();
      const p = panelEl.getBoundingClientRect();
      const next = computeLayout(Math.round(s.width), Math.round(s.height), Math.round(p.right - s.left));
      setLayout((prev) =>
        prev && prev.width === next.width && prev.height === next.height && prev.startX === next.startX ? prev : next,
      );
    });
    observer.observe(stage);
    observer.observe(panelEl);
    return () => observer.disconnect();
  }, []);

  // Start once his images or model are ready and the stage is in view (on phones it sits below the intro card).
  useEffect(() => {
    const stage = stageRef.current;
    if (reduced || started.current || !stage || figure === "pending") return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    Promise.all(
      CHARACTER_IMAGES.map((src) => {
        const img = new window.Image();
        img.src = src;
        return img.decode().catch(() => undefined);
      }),
    ).then(() => {
      if (cancelled) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer?.disconnect();
          setStartAt(performance.now());
        },
        { threshold: 0.45 },
      );
      observer.observe(stage);
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [reduced, figure]);

  return (
    <>
      <div
        ref={panelRef}
        className="relative z-10 mx-auto w-full max-w-xl px-5 pt-[calc(var(--nav-h)+28px)] sm:px-8 lg:absolute lg:left-[5vw] lg:top-[47%] lg:mx-0 lg:w-[min(40vw,540px)] lg:max-w-none lg:-translate-y-1/2 lg:p-0"
      >
        {panel}
      </div>
      <div
        ref={stageRef}
        role="img"
        aria-label="Ashiv's character walks to his workstation, sits down and starts typing on his laptop"
        data-hero-start={startAt !== null || reduced ? "" : undefined}
        className="pointer-events-none relative h-[clamp(300px,54svh,470px)] w-full lg:absolute lg:inset-0 lg:h-auto"
      >
        {layout && (
          <>
            <FuturisticDesk layout={layout} />
            <AnimeCharacter layout={layout} startAt={startAt} reduced={reduced} hideFigure={figure !== "2d"} />
            {CHARACTER_MODEL && figure !== "2d" && (
              <Character3D
                model={CHARACTER_MODEL}
                layout={layout}
                startAt={startAt}
                reduced={reduced}
                onReady={(ok) => setFigure(ok ? "3d" : "2d")}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
