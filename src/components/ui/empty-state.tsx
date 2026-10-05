import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared empty state.
 *
 * Used wherever a data-driven list can legitimately be empty (no published
 * testimonials, an unused project filter, an empty admin inbox). Always states
 * what is missing and what happens next rather than showing a bare blank.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-bg-elevated px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-md border border-border bg-surface text-fg-subtle">
          {icon}
        </div>
      ) : null}

      <p className="text-base font-medium text-fg">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
        {description}
      </p>

      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/**
 * Error state for a failed operation that the visitor can retry.
 * `role="alert"` so it is announced immediately.
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-base font-medium text-fg">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}