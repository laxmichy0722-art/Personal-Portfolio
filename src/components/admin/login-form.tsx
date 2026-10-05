"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Admin sign-in.
 *
 * Email and password only — no OAuth providers and no self-service signup, so
 * the only way to create an admin account is to add a user through the Supabase
 * dashboard. The redirect target is read from `?next=` and constrained to a
 * same-origin path so it cannot be used as an open redirect.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextParam = searchParams.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/admin";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError(
          "Supabase is not configured on this deployment, so sign-in is unavailable.",
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Deliberately vague: distinguishing "no such user" from "wrong
        // password" tells an attacker which addresses have accounts.
        setError("Those credentials were not accepted.");
        return;
      }

      // The cookie is set by the sign-in response; refresh the server components
      // so the admin layout sees the session.
      startTransition(() => {
        router.replace(next);
        router.refresh();
      });
    } catch {
      setError("Something went wrong signing in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated p-6">
        <p className="text-sm font-medium text-fg">Not configured</p>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Supabase environment variables are missing on this deployment, so
          authentication cannot run. Add{" "}
          <code className="font-mono text-xs text-accent">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="font-mono text-xs text-accent">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to <code className="font-mono text-xs">.env.local</code> and restart
          the server.
        </p>
      </div>
    );
  }

  const busy = submitting || isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error ? (
        <div
          role="alert"
          className="rounded-xs border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-fg"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={Boolean(error)}
          className={cn(error && "border-destructive")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(error && "border-destructive")}
        />
      </div>

      <Button type="submit" disabled={busy} className="w-full rounded-xs">
        <LogIn aria-hidden="true" />
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}