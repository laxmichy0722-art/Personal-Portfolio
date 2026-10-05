import type { SkillCategory } from "@/types/content";

/**
 * Skills, grouped into the five categories the brief specifies.
 *
 * No percentage values appear anywhere. A "95% Figma" bar implies a measurable
 * standard that does not exist, and a designer who cannot say exactly how much
 * Photoshop they use is normal. Instead each skill is a tag, and the category
 * description carries the seniority signal — which is something that can be
 * defended in a conversation.
 *
 * `level` is present in the type for future use but is intentionally left off
 * here: if you later add proficiency to the database, wire it through the same
 * way the testimonials are wired (data layer → component → admin) rather than
 * hard-coding it here.
 */
export const skillCategories: SkillCategory[] = [
  {
    slug: "design",
    label: "Design",
    description:
      "Visual identity, interface design and motion — from the first mark to the final exported asset.",
    skills: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe XD",
      "After Effects",
      "Premiere Pro",
      "Canva",
    ],
  },
  {
    slug: "frontend",
    label: "Frontend",
    description:
      "Semantic, accessible interfaces built with component libraries rather than one-off markup.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
    ],
  },
  {
    slug: "backend",
    label: "Backend",
    description:
      "Server-side logic, REST endpoints, authentication and the data handling behind each screen.",
    skills: ["Node.js", "Express.js", "REST API"],
  },
  {
    slug: "database",
    label: "Database",
    description:
      "Relational and document schemas, migrations, and hosted backends with row-level access control.",
    skills: [
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Supabase",
      "Firebase",
    ],
  },
  {
    slug: "tools",
    label: "Tools",
    description:
      "Version control, deployment and the workflow tooling that keeps a project reproducible.",
    skills: [
      "Git",
      "GitHub",
      "Visual Studio Code",
      "Postman",
      "Vercel",
      "Docker",
    ],
  },
];

/**
 * Count of distinct technologies listed across every category.
 * Used by the about page and by the admin skills summary.
 */
export const totalSkillCount = new Set(
  skillCategories.flatMap((category) => category.skills),
).size;