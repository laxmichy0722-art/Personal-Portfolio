import { z } from "zod";

/**
 * Dropdown options for the enquiry form.
 *
 * These values are the wire format: they are stored in the `project_type` and
 * `budget` PostgreSQL enums, so they must stay in step with `supabase/schema.sql`.
 * `src/types/database.ts` derives its TypeScript unions from these arrays, which
 * is what keeps the database client, the form and the schema from disagreeing.
 */
export const projectTypeOptions = [
  { value: "graphic-design", label: "Graphic Design" },
  { value: "branding", label: "Branding" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "website-design", label: "Web Design" },
  { value: "full-stack-development", label: "Full-Stack Development" },
  { value: "ecommerce-development", label: "E-Commerce" },
  { value: "admin-dashboards", label: "Dashboard" },
  { value: "other", label: "Other" },
] as const;

export const budgetOptions = [
  { value: "under-500", label: "Under $500" },
  { value: "500-1000", label: "$500\u2013$1,000" },
  { value: "1000-2500", label: "$1,000\u2013$2,500" },
  { value: "2500-5000", label: "$2,500\u2013$5,000" },
  { value: "5000-plus", label: "$5,000+" },
] as const;

export const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-2-months", label: "Within 1\u20132 months" },
  { value: "3-6-months", label: "3\u20136 months" },
  { value: "flexible", label: "Flexible" },
] as const;

/**
 * Sentinel for an unset optional dropdown.
 *
 * Radix `Select` refuses to render an item whose value is the empty string, so
 * the form needs a real, selectable "not specified" option. This is a
 * form-layer value only: `POST /api/contact` normalises it to `null` before the
 * write, because `project_type` and `budget` are PostgreSQL enums and have no
 * member meaning "the visitor declined to say".
 */
export const UNSPECIFIED = "unspecified";

/** Human-readable label for a stored option value, used by the admin inbox. */
export function projectTypeLabel(value: string | null | undefined) {
  return projectTypeOptions.find((option) => option.value === value)?.label;
}

export function budgetLabel(value: string | null | undefined) {
  return budgetOptions.find((option) => option.value === value)?.label;
}

export function timelineLabel(value: string | null | undefined) {
  return timelineOptions.find((option) => option.value === value)?.label;
}

/**
 * Legacy value kept readable in the admin inbox.
 *
 * `2500-plus` belonged to the earlier four-band budget scale and is still valid
 * in the database enum, but it is no longer offered in the form. Without this
 * an older message would render its budget as a raw enum string.
 */
export const LEGACY_BUDGET_LABELS: Record<string, string> = {
  "2500-plus": "$2,500+",
};

/**
 * `project_type` values that are stored but not offered in the form.
 *
 * `website-maintenance` is a real service in `src/data/services.ts`, and it was
 * in the contact dropdown when this schema was first written, so the enum member
 * still exists in the database. The brief's contact list replaced it with
 * `other`, and adding it back would mean inventing a ninth choice the brief did
 * not ask for — so the value stays readable here and out of the form. Dropping
 * it from the enum instead is not an option: PostgreSQL cannot remove an enum
 * member, and existing rows would have to be migrated first.
 */
export const LEGACY_PROJECT_TYPE_LABELS: Record<string, string> = {
  "website-maintenance": "Website Maintenance",
};

/**
 * Wraps an enum so the field is genuinely optional.
 *
 * Accepts a real value, the `UNSPECIFIED` sentinel, or an absent/empty value.
 * Without this the two dropdowns below would be *required* — a visitor who just
 * wants to ask a question should not be blocked by a funnel they did not come
 * for, which is why the brief marks them optional.
 */
function optionalEnum<T extends [string, ...string[]]>(values: T) {
  return z.union([z.enum(values), z.literal(""), z.literal(UNSPECIFIED)]).optional();
}

/**
 * Contact form schema — the seven fields the brief specifies:
 * name, email, phone, service, budget, timeline, project details.
 *
 * Three are required: name, email and the project description. Everything else
 * is optional, so a visitor who simply wants to ask a question is never blocked
 * by a funnel they did not come for.
 *
 * There is deliberately no `subject` field. The brief dropped it in favour of
 * the service dropdown, and `subject` is `NOT NULL` in the database — so the API
 * derives one from the selected service instead of asking the visitor to supply
 * a second label for the same information.
 *
 * Shared by React Hook Form (client) and `POST /api/contact` (server) so the
 * two can never drift. The API always re-validates — client validation is a UX
 * affordance, not a security control.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .max(160, "Email must be 160 characters or fewer."),
  projectType: optionalEnum([
    ...(projectTypeOptions.map((option) => option.value) as [
      (typeof projectTypeOptions)[number]["value"],
      ...(typeof projectTypeOptions)[number]["value"][],
    ]),
    UNSPECIFIED,
  ]),
  budget: optionalEnum([
    ...(budgetOptions.map((option) => option.value) as [
      (typeof budgetOptions)[number]["value"],
      ...(typeof budgetOptions)[number]["value"][],
    ]),
    UNSPECIFIED,
  ]),
  timeline: optionalEnum([
    ...(timelineOptions.map((option) => option.value) as [
      (typeof timelineOptions)[number]["value"],
      ...(typeof timelineOptions)[number]["value"][],
    ]),
    UNSPECIFIED,
  ]),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number must be 40 characters or fewer.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Please describe your project in at least 20 characters.")
    .max(4000, "Message must be 4000 characters or fewer."),
  /**
   * Honeypot. Hidden from humans, filled by naive bots.
   *
   * Deliberately has no validation rule. If it did, the schema would reject a
   * bot's submission with a 400 that names the defence — telling the bot it was
   * detected and leaking the mechanism. `POST /api/contact` checks this field on
   * the raw body, before this schema runs, and returns a normal-looking success.
   */
  website: z.string().max(200).optional().or(z.literal("")),
  /**
   * Milliseconds the form was open, measured client-side. Bots submit in well
   * under a second. Compared server-side against a minimum; optional because a
   * client with a broken clock should not be locked out of a real enquiry.
   */
  startedAt: z.number().int().nonnegative().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field names, used to map Zod issues onto form state. */
export type ContactField = keyof ContactInput;

/**
 * Normalises an optional dropdown value for storage.
 *
 * `UNSPECIFIED`, an empty string and an absent value all mean "not given", and
 * the database column is nullable while its enum has no such member.
 */
export function optionalValue(
  value: string | null | undefined,
): string | null {
  if (!value || value === UNSPECIFIED) return null;
  return value;
}

/**
 * Builds the stored `subject` for a contact message.
 *
 * `contact_messages.subject` is `NOT NULL`, but the form no longer collects a
 * subject — the service dropdown carries that information. So the API derives
 * one: the selected service label when there is one, falling back to a generic
 * line. This keeps the column meaningful in the inbox without inventing a field
 * the visitor was never asked to fill.
 */
export function deriveSubject(
  projectType: string | null | undefined,
): string {
  if (projectType && projectType !== UNSPECIFIED) {
    const label = projectTypeLabel(projectType);
    if (label) return `New enquiry — ${label}`;
  }
  return "New enquiry from the portfolio";
}

/** Per-field messages extracted from a Zod error, for API responses. */
export function collectFieldErrors(error: z.ZodError) {
  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * Valid contact-message statuses.
 *
 * Mirrors the `message_status` enum in `supabase/schema.sql` — keep the two in
 * step or writes will fail at the database with a constraint violation.
 */
export const messageStatusSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

export type MessageStatus = z.infer<typeof messageStatusSchema>["status"];

/** Admin: move a message to a new status. */
export const updateMessageSchema = z.object({
  id: z.string().uuid("Invalid message id."),
  status: messageStatusSchema.shape.status,
});

