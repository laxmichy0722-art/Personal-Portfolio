"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";

import type { Project, ProjectCategory } from "@/types/project";
import { projectCategories } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";

type Filter = ProjectCategory | "all";

/**
 * Filterable project grid.
 *
 * Filtering happens client-side against the statically-imported project data —
 * no fetch, no route change, no layout thrash. The grid animates with
 * `layout` so cards glide to their new positions instead of snapping.
 */
export function ProjectGrid({
  projects,
  initialFilter = "all",
  headingLevel,
}: {
  projects: Project[];
  /**
   * Lets a category page (/web-design, /full-stack-development) deep-link into
   * an already-filtered grid instead of showing everything.
   */
  initialFilter?: Filter;
  /**
   * Card titles sit at h3 when the grid lives under a section heading (the home
   * page) and at h2 when it follows the page h1 directly (/projects), so the
   * heading outline never skips a level.
   */
  headingLevel?: "h2" | "h3";
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const visible = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((project) => project.category === filter),
    [projects, filter],
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap gap-2"
      >
        {projectCategories.map((category) => {
          const active = filter === category.slug;
          const count =
            category.slug === "all"
              ? projects.length
              : projects.filter((p) => p.category === category.slug).length;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setFilter(category.slug)}
              aria-pressed={active}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-xs border px-3.5 py-2 text-sm transition-colors duration-200",
                active
                  ? "border-accent text-fg"
                  : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="project-filter-active"
                  className="absolute inset-0 -z-10 rounded-xs bg-accent/10"
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
              {category.label}
              <span className="font-mono text-[0.6875rem] text-fg-subtle">
                {String(count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {filter === "all" ? "" : ` in ${filter}`}.
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title="No projects in this category yet"
          description="This filter is wired up and ready — the case study lands here as soon as it is published."
        />
      ) : (
        <motion.ul
          layout
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {visible.map((project) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectCard project={project} headingLevel={headingLevel} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}