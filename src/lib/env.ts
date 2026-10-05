/**
 * Typed, lazy access to environment variables.
 *
 * Nothing here throws at module scope. The portfolio must build and render
 * without any secrets present (CI, preview deploys, a fresh clone), so the
 * Supabase clients are only constructed when a caller actually needs them and
 * fail with an actionable message at that point.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

/** Public Supabase config. Safe to reference from client components. */
export const publicSupabaseConfig = {
  url: supabaseUrl ?? "",
  anonKey: supabaseAnonKey ?? "",
} as const;

/** True when the browser-facing Supabase config has been supplied. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function requireValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in — see README.md for the setup steps.`,
    );
  }
  return value;
}

/** Browser/server anon client config. Throws only if called unconfigured. */
export function getPublicSupabaseConfig() {
  return {
    url: requireValue(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireValue(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

/**
 * Service-role config for privileged server work (admin CRUD).
 *
 * Server-only: `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security and must
 * never be referenced from a `"use client"` module or exposed via a
 * `NEXT_PUBLIC_` prefix.
 */
export function getServiceRoleConfig() {
  return {
    url: requireValue(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireValue(
      supabaseServiceRoleKey,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}

/** True when privileged server writes are possible. */
export const isServiceRoleConfigured = Boolean(
  supabaseUrl && supabaseServiceRoleKey,
);

/** Where contact-form notifications are delivered, when configured. */
export function getNotificationEmail() {
  const value = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  return value || undefined;
}