import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";
import { absoluteUrl, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Administrator sign-in.",
  // Never index a login page.
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center overflow-hidden pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 size-[28rem] rounded-full bg-accent/[0.07] blur-[120px]"
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-md">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Restricted
          </p>

          <h1 className="text-display-sm text-fg">Dashboard Access</h1>

          <p className="mt-5 text-sm leading-relaxed text-fg-muted">
            Sign in to review project enquiries. Accounts are created in the
            Supabase dashboard — there is no public registration.
          </p>

          <div className="mt-10 rounded-lg border border-border bg-bg-elevated p-6 sm:p-7">
            {/* `useSearchParams` in LoginForm requires a Suspense boundary. */}
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-52 animate-pulse rounded-xs bg-surface"
                />
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-xs text-fg-subtle">
            {siteConfig.name} · <a href={absoluteUrl("/")} className="underline underline-offset-4 hover:text-accent">Back to the portfolio</a>
          </p>
        </div>
      </div>
    </div>
  );
}