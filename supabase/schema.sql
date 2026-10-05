-- Laxmi Chaudhary — portfolio database schema
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- It is idempotent, so re-running against an existing project is safe.
--
-- ── Design notes ─────────────────────────────────────────────────────────────
--   * Two clear groups of tables:
--       1. `contact_messages` — written by the public site, read by the admin.
--       2. Portfolio content (`projects`, `project_images`, `skills`,
--          `services`, `experience`, `testimonials`) — managed by the admin.
--     `users` holds the admin roster.
--   * Every table uses a UUID primary key and carries `created_at`/`updated_at`,
--     with `updated_at` maintained by trigger so no writer can forget it.
--   * Reads are revoked outright for anon/authenticated on every table. The
--     browser holds only the anon key; all privileged access goes through the
--     service role on the server, which bypasses RLS. An accidental
--     `grant all` later cannot silently re-expose the data.
--   * The one deliberate exception is INSERT on `contact_messages`, so a
--     legitimate client-side insert works if the anon key is ever used
--     directly. It is insert-only: no SELECT, UPDATE or DELETE policy exists.
--
-- ── Order of operations ──────────────────────────────────────────────────────
--   Extensions → shared trigger function → enums → tables → indexes →
--   triggers → RLS.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

-- gen_random_uuid() lives in pgcrypto on older PostgreSQL; on Supabase it is
-- already present, and `if not exists` makes this a no-op either way.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared trigger: keep `updated_at` honest
-- ---------------------------------------------------------------------------
--
-- Every UPDATE that does not mention `updated_at` explicitly still has to move
-- it, otherwise "last edited" silently becomes "created" for any writer that
-- forgets the column. One function, applied to every mutable table.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
--
-- Enum values are generated from `src/lib/validations.ts`, which is shared by
-- the contact form UI and the API validator. Change them there first — a value
-- that exists here but not there is rejected before it ever reaches the column.
--
-- `if not exists` cannot guard `create type`, so each block catches
-- `duplicate_object` instead.

-- Which service the enquiry is about. These mirror the eight offerings on
-- `/services`; `other` is the catch-all for anything not covered above.
--
-- `website-maintenance` is intentionally NOT in `projectTypeOptions`: the brief's
-- contact list uses `other` in its place. It stays here because PostgreSQL cannot
-- delete an enum member, so removing it would require migrating existing rows
-- first. `LEGACY_PROJECT_TYPE_LABELS` in `src/lib/validations.ts` keeps those old
-- rows readable in the admin inbox. Do not add it to the form.
do $$ begin
  create type public.project_type as enum (
    'graphic-design',
    'branding',
    'ui-ux-design',
    'website-design',
    'full-stack-development',
    'ecommerce-development',
    'admin-dashboards',
    'website-maintenance',
    'other'
  );
exception when duplicate_object then null; end $$;

-- Five bands, per the brief. `2500-plus` is retained as a legacy value from
-- the earlier four-band scale so existing rows stay valid; it is no longer
-- offered in the form.
do $$ begin
  create type public.budget_range as enum (
    'under-500',
    '500-1000',
    '1000-2500',
    '2500-5000',
    '5000-plus',
    '2500-plus'
  );
exception when duplicate_object then null; end $$;

-- How soon the client needs to start. Drives the reply template and lets
-- enquiries be triaged in the dashboard without reading the message body.
do $$ begin
  create type public.timeline_range as enum (
    'asap',
    '1-2-months',
    '3-6-months',
    'flexible'
  );
exception when duplicate_object then null; end $$;

-- `replied` is set when the reply email has actually gone out, so the dashboard
-- reflects the real state of the conversation rather than just "opened".
do $$ begin
  create type public.message_status as enum (
    'new',
    'read',
    'replied',
    'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_category as enum (
    'graphic-design',
    'branding',
    'ui-ux',
    'web-design',
    'frontend',
    'full-stack'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum (
    'live',
    'in-development',
    'concept',
    'archived'
  );
exception when duplicate_object then null; end $$;

-- Five groups per the brief. `web` is retained as a legacy label so existing
-- rows stay valid; it is superseded by `frontend`.
do $$ begin
  create type public.skill_group as enum (
    'design',
    'frontend',
    'backend',
    'database',
    'tools',
    'web'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.entry_type as enum (
    'freelance',
    'employment',
    'internship',
    'education',
    'project'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- users — the admin roster
-- ---------------------------------------------------------------------------
--
-- `auth_id` mirrors `auth.users.id` from Supabase Auth. There is deliberately no
-- password or credential column here: passwords live in Supabase Auth and are
-- never duplicated into application tables. `role` gates the dashboard, and
-- defaults to the least-privileged value so a row inserted by accident cannot
-- grant admin by omission.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique check (char_length(email) between 3 and 254),
  full_name text check (full_name is null or char_length(full_name) <= 120),
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is
  'Admin accounts permitted to use the dashboard. Credentials live in Supabase Auth.';

-- ---------------------------------------------------------------------------
-- contact_messages — public enquiries
-- ---------------------------------------------------------------------------
--
-- Columns mirror the seven fields the contact form collects, plus operational
-- metadata: name, email, phone, service (project_type), budget, timeline and the
-- project details (message).
--
-- `subject` and `company` have no input in the current form. Both are kept —
-- nullable — because they predate it and removing columns would lose historical
-- data. `subject` is derived by the API from `project_type` so the admin inbox
-- keeps a scannable summary line.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),

  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  project_type public.project_type,
  budget public.budget_range,
  timeline public.timeline_range,
  message text not null check (char_length(message) between 10 and 5000),
  -- Length constraint for `subject` is added in the migration section below, so
  -- a fresh install and an upgraded one end up with the same single constraint.
  subject text,

  status public.message_status not null default 'new',

  -- Metadata. `user_agent` and `referer` are stored truncated for abuse triage;
  -- no IP address is persisted, so there is nothing to erase on request.
  user_agent text check (user_agent is null or char_length(user_agent) <= 512),
  referer text check (referer is null or char_length(referer) <= 512),
  ip_hash text check (ip_hash is null or char_length(ip_hash) <= 128),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  read_at timestamptz,
  replied_at timestamptz,
  archived_at timestamptz
);

comment on table public.contact_messages is
  'Project enquiries submitted through the public contact form.';

comment on column public.contact_messages.ip_hash is
  'SHA-256 of the submitting IP, salted with CONTACT_IP_SALT. Used only for rate-limit auditing; never reversible to an address.';

comment on column public.contact_messages.subject is
  'Derived from project_type by POST /api/contact. Kept for a scannable inbox summary; the form has no subject input.';

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
--
-- The database-backed twin of `src/data/projects.ts`. The static file remains the
-- build-time fallback so the site still renders with no database configured;
-- when Supabase is available the dashboard writes here and the public pages
-- read from this table.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  -- Short label for the card, e.g. "Restaurant Management & Ordering Platform".
  category_label text not null check (char_length(category_label) between 1 and 160),
  category public.project_category not null,
  -- Card/detail ordering marker, e.g. "01". Stored separately from `sort_order`
  -- because it is the display label shown in the UI, not the sort key.
  index_label text not null check (char_length(index_label) between 1 and 16),

  summary text not null check (char_length(summary) between 1 and 600),
  overview text,
  problem text,
  solution text,
  design_process text[] not null default '{}',
  development_process text[] not null default '{}',
  features text[] not null default '{}',
  -- Array of {label, value} pairs. JSONB rather than a child table because it is
  -- always read and written whole with its project and never filtered on.
  results jsonb not null default '[]'::jsonb,
  technologies text[] not null default '{}',

  year text check (year is null or char_length(year) <= 16),
  client text check (client is null or char_length(client) <= 160),
  role text check (role is null or char_length(role) <= 200),
  project_status public.project_status not null default 'concept',

  cover_image text check (cover_image is null or char_length(cover_image) <= 500),
  cover_alt text check (cover_alt is null or char_length(cover_alt) <= 300),
  accent text check (accent is null or accent ~* '^#[0-9a-f]{6}$'),

  live_url text check (live_url is null or live_url ~* '^https?://'),
  source_url text check (source_url is null or source_url ~* '^https?://'),

  -- Display order on the index. Lower sorts first.
  sort_order integer not null default 0,
  featured boolean not null default false,
  published boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- `results` is a JSON array; guard against an object or scalar sneaking in.
  constraint projects_results_is_array check (jsonb_typeof(results) = 'array')
);

comment on table public.projects is
  'Case studies. Public pages read published rows; unpublished rows are drafts visible only in the dashboard.';

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  src text not null check (char_length(src) between 1 and 500),
  alt text not null check (char_length(alt) between 1 and 300),
  caption text check (caption is null or char_length(caption) <= 300),
  -- 'cover' | 'screenshot' | 'gallery'; drives ordering and layout hints.
  kind text not null default 'screenshot' check (kind in ('cover', 'screenshot', 'gallery')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.project_images is
  'Screenshots and imagery for a project. Cascade-deleted with the parent project.';

-- ---------------------------------------------------------------------------
-- skills / services / experience / testimonials
-- ---------------------------------------------------------------------------
--
-- All four are ordered, publishable content. `sort_order` gives the dashboard
-- drag-free reordering; `published` keeps work-in-progress out of the public site.

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  group_name public.skill_group not null,
  -- No proficiency percentage column: invented skill scores misrepresent real
  -- ability. Presence and grouping carry the meaning instead.
  --
  -- One row per skill, not per category. The category heading copy (label and
  -- the sentence under it) is page prose that changes with the design rather
  -- than with the skill list, so it stays in `src/data/skills.ts`; this table
  -- owns the membership and ordering of each group, which is the part an admin
  -- actually needs to edit.
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.skills is
  'Individual tools and disciplines, grouped. Ordered, never scored. The enclosing category headings live in src/data/skills.ts.';

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  index_label text not null check (char_length(index_label) between 1 and 16),
  title text not null check (char_length(title) between 1 and 120),
  tagline text not null check (char_length(tagline) between 1 and 300),
  summary text not null check (char_length(summary) between 1 and 600),
  deliverables text[] not null default '{}',
  -- Name of the Lucide icon rendered in `components/ui/service-icon.tsx`.
  -- The allowed set is enforced in the app layer by `serviceIconSchema`, since
  -- a CHECK constraint would duplicate that union and drift from it.
  icon text not null default 'palette',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.services is
  'Service offerings shown on /services and the home page.';

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null check (char_length(role) between 1 and 160),
  company text not null check (char_length(company) between 1 and 160),
  -- Human-readable duration, e.g. "2023 - Present". Stored rather than
  -- formatted at render time so the phrasing can be edited per entry.
  period text not null check (char_length(period) between 1 and 80),
  start_year integer not null check (start_year between 1970 and 2200),
  -- NULL means "current role"; the timeline renders it as "Present".
  end_year integer check (end_year is null or end_year between 1970 and 2200),
  entry_type public.entry_type not null default 'freelance',
  location text not null check (char_length(location) between 1 and 120),
  summary text,
  responsibilities text[] not null default '{}',
  technologies text[] not null default '{}',
  achievements text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_year_order check (end_year is null or end_year >= start_year)
);

comment on table public.experience is
  'Timeline entries for /experience and the résumé. Ordered most recent first.';

comment on column public.experience.entry_type is
  'Education entries are excluded when deriving years of professional experience.';

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null check (char_length(client_name) between 1 and 120),
  client_role text check (client_role is null or char_length(client_role) <= 160),
  company text check (company is null or char_length(company) <= 160),
  quote text not null check (char_length(quote) between 1 and 1200),
  photo_url text check (photo_url is null or photo_url ~* '^https?://|^/'),
  -- TRUE while this row is template copy rather than a real client statement.
  -- The public carousel renders nothing when only placeholders exist, so an
  -- unfilled testimonial can never be mistaken for a real endorsement.
  is_placeholder boolean not null default true,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.testimonials is
  'Client testimonials. Placeholder rows must stay is_placeholder = true until replaced with a real, attributable quote.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
--
-- Every index below backs a query the app actually issues. Unused indexes are
-- pure write cost on a small table.

-- Admin dashboard: newest-first with an optional status filter.
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_status_created_at_idx
  on public.contact_messages (status, created_at desc);

create index if not exists contact_messages_email_idx
  on public.contact_messages (lower(email));

-- Public queries: published rows in display order.
create index if not exists projects_published_sort_order_idx
  on public.projects (published, sort_order);

create index if not exists projects_featured_idx
  on public.projects (featured)
  where published;

create index if not exists project_images_project_sort_order_idx
  on public.project_images (project_id, sort_order);

create index if not exists skills_published_sort_order_idx
  on public.skills (published, sort_order);

create index if not exists services_published_sort_order_idx
  on public.services (published, sort_order);

create index if not exists experience_published_sort_order_idx
  on public.experience (published, sort_order);

-- The public carousel filters out placeholders, so the partial index keeps that
-- lookup cheap even while placeholder rows sit unpublished in the table.
create index if not exists testimonials_published_idx
  on public.testimonials (sort_order)
  where published and not is_placeholder;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
--
-- Dropped first so this script is re-runnable: `create trigger` has no
-- `if not exists`, and an existing trigger with the same name is replaced.

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists project_images_set_updated_at on public.project_images;
create trigger project_images_set_updated_at
  before update on public.project_images
  for each row execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists experience_set_updated_at on public.experience;
create trigger experience_set_updated_at
  before update on public.experience
  for each row execute function public.set_updated_at();

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
--
-- RLS on + no policies = deny. Enabling alone is not enough: a table with RLS
-- enabled and zero policies rejects every anon/authenticated request, which is
-- exactly the posture wanted here. All privileged access uses the service role,
-- which bypasses RLS by design.

alter table public.users enable row level security;
alter table public.contact_messages enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.skills enable row level security;
alter table public.services enable row level security;
alter table public.experience enable row level security;
alter table public.testimonials enable row level security;

-- Revoke first, then re-grant only the capability each role genuinely needs.
revoke all on table public.users from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_images from anon, authenticated;
revoke all on table public.skills from anon, authenticated;
revoke all on table public.services from anon, authenticated;
revoke all on table public.experience from anon, authenticated;
revoke all on table public.testimonials from anon, authenticated;

-- The single intentional exception: anyone may submit an enquiry, but only
-- insert. No SELECT/UPDATE/DELETE policy exists on this table, so the anon key
-- still cannot read a single message back.
drop policy if exists "contact_messages allow insert" on public.contact_messages;
create policy "contact_messages allow insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Portfolio content is read through the server (service role) so that the
-- published/draft filter is applied in one place, in application code, rather
-- than being duplicated as a RLS policy that could drift from it. That also
-- keeps the anon key from enumerating draft case studies.

-- ---------------------------------------------------------------------------
-- Migrations for databases created before this version
-- ---------------------------------------------------------------------------
--
-- `create table if not exists` is a no-op on an existing table, so these ALTERs
-- are what bring an older install up to date. Each is guarded, which makes the
-- whole file safe to re-run against either a fresh or an existing project.
-- ---------------------------------------------------------------------------

do $$ begin
  alter table public.contact_messages add column if not exists updated_at timestamptz not null default now();
exception when others then null; end $$;

do $$ begin
  alter table public.contact_messages add column if not exists subject text;
exception when others then null; end $$;

-- `subject` now carries a derived value rather than a typed one, so the NOT NULL
-- is lifted. Existing rows keep whatever they had.
do $$ begin
  alter table public.contact_messages alter column subject drop not null;
exception when others then null; end $$;

-- Backfill before re-tightening, so an existing row cannot block the change.
update public.contact_messages
   set subject = 'Project enquiry'
 where subject is null;

do $$ begin
  alter table public.contact_messages
    alter column subject add constraint contact_messages_subject_length
    check (char_length(subject) between 3 and 140);
exception when duplicate_object then null; end $$;

-- These two were `not null` back when the form did not collect them. The current
-- form asks for both, but they stay optional so a quick question is not blocked.
do $$ begin
  alter table public.contact_messages alter column project_type drop not null;
exception when others then null; end $$;

do $$ begin
  alter table public.contact_messages alter column budget drop not null;
exception when others then null; end $$;

-- ---------------------------------------------------------------------------
-- Migration: the seven-field contact form
--
-- `timeline` is new — the brief added a "when do you need this" dropdown, which
-- is worth storing separately because it is the fastest way to triage urgency in
-- the inbox without reading the message body.
--
-- The enum labels below are added with bare statements rather than inside a `do`
-- block: PostgreSQL refuses to add an enum value inside a transaction block, and
-- a `do` block is one. The legacy budget label is kept so existing rows stay
-- valid; `2500-plus` is no longer offered in the form.
-- ---------------------------------------------------------------------------

alter type public.project_type add value if not exists 'ecommerce-development';
alter type public.project_type add value if not exists 'admin-dashboards';
alter type public.project_type add value if not exists 'website-maintenance';
alter type public.budget_range add value if not exists '2500-5000';
alter type public.budget_range add value if not exists '5000-plus';
alter type public.project_category add value if not exists 'frontend';

-- Skills regrouped from three categories to five. `web` is kept for old rows.
alter type public.skill_group add value if not exists 'frontend';
alter type public.skill_group add value if not exists 'backend';
alter type public.skill_group add value if not exists 'database';

do $$ begin
  create type public.timeline_range as enum (
    'asap',
    '1-2-months',
    '3-6-months',
    'flexible'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.contact_messages add column if not exists timeline public.timeline_range;
exception when others then null; end $$;

-- ---------------------------------------------------------------------------
-- Status migration: `spam` → `replied`
--
-- The status vocabulary now matches the brief exactly: new / read / replied /
-- archived. `spam` is retired, and its rows are folded into `archived` rather
-- than deleted so no real enquiry is lost in the transition.
--
-- `alter type ... add/drop value` is deliberately written as bare statements
-- instead of being wrapped in a `do` block: older PostgreSQL refuses to add an
-- enum label inside a transaction block, and a `do` block is one. Each line
-- auto-commits on its own in the Supabase SQL editor.
-- ---------------------------------------------------------------------------

alter type public.message_status add value if not exists 'replied';

update public.contact_messages
   set status = 'archived',
       archived_at = coalesce(archived_at, now())
 where status = 'spam';

-- Only legal once no row holds the label, which the UPDATE above guarantees.
alter type public.message_status drop value if exists 'spam';

-- Timestamps for the two terminal states, so the dashboard can show when a
-- reply went out rather than only that it did.
do $$ begin
  alter table public.contact_messages add column if not exists replied_at timestamptz;
exception when others then null; end $$;

-- ---------------------------------------------------------------------------
-- Realtime is deliberately not enabled. Nothing in the admin UI subscribes to
-- live changes, and enabling it would broadcast inserts to anyone holding the
-- anon key.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Maintenance
--
-- Optional: schedule monthly pruning of archived messages.
-- Uncomment and adjust the retention window to taste.
-- ---------------------------------------------------------------------------

-- create extension if not exists "pg_cron";
--
-- select cron.schedule(
--   'prune-contact-messages',
--   '0 3 * * *',
--   $$ delete from public.contact_messages
--      where status = 'archived'
--        and coalesce(archived_at, created_at) < now() - interval '12 months' $$
-- );