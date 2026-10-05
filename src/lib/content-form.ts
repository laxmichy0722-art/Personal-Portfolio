import { z } from "zod";

/**
 * Validation schemas for the admin content editor.
 *
 * ── WHY THIS IS A SEPARATE FILE ──────────────────────────────────────────────
 * `src/lib/validations.ts` holds schemas shared with the *public* contact form,
 * where the rules double as user-facing messages and the option lists are the
 * wire format for database enums. The admin editor is a different audience with
 * different constraints — optional-by-default narrative fields, admin-facing
 * copy, and no dependency on what a visitor can type — so folding it into the
 * same module would only make both harder to read.
 *
 * Everything here is enforced again inside the server actions. These schemas
 * exist to fail fast and to describe intent; they are never the security
 * boundary. That boundary is `authorise()` in `src/app/admin/actions.ts`.
 */

// ── Shared field helpers ─────────────────────────────────────────────────────

/** Slug: lowercase, hyphen-separated, no leading/trailing hyphen. */
const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug is required.")
  .max(120, "Slug is too long.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");

/**
 * Multiline free text where blank is legitimate.
 *
 * Narration is optional throughout — a draft case study should be saveable
 * before the copy exists. Only the title-level fields are required.
 */
const proseSchema = z.string().trim().max(8000).default("");

/**
 * A textarea holding one item per line, mapped to a `text[]` column.
 *
 * Line-based rather than a repeater field because these are edited rarely and
 * reading "one per line" is faster than clicking + to add an entry.
 */
const listSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      // Drop blank lines: a stray newline should not become an empty chip.
      .filter(Boolean),
  );

/** Hex colour used for the project card accent, e.g. `#FF5A1F`. */
const hexSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour, e.g. #FF5A1F.")
  .or(z.literal(""));

/** Optional absolute URL. Empty string is normalised to null. */
const optionalUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Enter a full URL starting with http:// or https://.",
  )
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const uuidSchema = z.string().uuid("Invalid id.");

// ── Projects ─────────────────────────────────────────────────────────────────

export const projectCategoryOptions = [
  { value: "graphic-design", label: "Graphic Design" },
  { value: "branding", label: "Branding" },
  { value: "ui-ux", label: "UI/UX" },
  { value: "web-design", label: "Web Design" },
  { value: "full-stack", label: "Full-Stack" },
] as const;

export const projectStatusOptions = [
  { value: "live", label: "Live" },
  { value: "in-development", label: "In Development" },
  { value: "concept", label: "Concept" },
  { value: "archived", label: "Archived" },
] as const;

/** A `{label, value}` pair in the project's results strip. */
export const projectResultSchema = z.object({
  label: z.string().trim().min(1, "Result label is required.").max(60),
  value: z.string().trim().min(1, "Result value is required.").max(60),
});

export const projectFormSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Title is required.").max(160),
  categoryLabel: z.string().trim().min(1, "Category label is required.").max(160),
  category: z.enum(
    projectCategoryOptions.map((option) => option.value) as [
      "graphic-design",
      "branding",
      "ui-ux",
      "web-design",
      "full-stack",
    ],
  ),
  indexLabel: z.string().trim().min(1, "Index label is required.").max(16),
  summary: z.string().trim().min(1, "Summary is required.").max(600),
  overview: proseSchema,
  problem: proseSchema,
  solution: proseSchema,
  designProcess: listSchema,
  developmentProcess: listSchema,
  features: listSchema,
  technologies: listSchema,
  // Kept as a textarea of `Label: Value` lines and parsed below, because the UI
  // is far easier to use as free text than as a nested array editor.
  results: z.string().trim().default(""),
  year: z.string().trim().max(16).default(""),
  client: z.string().trim().max(160).default(""),
  role: z.string().trim().max(200).default(""),
  status: z.enum(
    projectStatusOptions.map((option) => option.value) as [
      "live",
      "in-development",
      "concept",
      "archived",
    ],
  ),
  coverImage: z.string().trim().max(500).default(""),
  coverAlt: z.string().trim().max(300).default(""),
  accent: hexSchema,
  liveUrl: optionalUrlSchema,
  sourceUrl: optionalUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

/**
 * Parses the `Label: Value` results textarea into the `results` JSONB array.
 *
 * Returns the reason for failure rather than throwing, so the caller can surface
 * it as a form error instead of a 500.
 */
export function parseProjectResults(
  raw: string,
): { ok: true; value: z.infer<typeof projectResultSchema>[] } | { ok: false; message: string } {
  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: z.infer<typeof projectResultSchema>[] = [];

  for (const row of rows) {
    // Split on the first colon only: a value like "3: 480p" must survive intact.
    const separator = row.indexOf(":");
    if (separator === -1) {
      return {
        ok: false,
        message: `"${row}" is missing a colon. Use "Label: Value" on each line.`,
      };
    }

    const candidate = {
      label: row.slice(0, separator).trim(),
      value: row.slice(separator + 1).trim(),
    };

    const result = projectResultSchema.safeParse(candidate);
    if (!result.success) {
      return { ok: false, message: `"${row}" — ${result.error.issues[0]?.message}` };
    }

    parsed.push(result.data);
  }

  return { ok: true, value: parsed };
}

/** Serialises stored results back into the textarea format for editing. */
export function formatProjectResults(
  results: { label: string; value: string }[],
): string {
  return results.map((result) => `${result.label}: ${result.value}`).join("\n");
}

// ── Skills ───────────────────────────────────────────────────────────────────

export const skillGroupOptions = [
  { value: "design", label: "Design" },
  { value: "web", label: "Web" },
  { value: "tools", label: "Tools" },
] as const;

export const skillFormSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required.").max(80),
  groupName: z.enum(
    skillGroupOptions.map((option) => option.value) as ["design", "web", "tools"],
  ),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.coerce.boolean().default(true),
});

export type SkillFormInput = z.infer<typeof skillFormSchema>;

// ── Services ─────────────────────────────────────────────────────────────────

export const serviceIconOptions = [
  { value: "palette", label: "Palette" },
  { value: "gem", label: "Gem" },
  { value: "layout-dashboard", label: "Layout Dashboard" },
  { value: "globe", label: "Globe" },
  { value: "code-2", label: "Code" },
  { value: "monitor-smartphone", label: "Responsive" },
  { value: "share-2", label: "Share" },
  { value: "wand-sparkles", label: "Sparkles" },
] as const;

export const serviceFormSchema = z.object({
  slug: slugSchema,
  indexLabel: z.string().trim().min(1, "Index label is required.").max(16),
  title: z.string().trim().min(1, "Title is required.").max(120),
  tagline: z.string().trim().min(1, "Tagline is required.").max(300),
  summary: z.string().trim().min(1, "Description is required.").max(600),
  deliverables: listSchema,
  icon: z.enum(
    serviceIconOptions.map((option) => option.value) as [
      "palette",
      "gem",
      "layout-dashboard",
      "globe",
      "code-2",
      "monitor-smartphone",
      "share-2",
      "wand-sparkles",
    ],
  ),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.coerce.boolean().default(true),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

// ── Experience ───────────────────────────────────────────────────────────────

export const experienceTypeOptions = [
  { value: "freelance", label: "Freelance" },
  { value: "employment", label: "Employment" },
  { value: "internship", label: "Internship" },
  { value: "education", label: "Education" },
  { value: "project", label: "Project" },
] as const;

export const experienceFormSchema = z
  .object({
    role: z.string().trim().min(1, "Role is required.").max(160),
    company: z.string().trim().min(1, "Organisation is required.").max(160),
    period: z.string().trim().min(1, "Period is required.").max(80),
    startYear: z.coerce.number().int().min(1970).max(2200),
    // Empty means "current", which is stored as NULL.
    endYear: z.coerce
      .number()
      .int()
      .min(1970)
      .max(2200)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    entryType: z.enum(
      experienceTypeOptions.map((option) => option.value) as [
        "freelance",
        "employment",
        "internship",
        "education",
        "project",
      ],
    ),
    location: z.string().trim().min(1, "Location is required.").max(120),
    summary: proseSchema,
    responsibilities: listSchema,
    technologies: listSchema,
    achievements: listSchema,
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    published: z.coerce.boolean().default(true),
  })
  .refine((value) => value.endYear == null || value.endYear >= value.startYear, {
    message: "End year cannot be before the start year.",
    path: ["endYear"],
  });

export type ExperienceFormInput = z.infer<typeof experienceFormSchema>;

// ── Testimonials ─────────────────────────────────────────────────────────────

export const testimonialFormSchema = z.object({
  clientName: z.string().trim().min(1, "Name is required.").max(120),
  clientRole: z.string().trim().max(160).default(""),
  company: z.string().trim().max(160).default(""),
  quote: z.string().trim().min(1, "Quote is required.").max(1200),
  // Defaults to true so a testimonial cannot be published as real by accident;
  // an admin has to actively confirm the wording came from the client.
  isPlaceholder: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.coerce.boolean().default(true),
});

export type TestimonialFormInput = z.infer<typeof testimonialFormSchema>;

// ── Shared delete ────────────────────────────────────────────────────────────

/**
 * Delete confirmation payload.
 *
 * Destructive actions are not reachable by a stray GET, so the id travels in the
 * action body rather than the URL.
 */
export const deleteContentSchema = z.object({
  id: uuidSchema,
  /** Guards against a mis-keyed delete removing a different row than intended. */
  expectTitle: z.string().trim().min(1).max(200),
});