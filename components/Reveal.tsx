"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

function getTranslate(dir: Direction) {
  switch (dir) {
    case "up":    return "translate3d(0, 36px, 0)";
    case "down":  return "translate3d(0, -36px, 0)";
    case "left":  return "translate3d(-36px, 0, 0)";
    case "right": return "translate3d(36px, 0, 0)";
  }
}

/** Fades and slides its children into place the first time they scroll into view. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Direction the element slides in from. Default: "up". */
  from?: Direction;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : getTranslate(from),
        transition: `opacity 0.75s ease ${delay}s, transform 0.85s cubic-bezier(0.2,0.7,0.2,1) ${delay}s`,
        willChange: "opacity, transform",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
