import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { totalSkillCount } from "@/data/skills";

/**
 * Professional statistics shown in the hero and about sections.
 *
 * ── ON THE HEADLINE FIGURES ─────────────────────────────────────────────────
 * `headlineStats` uses the owner's own figures exactly as supplied for the
 * portfolio brief: 5+ years, 50+ projects, 30+ clients. These are marketing
 * numbers and are deliberately NOT derived, because the brief specifies them
 * verbatim and they are meant to represent cumulative paid work, which includes
 * engagements that predate this repository and work that never became a public
 * case study.
 *
 * They are kept as plain editable constants in one place so they are trivial to
 * correct. Before this site is presented to a client, they should be reconciled
 * against the owner's records — the `derivedStats` export below is the
 * verifiable counterpart, and the difference between the two sets is the honest
 * measure of how much of the headline figure lives outside this repo.
 *
 * The derived set is used wherever a figure can be counted rather than claimed:
 *   Projects / Design / Web  — counted from `src/data/projects.ts`
 *   Technologies            — de-duplicated count from `src/data/skills.ts`
 *   Years                   — earliest professional `startYear` in
 *                              `src/data/experience.ts`, excluding education
 *
 * A "Happy Clients" figure is NOT derived: a client count cannot be counted from
 * the repo, so it exists only in `headlineStats` and nowhere else.
 */
const designCategories = new Set(["graphic-design", "branding"]);

const projectCount = projects.length;
const designCount = projects.filter((project) =>
  designCategories.has(project.category),
).length;
const webCount = projectCount - designCount;

// Years of *professional* experience, so a degree does not inflate the figure.
// The B.Sc. entry runs 2019–2022; counting from it would claim eight years of
// client work in 2026, which is not true. Freelance, employment, internship and
// project entries all count; education does not.
const professionalEntries = experience.filter(
  (entry) => entry.type !== "education",
);

const earliestProfessionalYear = Math.min(
  ...professionalEntries.map((entry) => entry.startYear),
);
// Count inclusive of the current year, so a 2023 start reads as 4 in 2027.
const yearsOfExperience = Math.max(
  1,
  new Date().getFullYear() - earliestProfessionalYear + 1,
);

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

/** The three figures the brief specifies for the hero band. */
export const headlineStats: Stat[] = [
  {
    id: "experience",
    value: 5,
    suffix: "+",
    label: "Years Experience",
    description:
      "Professional practice across graphic design, UI/UX and full-stack development.",
  },
  {
    id: "projects",
    value: 50,
    suffix: "+",
    label: "Projects Completed",
    description:
      "Brand identities, print and social collateral, marketing sites and database-backed applications.",
  },
  {
    id: "clients",
    value: 30,
    suffix: "+",
    label: "Happy Clients",
    description:
      "Small businesses, restaurants, studios and professionals served end to end.",
  },
];

/** Verifiable counts, used where a number can be counted rather than claimed. */
export const derivedStats: Stat[] = [
  {
    id: "derived-projects",
    value: projectCount,
    suffix: "",
    label: "Projects Shipped",
    description:
      "Brand identities, print and social work, marketing sites and full-stack products — each one delivered end to end.",
  },
  {
    id: "derived-design",
    value: designCount,
    suffix: "",
    label: "Design Projects",
    description:
      "Logo systems, brand guidelines, packaging, menus and marketing collateral.",
  },
  {
    id: "derived-web",
    value: webCount,
    suffix: "",
    label: "Web & Product Builds",
    description:
      "Responsive websites, landing pages and database-backed applications with admin dashboards.",
  },
  {
    id: "derived-experience",
    value: yearsOfExperience,
    suffix: "+",
    label: "Years of Experience",
    description:
      "Formal computer science training combined with continuous client delivery.",
  },
];

export const stats = headlineStats;

export const totalTechnologyCount = totalSkillCount;