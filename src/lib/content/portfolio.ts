import { experience as staticExperience } from "@/data/experience";
import { getPublishedTestimonials, testimonials as staticTestimonials } from "@/data/process";
import { projects as staticProjects } from "@/data/projects";
import { services as staticServices } from "@/data/services";
import { skillCategories as staticSkillCategories } from "@/data/skills";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ExperienceRow,
  ProjectImageRow,
  ProjectRow,
  ServiceRow,
  SkillRow,
  TestimonialRow,
} from "@/types/database";
import type {
  ExperienceEntry,
  Service,
  SkillCategory,
  Testimonial,
} from "@/types/content";
import type {
  Project,
  ProjectCategory,
  ProjectImage,
  ProjectLink,
  ProjectStatus,
} from "@/types/project";

/**
 * Portfolio content access: database first, static files as the fallback.
 *
 * ── WHY THIS SHAPE ──────────────────────────────────────────────────────────
 * The site ships with no database configured and still has to render every page,
 * so the versioned data in `src/data/*.ts` can never be removed. But an admin who
 * edits a case study in the dashboard expects the change to appear, which rules
 * out reading only from the static files.
 *
 * So every loader follows the same rule: **if the table has published rows, they
 * win; otherwise the static file is used.** An empty table therefore means
 * "not configured yet", not "delete everything", and a missing table, a missing
 * env var or a failed query all degrade to the static content instead of
 * rendering an empty page.
 *
 * Reads use the service-role client rather than the anon key. That is deliberate:
 * it bypasses RLS so one code path serves both the public site and the admin,
 * and the published/draft filter is applied here, in one place, where it can be
 * read and tested — rather than duplicated as a RLS policy that could drift away
 * from the queries in this file.
 *
 * Server-only by construction: the only way this module reaches the service role
 * is through `createAdminClient`, which returns `null` when
 * `SUPABASE_SERVICE_ROLE_KEY` is unset. A client component that imported this
 * would therefore get the static fallback rather than a leaked credential.
 */

/** Shape of a Supabase query error without depending on generated DB types. */
interface QueryError {
  message: string;
}

function hasRows<T>(data: T[] | null, error: QueryError | null): data is T[] {
  return !error && Array.isArray(data) && data.length > 0;
}

/**
 * Logs and swallows a content query failure.
 *
 * A missing table is the expected case on a fresh project, so this is a warning
 * rather than an error — the caller falls back to static content and the site
 * keeps working.
 */
function reportFallback(what: string, error: QueryError | null): void {
  if (error) {
    console.warn(
      `[content] Falling back to static ${what}: ${error.message}. ` +
        "Run supabase/schema.sql in the Supabase SQL editor.",
    );
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

function toProject(row: ProjectRow, images: ProjectImageRow[]): Project {
  // The cover lives on the project row; anything else in project_images becomes a
  // detail-page screenshot.
  const coverImage = images.find((image) => image.kind === "cover");
  const screenshots: ProjectImage[] = images
    .filter((image) => image.kind !== "cover")
    .map((image) => ({
      src: image.src,
      alt: image.alt,
      ...(image.caption ? { caption: image.caption } : {}),
    }));

  // `links` is derived rather than stored: the two URLs on the row are the whole
  // of it, and duplicating them as rows would let the two drift apart.
  const links: ProjectLink[] = [];
  if (row.live_url) {
    links.push({ label: "Live Site", href: row.live_url, icon: "external" });
  }
  if (row.source_url) {
    links.push({ label: "Source", href: row.source_url, icon: "github" });
  }

  return {
    slug: row.slug,
    index: row.index_label,
    title: row.title,
    category: row.category as ProjectCategory,
    categoryLabel: row.category_label,
    summary: row.summary,
    overview: row.overview ?? "",
    year: row.year ?? "",
    client: row.client ?? "Independent Project",
    role: row.role ?? "",
    status: row.project_status as ProjectStatus,
    image: row.cover_image ?? coverImage?.src ?? "",
    imageAlt: row.cover_alt ?? coverImage?.alt ?? row.title,
    ...(row.accent ? { accent: row.accent } : {}),
    technologies: row.technologies,
    problem: row.problem ?? "",
    solution: row.solution ?? "",
    designProcess: row.design_process,
    developmentProcess: row.development_process,
    features: row.features,
    screenshots,
    results: row.results,
    links,
    featured: row.featured,
  };
}

/** All published projects, or the static case studies if the table is empty. */
export async function getProjects(): Promise<Project[]> {
  const admin = createAdminClient();
  if (!admin) return staticProjects;

  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (!hasRows(data, error)) {
    reportFallback("projects", error);
    return staticProjects;
  }

  const ids = data.map((row) => row.id);
  const { data: imageRows, error: imageError } = await admin
    .from("project_images")
    .select("*")
    .in("project_id", ids)
    .order("sort_order", { ascending: true });

  if (imageError) {
    // Projects without images still render — the card falls back to its cover.
    console.warn(
      `[content] project_images unavailable (${imageError.message}); ` +
        "rendering projects without screenshots.",
    );
  }

  const byProject = new Map<string, ProjectImageRow[]>();
  for (const image of imageRows ?? []) {
    const existing = byProject.get(image.project_id);
    if (existing) existing.push(image as ProjectImageRow);
    else byProject.set(image.project_id, [image as ProjectImageRow]);
  }

  return (data as unknown as ProjectRow[]).map((row) =>
    toProject(row, byProject.get(row.id) ?? []),
  );
}

/** One published project by slug, or the static case study with that slug. */
export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const admin = createAdminClient();
  if (!admin) return staticProjects.find((project) => project.slug === slug);

  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn(
        `[content] project "${slug}" lookup failed (${error.message}); ` +
          "falling back to static content.",
      );
    }
    return staticProjects.find((project) => project.slug === slug);
  }

  const row = data as unknown as ProjectRow;

  const { data: imageRows } = await admin
    .from("project_images")
    .select("*")
    .eq("project_id", row.id)
    .order("sort_order", { ascending: true });

  return toProject(row, (imageRows ?? []) as unknown as ProjectImageRow[]);
}

/** Previous/next within the currently published, ordered set. */
export async function getAdjacentProjects(
  slug: string,
): Promise<{ previous?: Project; next?: Project }> {
  const all = await getProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return {};

  return {
    // `index === 0` must not wrap around to the last project.
    ...(index > 0 ? { previous: all[index - 1] } : {}),
    ...(index < all.length - 1 ? { next: all[index + 1] } : {}),
  };
}

export async function getProjectsByCategory(
  category: ProjectCategory | "all",
): Promise<Project[]> {
  const all = await getProjects();
  return category === "all"
    ? all
    : all.filter((project) => project.category === category);
}

export async function getFeaturedProjects(limit?: number): Promise<Project[]> {
  const featured = (await getProjects()).filter((project) => project.featured);
  return limit ? featured.slice(0, limit) : featured;
}

// ── Skills ───────────────────────────────────────────────────────────────────

/**
 * Skill categories.
 *
 * The database owns the *membership and order* of each group — that is what an
 * admin needs to edit. The category heading and the sentence beneath it are page
 * prose that changes with the design, not with the skill list, so they stay in
 * `src/data/skills.ts`. A group with no published rows keeps its static list.
 */
export async function getSkillCategories(): Promise<SkillCategory[]> {
  const admin = createAdminClient();
  if (!admin) return staticSkillCategories;

  const { data, error } = await admin
    .from("skills")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (!hasRows(data, error)) {
    reportFallback("skills", error);
    return staticSkillCategories;
  }

  const rows = data as unknown as SkillRow[];

  return staticSkillCategories.map((category) => {
    const names = rows
      .filter((row) => row.group_name === category.slug)
      .map((row) => row.name);
    return names.length > 0 ? { ...category, skills: names } : category;
  });
}

/** De-duplicated count of every skill, used by the stats band. */
export async function getTotalSkillCount(): Promise<number> {
  const categories = await getSkillCategories();
  return new Set(categories.flatMap((category) => category.skills)).size;
}

// ── Services ─────────────────────────────────────────────────────────────────

const SERVICE_ICONS = new Set([
  "palette",
  "gem",
  "layout-dashboard",
  "globe",
  "code-2",
  "shopping-cart",
  "gauge",
  "wrench",
]);

function toService(row: ServiceRow): Service {
  return {
    index: row.index_label,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.summary,
    deliverables: row.deliverables,
    // The column is free text, so narrow it here rather than casting blindly:
    // an unknown name falls back to the first icon instead of rendering nothing.
    icon: (SERVICE_ICONS.has(row.icon)
      ? row.icon
      : "palette") as Service["icon"],
  };
}

export async function getServices(): Promise<Service[]> {
  const admin = createAdminClient();
  if (!admin) return staticServices;

  const { data, error } = await admin
    .from("services")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (!hasRows(data, error)) {
    reportFallback("services", error);
    return staticServices;
  }

  return (data as unknown as ServiceRow[]).map(toService);
}

/** One published service by slug, or the static service with that slug. */
export async function getServiceBySlug(
  slug: string,
): Promise<Service | undefined> {
  const admin = createAdminClient();
  if (!admin) return staticServices.find((service) => service.slug === slug);

  const { data, error } = await admin
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn(
        `[content] service "${slug}" lookup failed (${error.message}); ` +
          "falling back to static content.",
      );
    }
    return staticServices.find((service) => service.slug === slug);
  }

  return toService(data as unknown as ServiceRow);
}

// ── Experience ───────────────────────────────────────────────────────────────

function toExperienceEntry(row: ExperienceRow): ExperienceEntry {
  return {
    role: row.role,
    company: row.company,
    period: row.period,
    startYear: row.start_year,
    endYear: row.end_year,
    type: row.entry_type as ExperienceEntry["type"],
    location: row.location,
    summary: row.summary ?? "",
    responsibilities: row.responsibilities,
    technologies: row.technologies,
    achievements: row.achievements,
  };
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  const admin = createAdminClient();
  if (!admin) return staticExperience;

  const { data, error } = await admin
    .from("experience")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (!hasRows(data, error)) {
    reportFallback("experience", error);
    return staticExperience;
  }

  return (data as unknown as ExperienceRow[]).map(toExperienceEntry);
}

/**
 * Years of professional experience, excluding education.
 *
 * Counting from the B.Sc. entry would claim years of client work that did not
 * happen, so the degree is filtered out before the earliest year is taken.
 */
export async function getYearsOfProfessionalExperience(): Promise<number> {
  const entries = await getExperience();
  const professional = entries.filter((entry) => entry.type !== "education");

  if (professional.length === 0) return 1;

  const earliest = Math.min(...professional.map((entry) => entry.startYear));
  return Math.max(1, new Date().getFullYear() - earliest + 1);
}

// ── Testimonials ─────────────────────────────────────────────────────────────

/**
 * Real testimonials only.
 *
 * Placeholder rows stay in the table so the dashboard has something to edit, but
 * an unfilled testimonial must never reach the public site — so they are filtered
 * here as well as in `getPublishedTestimonials()`, and the static fallback is
 * filtered too.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const admin = createAdminClient();
  if (!admin) return getPublishedTestimonials();

  const { data, error } = await admin
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .eq("is_placeholder", false)
    .order("sort_order", { ascending: true });

  if (!hasRows(data, error)) {
    reportFallback("testimonials", error);
    return getPublishedTestimonials();
  }

  return (data as unknown as TestimonialRow[]).map((row) => ({
    id: row.id,
    quote: row.quote,
    name: row.client_name,
    role: row.client_role ?? "",
    company: row.company ?? "",
    image: row.photo_url ?? undefined,
    isPlaceholder: false,
  }));
}

export { staticTestimonials };