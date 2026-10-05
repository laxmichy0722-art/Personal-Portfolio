"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Must be a client component — Next mounts it in place of the failed segment.
 * Deliberately plain: the point is to say what happened and offer a way out, not
 * to diagnose the problem for the visitor.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the failure in the browser console and any configured reporting
    // sink. The message itself is never rendered to the visitor.
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden border-b border-border pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      />

      <div className="container-page relative max-w-2xl">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Error 500
        </p>

        <h1 className="text-display-sm text-fg">Something broke.</h1>

        <p className="mt-6 text-base leading-relaxed text-fg-muted sm:text-lg">
          An unexpected error occurred while loading this page. It is not
          something you did. Retrying usually clears it.
        </p>

        {error.digest ? (
          <p className="mt-5 font-mono text-xs text-fg-subtle">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Button type="button" onClick={reset} className="rounded-xs">
            <RotateCcw aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xs">
            <Link href="/contact">Report the problem</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}