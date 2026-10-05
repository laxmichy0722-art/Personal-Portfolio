import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicSupabaseConfig } from "@/lib/env";

/**
 * Route protection for `/admin`.
 *
 * Supabase sessions live in cookies that `@supabase/ssr` refreshes on demand.
 * This runs before the admin layout so an expired token is refreshed before the
 * layout reads it, and so an unauthenticated request is redirected before any
 * privileged code loads. The layout re-checks the session independently —
 * this is a fast path, not the only gate.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const { url, anonKey } = publicSupabaseConfig;

  // Without configuration there is nothing to check against. Fall through to the
  // admin layout, which renders an explicit setup notice instead of silently
  // bouncing the user to a login page that cannot work either.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write to the request so downstream handlers see the refreshed token…
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // …and to the response so the browser actually stores it.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser()` revalidates the token with Supabase Auth. `getSession()` would
  // only trust the cookie, which is not an authorisation check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return response;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};