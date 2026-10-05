import { createClient } from "@/lib/supabase/server";

/**
 * Returns the currently signed-in user, or `null`.
 *
 * `getUser()` revalidates with Supabase Auth rather than trusting the cookie
 * payload, so a tampered or expired token does not resolve to a session.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/** True when the visitor has a valid Supabase session. */
export async function isAuthenticated() {
  return Boolean(await getCurrentUser());
}