"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

function subscribeFinePointer(onChange: () => void) {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Smooth custom cursor (same idea as the PCDC site's mouse helper):
 * a small blended circle that follows the pointer and grows over links/buttons.
 * Desktop + fine pointers only; never touches the character or layout.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribeFinePointer, getFinePointer, () => false);

  useEffect(() => {
    if (reduced || !fine) return;
    const el = dot.current;
    if (!el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let hovering = false;

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hovering ? 2.4 : 1})`;
      el.style.opacity = "1";
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const interactive = "a, button, [role='button'], input, textarea, select, label, .btn-primary, .btn-ghost";
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      hovering = !!(t && t.closest(interactive));
      el.classList.toggle("is-active", hovering);
    };

    document.documentElement.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [reduced, fine]);

  if (reduced || !fine) return null;

  return <div ref={dot} className="custom-cursor" aria-hidden="true" />;
}
