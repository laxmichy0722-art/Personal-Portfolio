/**
 * Hand-written mirror of `supabase/schema.sql`.
 *
 * The *contact* enums below are *derived* from the option lists in
 * `src/lib/validations.ts`, which the contact form renders and
 * `POST /api/contact` validates against. Deriving rather than re-declaring
 * means the TypeScript side cannot drift from the form; the SQL in
 * `supabase/schema.sql` is the only remaining place to update by hand.
 */
import type {
  budgetOptions,
  projectTypeOptions,
  timelineOptions,
} from "@/lib/validations";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Mirrors the `project_type` enum in `supabase/schema.sql`. */
export type ContactProjectType =
  | (typeof projectTypeOptions)[number]["value"]
  | null;

/** Mirrors the `budget_range` enum in `supabase/schema.sql`. */
export type ContactBudgetRange = (typeof budgetOptions)[number]["value"] | null;

/**
 * Mirrors the `timeline_range` enum.
 *
 * `LegacyBudgetRange` is included because the database enum still carries
 * `2500-plus` from the earlier four-band scale; the form no longer offers it.
 */
export type ContactTimelineRange = (typeof timelineOptions)[number]["value"] | null;

export type LegacyBudgetRange = "2500-plus";

/** Mirrors the `message_status` enum. */
export type ContactMessageStatus = "new" | "read" | "replied" | "archived";

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  /** Summary line, derived server-side from `project_type`. */
  subject: string;
  phone: string | null;
  company: string | null;
  project_type: ContactProjectType;
  budget: ContactBudgetRange;
  /** When the client wants to start. Nullable — new column, older rows lack it. */
  timeline: ContactTimelineRange;
  message: string;
  status: ContactMessageStatus;
  user_agent: string | null;
  referer: string | null;
  /** Salted SHA-256 of the submitting IP. Not reversible to an address. */
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  replied_at: string | null;
  archived_at: string | null;
}

/** Convenience alias for the admin UI. */
export type ContactMessage = ContactMessageRow;

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio content
//
// These mirror the `projects` / `project_images` / `skills` / `services` /
// `experience` / `testimonials` tables. The public-facing shapes in
// `src/types/content.ts` and `src/types/project.ts` are richer than the rows;
// `src/lib/content/portfolio.ts` maps one into the other.
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectCategoryValue =
  | "graphic-design"
  | "branding"
  | "ui-ux"
  | "web-design"
  | "frontend"
  | "full-stack";

export type ProjectStatusValue = "live" | "in-development" | "concept" | "archived";

/**
 * Mirrors the `skill_group` enum.
 *
 * The brief regrouped skills into Design / Frontend / Backend / Database / Tools,
 * but the enum still carries the original `web` label so existing rows stay
 * valid. New content should use the five categories above.
 */
export type SkillGroupValue =
  | "design"
  | "frontend"
  | "backend"
  | "database"
  | "tools"
  | "web";

export type ExperienceTypeValue =
  | "freelance"
  | "employment"
  | "internship"
  | "education"
  | "project";

/** A `{label, value}` pair from `projects.results`. */
export interface ProjectResult {
  label: string;
  value: string;
}

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category_label: string;
  category: ProjectCategoryValue;
  index_label: string;
  summary: string;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  design_process: string[];
  development_process: string[];
  features: string[];
  results: ProjectResult[];
  technologies: string[];
  year: string | null;
  client: string | null;
  role: string | null;
  project_status: ProjectStatusValue;
  cover_image: string | null;
  cover_alt: string | null;
  accent: string | null;
  live_url: string | null;
  source_url: string | null;
  sort_order: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectImageRow = {
  id: string;
  project_id: string;
  src: string;
  alt: string;
  caption: string | null;
  kind: "cover" | "screenshot" | "gallery";
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SkillRow = {
  id: string;
  name: string;
  group_name: SkillGroupValue;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceRow = {
  id: string;
  slug: string;
  index_label: string;
  title: string;
  tagline: string;
  summary: string;
  deliverables: string[];
  icon: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  period: string;
  start_year: number;
  end_year: number | null;
  entry_type: ExperienceTypeValue;
  location: string;
  summary: string | null;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type TestimonialRow = {
  id: string;
  client_name: string;
  client_role: string | null;
  company: string | null;
  quote: string;
  photo_url: string | null;
  is_placeholder: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRow = {
  id: string;
  /** Mirrors `auth.users.id`. There is no password column by design. */
  auth_id: string;
  email: string;
  full_name: string | null;
  role: "viewer" | "editor" | "admin";
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// The `Database` type consumed by the Supabase clients
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `Insert` shape for a table.
 *
 * `Generated` lists the columns Postgres fills in itself — the primary key, the
 * two timestamps, and anything with a DEFAULT. Those become optional; everything
 * else stays required, so forgetting a `title` is a compile error at the call site
 * instead of a 400 from the database.
 */
type InsertShape<Row, Generated extends keyof Row> = Omit<Row, Generated> &
  Partial<Pick<Row, Generated>>;

/** `Update` shape — every column optional, since a PATCH is partial by nature. */
type UpdateShape<Row> = Partial<Row>;

/** Tables with no foreign keys declare an empty relationship list. */
type NoRelationships = [];

interface ContactMessagesTable {
  Row: ContactMessageRow;
  Insert: InsertShape<
    ContactMessageRow,
    | "id"
    | "status"
    | "user_agent"
    | "referer"
    | "ip_hash"
    | "created_at"
    | "updated_at"
    | "read_at"
    | "replied_at"
    | "archived_at"
  >;
  Update: UpdateShape<ContactMessageRow>;
  Relationships: NoRelationships;
}

interface ProjectsTable {
  Row: ProjectRow;
  Insert: InsertShape<
    ProjectRow,
    | "id"
    | "design_process"
    | "development_process"
    | "features"
    | "results"
    | "technologies"
    | "project_status"
    | "sort_order"
    | "featured"
    | "published"
    | "created_at"
    | "updated_at"
  >;
  Update: UpdateShape<ProjectRow>;
  Relationships: NoRelationships;
}

interface ProjectImagesTable {
  Row: ProjectImageRow;
  Insert: InsertShape<
    ProjectImageRow,
    "id" | "kind" | "sort_order" | "created_at" | "updated_at"
  >;
  Update: UpdateShape<ProjectImageRow>;
  Relationships: [
    {
      foreignKeyName: "project_images_project_id_fkey";
      columns: ["project_id"];
      isOneToOne: false;
      referencedRelation: "projects";
      referencedColumns: ["id"];
    },
  ];
}

interface SkillsTable {
  Row: SkillRow;
  Insert: InsertShape<
    SkillRow,
    "id" | "sort_order" | "published" | "created_at" | "updated_at"
  >;
  Update: UpdateShape<SkillRow>;
  Relationships: NoRelationships;
}

interface ServicesTable {
  Row: ServiceRow;
  Insert: InsertShape<
    ServiceRow,
    "id" | "icon" | "sort_order" | "published" | "created_at" | "updated_at"
  >;
  Update: UpdateShape<ServiceRow>;
  Relationships: NoRelationships;
}

interface ExperienceTable {
  Row: ExperienceRow;
  Insert: InsertShape<
    ExperienceRow,
    | "id"
    | "entry_type"
    | "sort_order"
    | "published"
    | "created_at"
    | "updated_at"
  >;
  Update: UpdateShape<ExperienceRow>;
  Relationships: NoRelationships;
}

interface TestimonialsTable {
  Row: TestimonialRow;
  Insert: InsertShape<
    TestimonialRow,
    | "id"
    | "photo_url"
    | "is_placeholder"
    | "sort_order"
    | "published"
    | "created_at"
    | "updated_at"
  >;
  Update: UpdateShape<TestimonialRow>;
  Relationships: NoRelationships;
}

interface UsersTable {
  Row: UserRow;
  Insert: InsertShape<UserRow, "id" | "role" | "created_at" | "updated_at">;
  Update: UpdateShape<UserRow>;
  Relationships: NoRelationships;
}

/**
 * Every table in `supabase/schema.sql`, in the shape `supabase-js` expects.
 *
 * Hand-written rather than generated so it stays reviewable in a diff and so the
 * enums can be *derived* from the option lists in `src/lib/validations.ts` — the
 * contact form and the API validator cannot then drift from the column types.
 * If a column is added in SQL, add it here too; the clients are typed against
 * this, so a missing column is a compile error rather than a silent `undefined`.
 */
export interface Database {
  public: {
    Tables: {
      users: UsersTable;
      contact_messages: ContactMessagesTable;
      projects: ProjectsTable;
      project_images: ProjectImagesTable;
      skills: SkillsTable;
      services: ServicesTable;
      experience: ExperienceTable;
      testimonials: TestimonialsTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      project_type: Exclude<ContactProjectType, null>;
      budget_range: Exclude<ContactBudgetRange, null>;
      message_status: ContactMessageStatus;
      project_category: ProjectCategoryValue;
      project_status: ProjectStatusValue;
      skill_group: SkillGroupValue;
      entry_type: ExperienceTypeValue;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience alias used by the clients and the admin queries. */
export type Tables = Database["public"]["Tables"];

export type SupabaseError = { code?: string; message: string };