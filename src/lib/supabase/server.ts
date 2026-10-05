import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  getPublicSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Reads the auth session from cookies via `@supabase/ssr`. Returns `null` when
 * Supabase is not configured so pages can degrade to their static content.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  const { url, anonKey } = getPublicSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled by the proxy's optimistic check.
        }
      },
    },
  });
}