"use client";

import { useEffect, useState } from "react";
import { navLinks, profile, type SectionId } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [active, setActive] = useState<SectionId>("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className={`glass navbar mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 transition-[background-color,box-shadow] duration-300 sm:px-5 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <a href="#home" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 font-display text-sm font-bold text-ice shadow-[var(--glow-logo)]">
            AK
          </span>
          <span className="flex flex-col leading-tight md:hidden lg:flex">
            <span className="font-display text-sm font-semibold text-ink">{profile.name}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-mute">{profile.role}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative block rounded-lg px-3.5 py-2 text-sm transition-colors duration-300 ${
                    isActive ? "text-[color:var(--nav-active)]" : "text-mute hover:text-ice"
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-lg border border-cyan/25 bg-cyan/10 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="relative">{link.label}</span>
                  <span
                    className={`absolute -bottom-[7px] left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cyan shadow-[var(--glow-nav)] transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="#contact" className="btn-ghost hidden !px-4 !py-2 !text-[0.68rem] lg:inline-flex">
            <span className="status-dot !h-1.5 !w-1.5" /> HIRE ME
          </a>

          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-ice/15 bg-glass/60 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`absolute h-[1.5px] w-5 rounded bg-ice transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[6px]"}`}
            />
            <span className={`absolute h-[1.5px] w-5 rounded bg-ice transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span
              className={`absolute h-[1.5px] w-5 rounded bg-ice transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[6px]"}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 top-0 -z-10 bg-bg/60 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        inert={!open}
        className={`glass mx-auto mt-3 max-w-6xl origin-top rounded-2xl p-3 transition-[opacity,transform] duration-300 md:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <ul className="flex flex-col">
          {navLinks.map((link, i) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors ${
                    isActive ? "bg-cyan/10 text-ink" : "text-mute hover:bg-ice/5 hover:text-ice"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[0.65rem] text-cyan/70">0{i + 1}</span>
                    {link.label}
                  </span>
                  {isActive && <span className="status-dot !h-1.5 !w-1.5" />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
