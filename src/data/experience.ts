import type { ExperienceEntry } from "@/types/content";

/**
 * Timeline entries. `endYear: null` means the role is current.
 * Ordered most recent first.
 *
 * The three professional entries follow the brief's periods verbatim. The
 * education entry is retained at the end: it is excluded from the derived
 * "years of experience" calculation in `stats.ts`, so it does not inflate the
 * headline figure, and the Computer Science degree is the honest explanation for
 * why the development side of this practice exists.
 */
export const experience: ExperienceEntry[] = [
  {
    role: "Full-Stack Designer & Developer",
    company: "Freelance / Independent",
    period: "2026 — Present",
    startYear: 2026,
    endYear: null,
    type: "freelance",
    location: "Lalitpur, Nepal",
    summary:
      "Independent practice delivering brand identity, interface design and full-stack web applications — design and engineering handled directly, with no handoff gap.",
    responsibilities: [
      "Run discovery and scoping conversations to define project requirements and success criteria.",
      "Design brand identities, marketing collateral and packaging artwork.",
      "Design and build responsive websites and web applications on Next.js and React.",
      "Model relational databases and implement authentication and REST APIs.",
      "Deliver admin dashboards so clients can manage their own content.",
      "Deploy, monitor and maintain shipped projects.",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Supabase",
      "PostgreSQL",
      "Adobe Illustrator",
      "Adobe Photoshop",
      "Figma",
    ],
    achievements: [
      "Delivered restaurant and agricultural platforms covering ordering, inventory and reporting.",
      "Built a reusable project structure that shortens the path from brief to deployment.",
      "Maintain full ownership of both design and code, cutting coordination overhead for clients.",
    ],
  },
  {
    role: "UI/UX & Graphic Designer",
    company: "Independent Practice",
    period: "2024 — 2026",
    startYear: 2024,
    endYear: 2026,
    type: "freelance",
    location: "Lalitpur, Nepal",
    summary:
      "Interface and brand design for client projects, with an emphasis on design systems, component reuse and front-end implementation.",
    responsibilities: [
      "Translate business requirements into wireframes and high-fidelity interface designs.",
      "Build reusable component libraries in React and TypeScript.",
      "Establish spacing, typography and colour systems and document them.",
      "Implement responsive behaviour across mobile, tablet and desktop.",
      "Audit interfaces for accessibility and fix issues before release.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Figma",
      "Adobe XD",
      "Design Systems",
    ],
    achievements: [
      "Created a component library that reduced repeated layout work across screens.",
      "Documented a design system so visual decisions stopped being re-litigated per screen.",
      "Improved keyboard navigation and focus handling across interactive components.",
    ],
  },
  {
    role: "Graphic Designer / Web Designer",
    company: "Independent Practice",
    period: "2022 — 2024",
    startYear: 2022,
    endYear: 2024,
    type: "employment",
    location: "Lalitpur, Nepal",
    summary:
      "Production design across brand, print and digital — learning to work inside real constraints and real deadlines.",
    responsibilities: [
      "Produce brand artwork, marketing materials and social media content.",
      "Prepare print-ready files with correct colour conversion, bleed and prepress specs.",
      "Adapt campaign artwork across print and digital placements.",
      "Revise artwork against structured client feedback.",
    ],
    technologies: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe InDesign",
      "Canva",
    ],
    achievements: [
      "Delivered brand and collateral packages for multiple small businesses.",
      "Built prepress habits that eliminated colour surprises at print.",
      "Learned to present design decisions in terms of the client's objective, not personal taste.",
    ],
  },
  {
    role: "B.Sc. — Computer Science",
    company: "Tribhuvan University",
    period: "2019 — 2022",
    startYear: 2019,
    endYear: 2022,
    type: "education",
    location: "Lalitpur, Nepal",
    summary:
      "Computer science foundation — programming, data structures, databases and web technologies, which is where the engineering side of the practice comes from.",
    responsibilities: [
      "Studied core programming, data structures and algorithms.",
      "Worked with relational databases and SQL.",
      "Built web projects covering both client and server-side logic.",
    ],
    technologies: ["JavaScript", "SQL", "Java", "HTML", "CSS"],
    achievements: [
      "Established the programming fundamentals the current stack is built on.",
      "Gained direct database experience, which shaped how I model application data today.",
    ],
  },
];

/** Short capability statements shown next to the timeline. */
export const capabilities = [
  "Brand identity and visual systems",
  "Responsive website design and development",
  "Product UI and design systems",
  "Database design and API development",
  "Authentication and admin dashboards",
  "Deployment, performance and maintenance",
];