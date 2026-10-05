import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  getServiceRoleConfig,
  isServiceRoleConfigured,
} from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client for privileged server operations.
 *
 * Server-only. Bypasses row-level security, so it must never be imported from
 * a `"use client"` module. Use it for admin CRUD after the caller has been
 * authenticated, not for public reads.
 *
 * Returns `null` when the service-role key is absent so admin screens can show
 * a configuration notice rather than crashing.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured) return null;

  const { url, serviceRoleKey } = getServiceRoleConfig();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** The service-role client, with the null case already narrowed away. */
export type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;