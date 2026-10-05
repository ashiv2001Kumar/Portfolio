/**
 * Everything editable on the site lives here: copy, links, skills, projects
 * and experience. Components only read from this file.
 */

export const profile = {
  name: "Ashiv Kumar",
  firstName: "Ashiv",
  role: "Full Stack Developer",
  tagline: "Building modern digital experiences with  Laravel , livewire & Django.",
  location: "India · Remote",
  email: "ashivkumar6@gmail.com",
  availability: "Open to new projects",
  bio: [
    "I'm a full stack developer who enjoys turning ideas into fast, polished products. I work across the stack, from clean React interfaces to reliable APIs and databases.",
    "Most of my work lives in the Laravel, Livewire and Django ecosystems. I care about clean architecture, readable code and products that actually work for real users.",
  ],
  stats: [
    { value: "3+", label: "Years building" },
    { value: "25+", label: "Projects shipped" },
    { value: "8", label: "Core technologies" },
  ],
} as const;

export const socials = [
  { label: "GitHub", href: "https://github.com/ashivkumar", short: "GH" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ashivkumar", short: "IN" },
  { label: "Email", href: `mailto:${profile.email}`, short: "@" },
] as const;

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navLinks)[number]["id"];

export const technologies = [
  { name: "Python", group: "Backend", level: 84 },
  { name: "Django", group: "Backend", level: 82 },
  { name: "Laravel", group: "Backend", level: 89 },
  { name: "Livewire", group: "Backend", level: 86 },
  { name: "Git", group: "Data & Ops", level: 88 },
  { name: "MySQL", group: "Data & Ops", level: 86 },
  { name: "JavaScript", group: "Frontend", level: 88 },
  { name: "React", group: "Frontend", level: 85 },
] as const;

export const skillGroups = [
  {
    title: "Frontend",
    code: "UI.01",
    description: "Responsive interfaces built with JavaScript and React, focused on clean UI and good user experience.",
    items: ["JavaScript", "React", "Basic React"],
  },
  {
    title: "Backend",
    code: "API.02",
    description: "Full stack web apps with Laravel and Livewire, REST APIs, and Django for Python-based backends.",
    items: ["Laravel", "Livewire", "Django", "REST APIs", "PHP"],
  },
  {
    title: "Data & Tools",
    code: "OPS.03",
    description: "Relational data modelling with MySQL and version control with Git.",
    items: ["MySQL", "Git"],
  },
] as const;

export const projects = [
  {
    name: "CareAssign",
    code: "PRJ-01",
    description:
      "A healthcare staff scheduling platform built during my internship. Implemented shift management, calendar-based scheduling using FullCalendar API, and backend APIs with Django.",
    image: "/projects/careassign.jpg",
    tech: ["Django", "Python", "FullCalendar API", "MySQL"],
    github: "",
    live: "https://careassign.com/",
  },
  {
    name: "Boardnect",
    code: "PRJ-02",
    description:
      "A board management software designed for nonprofits — centralising agendas, documents, votes and meeting scheduling in one place.",
    image: "/projects/boardnect.jpg",
    tech: ["Laravel", "Livewire", "Stripe", "MySQL"],
    github: "https://github.com/ashivkumar/boardnect",
    live: "https://dev.boardnect.com",
  },
  {
    name: "CM Di Yogshala",
    code: "PRJ-03",
    description:
      "A government portal for Punjab's CM Di Yogshala initiative. Built REST APIs, implemented Firebase push notifications, and handled citizen registration for free yoga sessions organised across the state.",
    image: "/projects/yogshala.jpg",
    tech: ["Laravel", "MySQL", "Firebase", "REST APIs"],
    github: "",
    live: "https://cmdiyogshala.punjab.gov.in/",
  },
] as const;

export const experience = [
  {
    year: "2024",
    role: "Master's Degree",
    company: "University",
    description:
      "Completed my Master's degree, then joined a company on 2 Dec 2024 as a Backend Developer Intern, working with Laravel, Django and MySQL.",
    tags: ["Laravel", "Django", "MySQL"],
  },
  {
    year: "2025",
    role: "Backend Developer",
    company: "Full-time Employee",
    description:
      "Completed 8 months of internship and transitioned to a full-time employee on 23 August 2025, taking on more responsibility across backend systems.",
    tags: ["Laravel", "Django", "Python"],
  },
  {
    year: "2026",
    role: "Backend Developer",
    company: "Current Role",
    description:
      "Working as a Backend Developer, building and maintaining APIs and server-side features using Laravel, Django and MySQL.",
    tags: ["Laravel", "Django", "MySQL"],
    current: true,
  },
] as const;
