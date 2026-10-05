import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Standard top-of-page block for interior routes.
 *
 * Reserves space for the fixed navbar, sets the document outline with a single
 * `h1`, and gives every page the same hairline-grid backdrop so navigation
 * between pages feels like moving within one site rather than between sites.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  meta,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  /** Small factual strip under the description, e.g. counts or a year range. */
  meta?: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "relative overflow-hidden border-b border-border pb-16 pt-32 sm:pb-20 sm:pt-40 lg:pb-24 lg:pt-44",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.3] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 size-[30rem] rounded-full bg-accent/[0.08] blur-[120px]"
      />

      <div className="container-page relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              {eyebrow}
            </p>

            <h1 className="text-display-sm text-fg">{title}</h1>

            {description ? (
              <div className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
                {description}
              </div>
            ) : null}
          </div>

          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>

        {meta && meta.length > 0 ? (
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
            {meta.map((item) => (
              <div key={item.label} className="bg-bg-elevated px-5 py-4 sm:px-6">
                <dt className="eyebrow">{item.label}</dt>
                <dd className="mt-2 font-mono text-sm text-fg">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  );
}