import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vertical rhythm + optional hairline divider shared by every page section.
 *
 * Sections stack with a consistent gap so page rhythm is decided in one place
 * rather than re-tuned per page.
 *
 * The shared `container-page` gutter lives here, on the wrapper, rather than in
 * each of the ~30 call sites. Sections used to spread their children edge to
 * edge (`<section className="py-20 …">` with no horizontal padding), so every
 * heading and grid below the hero sat flush against the viewport while the hero,
 * navbar and footer were inset — the page had two different left margins. Owning
 * the gutter in one place is what makes those edges line up again.
 */
export function Section({
  className,
  children,
  id,
  bordered = true,
  ...props
}: React.ComponentProps<"section"> & {
  /** Anchor target for in-page navigation. */
  id?: string;
  /** Draw a top hairline to separate this section from the previous one. */
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      data-slot="section"
      className={cn(
        "py-20 sm:py-24 lg:py-32",
        bordered && "border-t border-border",
        className,
      )}
      {...props}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export interface SectionHeadingProps {
  /** Small mono label above the title, e.g. "Selected Work". */
  eyebrow?: string;
  /** Main heading. Rendered as `h2` unless overridden via `headingLevel`. */
  title: ReactNode;
  /** Optional supporting paragraph. */
  description?: ReactNode;
  /** Actions or metadata aligned opposite the heading on wide screens. */
  aside?: ReactNode;
  /** Heading level for correct document outline. Defaults to 2. */
  headingLevel?: 1 | 2 | 3;
  className?: string;
  /** Stack the heading and `aside` vertically even on wide screens. */
  stacked?: boolean;
}

/**
 * The standard section header: eyebrow, large title, supporting copy and an
 * optional aside slot. Used on every page so headings stay consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
  headingLevel = 2,
  className,
  stacked = false,
}: SectionHeadingProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";

  return (
    <div
      className={cn(
        "flex flex-col gap-8",
        !stacked && "lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <div className={cn("max-w-2xl", !stacked && "lg:max-w-3xl")}>
        {eyebrow ? (
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-accent"
            />
            {eyebrow}
          </p>
        ) : null}

        <Heading className="text-display-sm text-fg">{title}</Heading>

        {description ? (
          <div className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {description}
          </div>
        ) : null}
      </div>

      {aside ? (
        <div className={cn("shrink-0", stacked && "w-full")}>{aside}</div>
      ) : null}
    </div>
  );
}

/** Small pill used for categories, technologies and metadata. */
export function Tag({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex items-center rounded-xs border border-border px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide text-fg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Key/value row used in the about card, project meta and resume.
 * `label` is visually de-emphasised; `value` carries the meaning.
 */
export function MetaRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6",
        className,
      )}
    >
      <dt className="eyebrow sm:w-32 sm:shrink-0">{label}</dt>
      <dd className="text-sm text-fg sm:text-base">{value}</dd>
    </div>
  );
}