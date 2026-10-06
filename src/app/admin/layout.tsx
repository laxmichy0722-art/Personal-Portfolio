import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured, isServiceRoleConfigured } from "@/lib/env";
import { siteConfig } from "@/data/site";

/**
 * Admin layout.
 *
 * Performs the authoritative session check — `src/proxy.ts` is a fast path, but
 * this is the gate that actually gates. Redirects to `/login` with the current
 * path so the visitor lands back where they were after signing in.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without Supabase configured there is no way to authenticate anyone, so show
  // setup instructions instead of an unusable login redirect loop.
  if (!isSupabaseConfigured) {
    return <AdminSetupNotice missing="Supabase" />;
  }

  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg pt-24">
      <div className="border-b border-border bg-bg-elevated">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-baseline gap-4">
            <p className="text-sm font-semibold tracking-[0.18em] text-fg">
              {siteConfig.shortName}
            </p>
            <span aria-hidden="true" className="h-4 w-px bg-border-strong" />
            <p className="eyebrow">Enquiries</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-fg-subtle sm:inline">
              {user.email}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 py-1 text-sm text-fg-muted transition-colors hover:text-accent"
            >
              Site
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      {!isServiceRoleConfigured ? (
        <div className="container-page pt-8">
          <div className="border-l-2 border-accent bg-surface-hover px-5 py-4">
            <p className="text-sm font-medium text-fg">
              Reads are disabled on this deployment
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              <code className="font-mono text-xs text-accent">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              is not set. Authentication works, but message data cannot be read
              because{" "}
              <code className="font-mono text-xs">contact_messages</code> has
              no client-facing read policy — by design.
            </p>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

/** Shown when Supabase itself is unconfigured. */
function AdminSetupNotice({ missing }: { missing: string }) {
  return (
    <div className="flex min-h-screen items-center bg-bg pt-24">
      <div className="container-page max-w-2xl">
        <p className="eyebrow mb-6">{missing} not configured</p>
        <h1 className="text-display-sm text-fg">Dashboard unavailable</h1>
        <p className="mt-6 text-base leading-relaxed text-fg-muted">
          The admin dashboard needs Supabase credentials, which this deployment
          does not have. Add{" "}
          <code className="font-mono text-sm text-accent">
            NEXT_PUBLIC_SUPABASE_URL
          </code>
          ,{" "}
          <code className="font-mono text-sm text-accent">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          and{" "}
          <code className="font-mono text-sm text-accent">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          to <code className="font-mono text-sm">.env.local</code>, create an
          admin user in the Supabase dashboard, then reload.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex py-1 text-sm text-fg underline underline-offset-4 hover:text-accent"
        >
          Back to the portfolio
        </Link>
      </div>
    </div>
  );
}