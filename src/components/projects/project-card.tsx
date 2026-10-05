import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Project, ProjectLink } from "@/types/project";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/ui/brand-icon";

/**
 * Status chip styling.
 *
 * These render ON TOP of the project artwork, which is a dark UI screenshot, so
 * a translucent tint or a plain surface fill would disappear into it. Each chip
 * therefore carries its own near-opaque ground plus a border and a light blur,
 * which is the one place "minimal glassmorphism" earns its keep: the label stays
 * legible over any artwork without needing to know how dark that artwork is.
 * The coloured text is then guaranteed 6.8:1+ against that ground.
 */
const statusStyles: Record<Project["status"], string> = {
  live: "bg-bg/90 text-success backdrop-blur-sm",
  "in-development": "bg-bg/90 text-accent backdrop-blur-sm",
  concept: "bg-bg/90 text-fg-muted backdrop-blur-sm",
  archived: "bg-bg/90 text-fg-subtle backdrop-blur-sm",
};

const statusLabels: Record<Project["status"], string> = {
  live: "Live",
  "in-development": "In development",
  concept: "Concept",
  archived: "Archived",
};

/**
 * Large project card.
 *
 * The whole card is a single link to the case study, with the outbound links
 * (live site, repository) as separate anchors layered above it. Nested
 * interactive elements are avoided so keyboard focus never lands inside
 * another link.
 */
export function ProjectCard({
  project,
  className,
  priority = false,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  className?: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const externalLinks = project.links.filter(
    (link) => !link.href.startsWith("/"),
  );
  const internalLinks = project.links.filter((link) =>
    link.href.startsWith("/"),
  );

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-lg border border-border bg-bg-elevated transition-colors duration-300 hover:border-border-strong",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(min-width: 1024px) 46vw, (min-width: 640px) 46vw, 92vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />

        {/*
          No gradient scrim here. An earlier version dimmed the bottom of the
          artwork so the "01" index could sit on it in white — but the scrim is
          a *sibling* of that label, not an ancestor, so nothing about the
          label's contrast can be resolved from the DOM, and against the card
          surface it computes to 1:1 (invisible). The index now lives in the
          meta row below, on a known background, where it is legible by
          construction.
        */}
        <span
          className={cn(
            "absolute left-4 top-4 rounded-xs border border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em]",
            statusStyles[project.status],
          )}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-fg-subtle">
            {project.index}
          </span>
          <span aria-hidden="true" className="text-fg-subtle">
            ·
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
            {project.categoryLabel}
          </span>
          <span aria-hidden="true" className="text-fg-subtle">
            ·
          </span>
          <span className="font-mono text-[0.6875rem] text-fg-subtle">
            {project.year}
          </span>
        </div>

        <Heading className="mt-3 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {project.title}
        </Heading>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {project.summary}
        </p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((technology) => (
            <li
              key={technology}
              className="rounded-xs border border-border px-2 py-0.5 font-mono text-[0.625rem] text-fg-subtle"
            >
              {technology}
            </li>
          ))}
          {project.technologies.length > 5 ? (
            <li className="px-2 py-0.5 font-mono text-[0.625rem] text-fg-subtle">
              +{project.technologies.length - 5}
            </li>
          ) : null}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm text-fg transition-colors group-hover:text-accent">
            View Project
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>

          {externalLinks.length > 0 ? (
            <span className="ml-auto flex items-center gap-4">
              {externalLinks.map((link) => (
                <OutboundLink key={link.href} link={link} title={project.title} />
              ))}
            </span>
          ) : null}

          {internalLinks.map((link) => (
            <span key={link.href} className="ml-auto text-sm text-fg-muted">
              {link.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stretched link: makes the entire card clickable without nesting anchors. */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="sr-only">
          View case study: {project.title}
        </span>
      </Link>
    </article>
  );
}

/** Outbound project link, kept above the stretched card link. */
function OutboundLink({
  link,
  title,
}: {
  link: ProjectLink;
  title: string;
}) {
  const isGithub = link.icon === "github";

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-20 inline-flex items-center gap-1.5 py-1 text-sm text-fg-muted transition-colors hover:text-accent"
    >
      {isGithub ? (
        <BrandIcon name="github" size={16} />
      ) : (
        <ArrowUpRight aria-hidden="true" className="size-4" />
      )}
      <span className="sr-only">
        {link.label} — {title} (opens in a new tab)
      </span>
      <span aria-hidden="true">{link.label}</span>
    </a>
  );
}