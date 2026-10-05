import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components.
 *
 * Returns `null` when the project has not been configured yet so the UI can
 * render an honest "not connected" state instead of throwing during render.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  const { url, anonKey } = getPublicSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}