/**
 * Portfolio filter categories.
 *
 * These must stay in sync with the `project_category` enum in
 * `supabase/schema.sql` — Postgres rejects unknown enum labels, so a category
 * added here without a matching `ALTER TYPE ... ADD VALUE` will fail at insert
 * time rather than at build time.
 */
export type ProjectCategory =
  | "graphic-design"
  | "branding"
  | "ui-ux"
  | "web-design"
  | "frontend"
  | "full-stack";

export type ProjectStatus = "live" | "in-development" | "concept" | "archived";

export interface ProjectLink {
  label: string;
  href: string;
  icon?: "external" | "github";
}

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  /** URL segment — keep stable, it is the public permalink. */
  slug: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  /** Short label used on cards and filters. */
  category: ProjectCategory;
  categoryLabel: string;
  /** One-line hook shown under the title. */
  summary: string;
  /** Multi-paragraph overview for the detail page. */
  overview: string;
  year: string;
  client: string;
  role: string;
  status: ProjectStatus;
  /** Primary card artwork. */
  image: string;
  imageAlt: string;
  /** Optional accent colour for the card glow / browser chrome. */
  accent?: string;
  technologies: string[];
  /** The problem this project set out to solve. */
  problem: string;
  /** How it was solved. */
  solution: string;
  /** Design-side workflow. */
  designProcess: string[];
  /** Development-side workflow. */
  developmentProcess: string[];
  features: string[];
  screenshots: ProjectImage[];
  results: { label: string; value: string }[];
  links: ProjectLink[];
  featured: boolean;
}