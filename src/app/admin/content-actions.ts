"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import {
  deleteContentSchema,
  experienceFormSchema,
  formatProjectResults,
  parseProjectResults,
  projectFormSchema,
  serviceFormSchema,
  skillFormSchema,
  testimonialFormSchema,
} from "@/lib/content-form";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminClient } from "@/lib/supabase/admin";
import type { ProjectRow } from "@/types/database";

/**
 * Admin content management for portfolio records.
 *
 * ── SECURITY MODEL ──────────────────────────────────────────────────────────
 * Every action re-authenticates through `getCurrentUser()` before touching the
 * service-role client. This is the actual boundary: the proxy and the admin
 * layout only shape what an anonymous visitor sees, whereas Server Actions are
 * directly reachable HTTP endpoints and are never covered by layout rendering.
 * An unauthenticated caller must therefore get `Not authorised.` from the action
 * itself, not a redirect.
 *
 * Validated input is the second boundary. The schemas in `content-form.ts` reject
 * anything malformed, and `.select()` is chained onto every write so a successful
 * response is proof a row was actually touched — never an unverified "OK".
 */

export interface ContentResult {
  ok: boolean;
  message: string;
}

const DENIED: ContentResult = { ok: false, message: "Not authorised." };
const NOT_CONFIGURED: ContentResult = {
  ok: false,
  message: "Supabase is not configured. Copy .env.example to .env.local and fill it in.",
};

/** Authorised, or the reason it failed. */
type Authorised =
  | { ok: true; admin: AdminClient }
  | { ok: false; result: ContentResult };

/**
 * Resolves the service-role client for a signed-in admin.
 *
 * Returns the failure reason rather than a bare `null`, because "no session" and
 * "no Supabase env vars" need different fixes and collapsing them would leave an
 * operator staring at "Not authorised." while the real problem is a missing key.
 *
 * The success branch carries the already-narrowed `AdminClient`, so callers never
 * have to re-check the client for `null`.
 */
async function authorise(): Promise<Authorised> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: DENIED };

  // Checked after the session: an unauthenticated caller should be told
  // "Not authorised." regardless of how the server is configured.
  const admin = createAdminClient();
  if (!admin) return { ok: false, result: NOT_CONFIGURED };

  return { ok: true, admin };
}

/**
 * Turns a Supabase error into an actionable message.
 *
 * A unique-violation on `slug` is the overwhelmingly common failure when editing
 * content, and Postgres' raw text for it is not something to show a human.
 */
function explainWriteError(error: { code?: string; message: string }): string {
  if (error.code === "23505") {
    return "That slug is already used by another record. Slugs must be unique.";
  }
  if (error.code === "23514") {
    return "A value failed a database check constraint. Check the lengths and formats.";
  }
  if (error.code === "23503") {
    return "That record is referenced elsewhere and cannot be changed this way.";
  }
  return error.message;
}

/** Paths whose rendered output depends on the table being edited. */
function revalidateContent(paths: string[]): void {
  for (const path of [
    "/",
    "/admin",
    "/projects",
    "/skills",
    "/services",
    "/experience",
    "/resume",
    "/sitemap.xml",
    ...paths,
  ]) {
    revalidatePath(path);
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

function projectRow(input: ReturnType<typeof projectFormSchema.parse>) {
  // Parsed outside the schema because the textarea→array conversion can produce
  // a user-facing message that a plain `.transform()` could not return.
  const results = parseProjectResults(input.results);
  if (!results.ok) throw new Error(results.message);

  return {
    slug: input.slug,
    title: input.title,
    category_label: input.categoryLabel,
    category: input.category,
    index_label: input.indexLabel,
    summary: input.summary,
    overview: input.overview || null,
    problem: input.problem || null,
    solution: input.solution || null,
    design_process: input.designProcess,
    development_process: input.developmentProcess,
    features: input.features,
    technologies: input.technologies,
    results: results.value,
    year: input.year || null,
    client: input.client || null,
    role: input.role || null,
    project_status: input.status,
    cover_image: input.coverImage || null,
    cover_alt: input.coverAlt || null,
    accent: input.accent || null,
    live_url: input.liveUrl ?? null,
    source_url: input.sourceUrl ?? null,
    sort_order: input.sortOrder,
    featured: input.featured,
    published: input.published,
  };
}

export async function saveProject(
  input: unknown,
): Promise<ContentResult> {
  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid project.",
    };
  }

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  let row: ReturnType<typeof projectRow>;
  try {
    row = projectRow(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid project.",
    };
  }

  const id = (parsed.data as { id?: string }).id;

  const query = admin.from("projects");
  const result = id
    ? await query.update(row).eq("id", id).select("slug").maybeSingle()
    : await query.insert(row).select("slug").maybeSingle();

  if (result.error) return { ok: false, message: explainWriteError(result.error) };
  if (!result.data) return { ok: false, message: "Project not found." };

  revalidateContent([`/projects/${result.data.slug}`]);
  return {
    ok: true,
    message: id ? "Project updated." : "Project created.",
  };
}

export async function toggleProjectPublished(input: {
  id: string;
  published: boolean;
}): Promise<ContentResult> {
  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const { data, error } = await admin
    .from("projects")
    .update({ published: input.published })
    .eq("id", input.id)
    .select("slug")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) return { ok: false, message: "Project not found." };

  revalidateContent([`/projects/${data.slug}`]);
  return {
    ok: true,
    message: input.published ? "Project published." : "Project unpublished.",
  };
}

/**
 * Loads one project back into the editor form.
 *
 * Flattens the snake_case row into the camelCase field names the form uses, and
 * turns the one-item-per-line textareas back into strings. Nullable columns become
 * empty strings because an empty input is the honest representation of "not set"
 * — sending `undefined` would leave a stale value behind on save.
 */
export async function loadProject(id: string): Promise<unknown | null> {
  const auth = await authorise();
  if (!auth.ok) return null;

  const { data } = await auth.admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const row: ProjectRow = data;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryLabel: row.category_label,
    category: row.category,
    indexLabel: row.index_label,
    summary: row.summary,
    overview: row.overview ?? "",
    problem: row.problem ?? "",
    solution: row.solution ?? "",
    designProcess: row.design_process.join("\n"),
    developmentProcess: row.development_process.join("\n"),
    features: row.features.join("\n"),
    technologies: row.technologies.join("\n"),
    results: formatProjectResults(row.results),
    year: row.year ?? "",
    client: row.client ?? "",
    role: row.role ?? "",
    status: row.project_status,
    coverImage: row.cover_image ?? "",
    coverAlt: row.cover_alt ?? "",
    accent: row.accent ?? "",
    liveUrl: row.live_url ?? "",
    sourceUrl: row.source_url ?? "",
    sortOrder: row.sort_order,
    featured: row.featured,
    published: row.published,
  };
}

// ── Skills ───────────────────────────────────────────────────────────────────

function skillRow(input: ReturnType<typeof skillFormSchema.parse>) {
  return {
    name: input.name,
    group_name: input.groupName,
    sort_order: input.sortOrder,
    published: input.published,
  };
}

export async function saveSkill(input: unknown): Promise<ContentResult> {
  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid skill." };
  }

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const id = (parsed.data as { id?: string }).id;
  const row = skillRow(parsed.data);

  const query = admin.from("skills");
  const result = id
    ? await query.update(row).eq("id", id).select("id").maybeSingle()
    : await query.insert(row).select("id").maybeSingle();

  if (result.error) return { ok: false, message: explainWriteError(result.error) };
  if (!result.data) return { ok: false, message: "Skill not found." };

  revalidateContent([]);
  return { ok: true, message: id ? "Skill updated." : "Skill added." };
}

export async function deleteSkill(input: unknown): Promise<ContentResult> {
  const parsed = deleteContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const { data, error } = await admin
    .from("skills")
    .delete()
    .eq("id", parsed.data.id)
    // The title must match, so a stale row cannot delete the wrong skill.
    .eq("name", parsed.data.expectTitle)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) return { ok: false, message: "Skill not found — it may have been renamed." };

  revalidateContent([]);
  return { ok: true, message: `Deleted "${parsed.data.expectTitle}".` };
}

// ── Services ─────────────────────────────────────────────────────────────────

function serviceRow(input: ReturnType<typeof serviceFormSchema.parse>) {
  return {
    slug: input.slug,
    index_label: input.indexLabel,
    title: input.title,
    tagline: input.tagline,
    summary: input.summary,
    deliverables: input.deliverables,
    icon: input.icon,
    sort_order: input.sortOrder,
    published: input.published,
  };
}

export async function saveService(input: unknown): Promise<ContentResult> {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid service." };
  }

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const id = (parsed.data as { id?: string }).id;
  const row = serviceRow(parsed.data);

  const query = admin.from("services");
  const result = id
    ? await query.update(row).eq("id", id).select("slug").maybeSingle()
    : await query.insert(row).select("slug").maybeSingle();

  if (result.error) return { ok: false, message: explainWriteError(result.error) };
  if (!result.data) return { ok: false, message: "Service not found." };

  revalidateContent([]);
  return { ok: true, message: id ? "Service updated." : "Service created." };
}

export async function deleteService(input: unknown): Promise<ContentResult> {
  const parsed = deleteContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const { data, error } = await admin
    .from("services")
    .delete()
    .eq("id", parsed.data.id)
    .eq("title", parsed.data.expectTitle)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) return { ok: false, message: "Service not found — it may have been renamed." };

  revalidateContent([]);
  return { ok: true, message: `Deleted "${parsed.data.expectTitle}".` };
}

// ── Experience ───────────────────────────────────────────────────────────────

function experienceRow(input: ReturnType<typeof experienceFormSchema.parse>) {
  return {
    role: input.role,
    company: input.company,
    period: input.period,
    start_year: input.startYear,
    end_year: input.endYear ?? null,
    entry_type: input.entryType,
    location: input.location,
    summary: input.summary || null,
    responsibilities: input.responsibilities,
    technologies: input.technologies,
    achievements: input.achievements,
    sort_order: input.sortOrder,
    published: input.published,
  };
}

export async function saveExperience(input: unknown): Promise<ContentResult> {
  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const id = (parsed.data as { id?: string }).id;
  const row = experienceRow(parsed.data);

  const query = admin.from("experience");
  const result = id
    ? await query.update(row).eq("id", id).select("id").maybeSingle()
    : await query.insert(row).select("id").maybeSingle();

  if (result.error) return { ok: false, message: explainWriteError(result.error) };
  if (!result.data) return { ok: false, message: "Entry not found." };

  revalidateContent([]);
  return { ok: true, message: id ? "Entry updated." : "Entry added." };
}

export async function deleteExperience(input: unknown): Promise<ContentResult> {
  const parsed = deleteContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const { data, error } = await admin
    .from("experience")
    .delete()
    .eq("id", parsed.data.id)
    .eq("role", parsed.data.expectTitle)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) return { ok: false, message: "Entry not found — it may have been renamed." };

  revalidateContent([]);
  return { ok: true, message: `Deleted "${parsed.data.expectTitle}".` };
}

// ── Testimonials ─────────────────────────────────────────────────────────────

function testimonialRow(input: ReturnType<typeof testimonialFormSchema.parse>) {
  return {
    client_name: input.clientName,
    client_role: input.clientRole || null,
    company: input.company || null,
    quote: input.quote,
    is_placeholder: input.isPlaceholder,
    sort_order: input.sortOrder,
    published: input.published,
  };
}

export async function saveTestimonial(input: unknown): Promise<ContentResult> {
  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid testimonial." };
  }

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const id = (parsed.data as { id?: string }).id;
  const row = testimonialRow(parsed.data);

  const query = admin.from("testimonials");
  const result = id
    ? await query.update(row).eq("id", id).select("id").maybeSingle()
    : await query.insert(row).select("id").maybeSingle();

  if (result.error) return { ok: false, message: explainWriteError(result.error) };
  if (!result.data) return { ok: false, message: "Testimonial not found." };

  revalidateContent([]);
  return { ok: true, message: id ? "Testimonial updated." : "Testimonial added." };
}

export async function deleteTestimonial(input: unknown): Promise<ContentResult> {
  const parsed = deleteContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  const { data, error } = await admin
    .from("testimonials")
    .delete()
    .eq("id", parsed.data.id)
    .eq("client_name", parsed.data.expectTitle)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) {
    return { ok: false, message: "Testimonial not found — it may have been renamed." };
  }

  revalidateContent([]);
  return { ok: true, message: `Deleted "${parsed.data.expectTitle}".` };
}

// ── Projects only ────────────────────────────────────────────────────────────

export async function deleteProject(input: unknown): Promise<ContentResult> {
  const parsed = deleteContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth.ok) return auth.result;
  const { admin } = auth;

  // `project_images` cascades via the foreign key, so screenshots go with it.
  const { data, error } = await admin
    .from("projects")
    .delete()
    .eq("id", parsed.data.id)
    .eq("title", parsed.data.expectTitle)
    .select("slug")
    .maybeSingle();

  if (error) return { ok: false, message: explainWriteError(error) };
  if (!data) return { ok: false, message: "Project not found — it may have been renamed." };

  revalidateContent([`/projects/${data.slug}`]);
  return { ok: true, message: `Deleted "${parsed.data.expectTitle}" and its images.` };
}
