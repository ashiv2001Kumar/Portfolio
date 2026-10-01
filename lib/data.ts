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
    "I'm a full stack developer who enjoys turning ideas into fast, polished products. I work across the stack, from pixel-perfect React interfaces to reliable APIs and databases.",
    "Most of my work lives in the livewire, Laravel and Django ecosystems. I care about clean architecture, accessible UI and performance that people can feel.",
  ],
  stats: [
    { value: "3+", label: "Years building" },
    { value: "25+", label: "Projects shipped" },
    { value: "11", label: "Core technologies" },
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
  { name: "Next.js", group: "Frontend", level: 92 },
  { name: "React", group: "Frontend", level: 94 },
  { name: "TypeScript", group: "Frontend", level: 88 },
  { name: "JavaScript", group: "Frontend", level: 93 },
  { name: "Laravel", group: "Backend", level: 89 },
  { name: "PHP", group: "Backend", level: 87 },
  { name: "Python", group: "Backend", level: 84 },
  { name: "Django", group: "Backend", level: 82 },
  { name: "MySQL", group: "Data & Ops", level: 86 },
  { name: "Docker", group: "Data & Ops", level: 78 },
  { name: "Git", group: "Data & Ops", level: 90 },
] as const;

export const skillGroups = [
  {
    title: "Frontend",
    code: "UI.01",
    description: "Responsive, accessible interfaces with smooth motion and solid state management.",
    items: ["Next.js App Router", "React", "TypeScript", "Tailwind CSS", "Animation"],
  },
  {
    title: "Backend",
    code: "API.02",
    description: "REST APIs, auth, queues and admin panels that stay maintainable as they grow.",
    items: ["Laravel", "Django", "REST APIs", "Authentication", "Testing"],
  },
  {
    title: "Data & DevOps",
    code: "OPS.03",
    description: "Relational data modelling, containerised environments and clean Git workflows.",
    items: ["MySQL", "Docker", "Git", "CI/CD", "Linux"],
  },
] as const;

export const projects = [
  {
    name: "Lumen Store",
    code: "PRJ-01",
    description:
      "A glassmorphic e-commerce storefront with a fluid catalogue, live cart drawer and a checkout flow tuned for speed.",
    image: "/projects/lumen.jpg",
    tech: ["Next.js", "TypeScript", "Laravel", "MySQL"],
    github: "https://github.com/ashivkumar/lumen-store",
    live: "https://lumen.ashivkumar.dev",
  },
  {
    name: "Nimbus Analytics",
    code: "PRJ-02",
    description:
      "A real-time analytics dashboard with interactive charts, geo insights and role-based reporting for growing teams.",
    image: "/projects/nimbus.jpg",
    tech: ["React", "Django", "Python", "Docker"],
    github: "https://github.com/ashivkumar/nimbus-analytics",
    live: "https://nimbus.ashivkumar.dev",
  },
  {
    name: "Pulse Monitor",
    code: "PRJ-03",
    description:
      "An infrastructure monitoring console that streams service health, alerts and dependency graphs as they happen.",
    image: "/projects/pulse.jpg",
    tech: ["Next.js", "PHP", "Laravel", "Git"],
    github: "https://github.com/ashivkumar/pulse-monitor",
    live: "https://pulse.ashivkumar.dev",
  },
] as const;

export const experience = [
  {
    year: "2024",
    role: "Full Stack Developer",
    company: "Freelance",
    description:
      "Built websites and web apps for small businesses: Laravel back offices, React front ends and MySQL data models.",
    tags: ["Laravel", "React", "MySQL"],
  },
  {
    year: "2025",
    role: "Software Developer",
    company: "Product Studio",
    description:
      "Shipped client products end to end with Next.js and Django, from API design to deployment with Docker.",
    tags: ["Next.js", "Django", "Docker"],
  },
  {
    year: "2026",
    role: "Full Stack Developer",
    company: "Current Role",
    description:
      "Leading feature work across the stack, improving performance and building reusable UI systems in TypeScript.",
    tags: ["TypeScript", "Next.js", "Laravel"],
    current: true,
  },
] as const;
