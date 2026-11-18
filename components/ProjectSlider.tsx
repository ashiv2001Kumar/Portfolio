"use client";

import { useEffect, useRef } from "react";
import type { projects as Projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";

type Project = (typeof Projects)[number];

/**
 * Horizontal looping project carousel: autoplays on desktop, pauses on hover,
 * and supports touch swipe / drag / wheel so mobile can scroll left–right.
 */
export default function ProjectSlider({ items }: { items: readonly Project[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const paused = useRef(false);
  const dragging = useRef(false);
  const dragArmed = useRef(false);
  const dragAxis = useRef<"x" | "y" | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);
  const didDrag = useRef(false);
  const itemCount = items.length;

  useEffect(() => {
    const el = track.current;
    const view = viewport.current;
    if (!el || !view || itemCount === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let raf = 0;
    let last = performance.now();
    const speed = 28;
    const AXIS_LOCK = 8;

    const wrap = () => {
      const half = el.scrollWidth / 2;
      if (half <= 0) return;
      while (offset.current >= half) offset.current -= half;
      while (offset.current < 0) offset.current += half;
    };

    const paint = () => {
      wrap();
      el.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (reduce || paused.current || dragging.current) return;
      offset.current += speed * dt;
      paint();
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      paused.current = true;
      offset.current += dx;
      paint();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("a, button")) return;
      dragArmed.current = true;
      dragging.current = false;
      dragAxis.current = null;
      didDrag.current = false;
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      dragStartOffset.current = offset.current;
      paused.current = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragArmed.current && !dragging.current) return;

      const dx = e.clientX - dragStartX.current;
      const dy = e.clientY - dragStartY.current;

      // Lock to one axis so vertical page scroll still works on mobile.
      if (!dragAxis.current) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        dragAxis.current = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        if (dragAxis.current === "y") {
          dragArmed.current = false;
          dragging.current = false;
          return;
        }
        dragging.current = true;
        didDrag.current = true;
        dragArmed.current = false;
        try {
          view.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        view.style.cursor = "grabbing";
      }

      if (dragAxis.current !== "x") return;

      // Own the horizontal gesture so the page doesn't steal it.
      e.preventDefault();
      offset.current = dragStartOffset.current - dx;
      paint();
    };

    const endPointer = (e: PointerEvent) => {
      if (dragging.current) {
        dragging.current = false;
        try {
          if (view.hasPointerCapture(e.pointerId)) view.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        view.style.cursor = "";
      }
      dragArmed.current = false;
      dragAxis.current = null;
      // Sticky :hover on touch would keep autoplay paused forever — only pause on real hover devices.
      paused.current = fineHover && view.matches(":hover");
    };

    const onClickCapture = (e: MouseEvent) => {
      if (didDrag.current) {
        e.preventDefault();
        e.stopPropagation();
        didDrag.current = false;
      }
    };

    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("pointerdown", onPointerDown);
    // passive: false so preventDefault works once we lock to horizontal swipe
    view.addEventListener("pointermove", onPointerMove, { passive: false });
    view.addEventListener("pointerup", endPointer);
    view.addEventListener("pointercancel", endPointer);
    view.addEventListener("lostpointercapture", endPointer);
    view.addEventListener("click", onClickCapture, true);

    return () => {
      cancelAnimationFrame(raf);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("pointerdown", onPointerDown);
      view.removeEventListener("pointermove", onPointerMove);
      view.removeEventListener("pointerup", endPointer);
      view.removeEventListener("pointercancel", endPointer);
      view.removeEventListener("lostpointercapture", endPointer);
      view.removeEventListener("click", onClickCapture, true);
    };
  }, [itemCount]);

  const loop = [...items, ...items];

  return (
    <div
      ref={viewport}
      className="relative -mx-5 cursor-grab overflow-x-clip overflow-y-visible px-1 py-6 active:cursor-grabbing touch-pan-y sm:-mx-8 sm:py-8"
      style={{ touchAction: "pan-y" }}
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        if (!dragging.current) paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !dragging.current) {
          paused.current = false;
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-8 bg-gradient-to-r from-[color:var(--bg)] to-transparent sm:w-14"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-8 bg-gradient-to-l from-[color:var(--bg)] to-transparent sm:w-14"
        aria-hidden="true"
      />

      <div ref={track} className="flex w-max gap-4 px-5 will-change-transform sm:gap-6 sm:px-8">
        {loop.map((project, i) => (
          <div
            key={`${project.name}-${i}`}
            className="relative w-[min(82vw,340px)] shrink-0 sm:w-[360px]"
            aria-hidden={i >= items.length ? true : undefined}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
