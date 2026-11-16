"use client";

import { useState } from "react";
import { profile, socials } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields): Errors {
  const errors: Errors = {};
  if (f.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(f.email.trim())) errors.email = "Please enter a valid email address.";
  if (f.message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...fields, [key]: e.target.value };
    setFields(next);
    if (errors[key]) setErrors(validate(next));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    const subject = encodeURIComponent(`Portfolio enquiry from ${fields.name.trim()}`);
    const body = encodeURIComponent(`${fields.message.trim()}\n\n${fields.name.trim()}\n${fields.email.trim()}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus("sent");
  };

  const input =
    "mt-2 w-full rounded-lg border bg-bg/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-mute/50 outline-none transition-[border-color,box-shadow] focus:border-cyan/60 focus:shadow-[0_0_0_3px_rgb(var(--accent-rgb)/0.12)]";
  const border = (key: keyof Fields) => (errors[key] ? "border-rose-400/60" : "border-ice/15");

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        index="05"
        label="contact"
        title="Let's build something together."
        description="Have a project in mind or just want to say hello? Open a channel and I'll get back to you."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal className="">
          <div className="glass hud-corners h-full overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-ice/10 bg-bg/50 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-cyan/80" />
              <span className="hud-label ml-3">establish connection</span>
              <span className="ml-auto font-mono text-[0.65rem] text-mute">ssh://ashiv.dev</span>
            </div>

            <form noValidate onSubmit={onSubmit} className="p-5 sm:p-8">
              <div className="mb-6 space-y-1 font-mono text-xs text-mute">
                <p>
                  <span className="text-cyan">$</span> connect --to {profile.firstName.toLowerCase()}
                </p>
                <p>
                  <span className="text-cyan">›</span> handshake ok · channel secure · awaiting input
                  <span className="cursor-blink ml-1 text-cyan">▍</span>
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="hud-label">
                    name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={fields.name}
                    onChange={update("name")}
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={`${input} ${border("name")}`}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="mt-1.5 font-mono text-xs text-rose-300">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-email" className="hud-label">
                    email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={fields.email}
                    onChange={update("email")}
                    placeholder="you@domain.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={`${input} ${border("email")}`}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="mt-1.5 font-mono text-xs text-rose-300">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className="hud-label">
                  message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={fields.message}
                  onChange={update("message")}
                  placeholder="Tell me about your project…"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={`${input} ${border("message")} resize-y`}
                />
                {errors.message && (
                  <p id="contact-message-error" className="mt-1.5 font-mono text-xs text-rose-300">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-primary">
                  SEND TRANSMISSION
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                </button>
                <p role="status" className="font-mono text-xs text-cyan">
                  {status === "sent" ? "› Opening your email app…" : ""}
                </p>
              </div>
            </form>
          </div>
        </Reveal>

        <Reveal className="" delay={0.1}>
          <aside className="glass flex h-full flex-col rounded-2xl p-6 sm:p-8">
            <span className="hud-label">get in touch</span>
            <h3 className="mt-2 font-display text-xl font-semibold text-ink">
              Let&apos;s <span className="text-cyan">Connect</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              I&apos;m eager to collaborate on impactful projects. Let&apos;s connect and build something great together.
            </p>

            {/* Contact detail rows */}
            <ul className="mt-6 space-y-3">
              {/* Email */}
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="group flex items-center gap-4 rounded-xl border border-ice/10 bg-ice/[0.03] px-4 py-3.5 transition-colors hover:border-cyan/40 hover:bg-cyan/[0.06]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="hud-label">email</p>
                    <p className="mt-0.5 truncate text-sm text-ink group-hover:text-cyan">{profile.email}</p>
                  </div>
                </a>
              </li>

              {/* Phone */}
              <li>
                <a
                  href={`tel:${profile.phone}`}
                  className="group flex items-center gap-4 rounded-xl border border-ice/10 bg-ice/[0.03] px-4 py-3.5 transition-colors hover:border-cyan/40 hover:bg-cyan/[0.06]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="hud-label">phone</p>
                    <p className="mt-0.5 text-sm text-ink group-hover:text-cyan">{profile.phone}</p>
                  </div>
                </a>
              </li>

              {/* Location */}
              <li>
                <div className="flex items-center gap-4 rounded-xl border border-ice/10 bg-ice/[0.03] px-4 py-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="hud-label">location</p>
                    <p className="mt-0.5 text-sm text-ink">{profile.location}</p>
                  </div>
                </div>
              </li>
            </ul>

            {/* Availability badge */}
            <div className="mt-5 flex items-center gap-2.5 text-sm text-mute">
              <span className="status-dot" /> {profile.availability}
            </div>

            {/* Socials */}
            <div className="mt-6 border-t border-ice/10 pt-6">
              <span className="hud-label">follow me</span>
              <ul className="mt-4 flex gap-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-ice/10 bg-ice/[0.03] font-mono text-xs text-cyan transition-colors hover:border-cyan/40 hover:bg-cyan/[0.08]"
                    >
                      {s.short}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
