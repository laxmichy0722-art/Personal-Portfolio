import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getFeaturedProjects } from "@/lib/content/portfolio";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectCard } from "@/components/projects/project-card";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * Featured work on the home page.
 *
 * Shows a deliberately small selection; the full index lives at `/projects`.
 */
export async function FeaturedProjects({ limit = 3 }: { limit?: number }) {
  const projects = await getFeaturedProjects(limit);

  return (
    <Section id="work">
      <SectionHeading
        eyebrow="Selected Work"
        title="Featured Projects"
        description="A cross-section of the practice — brand systems, product UI and database-backed applications."
        aside={
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/projects">
              All {`projects`}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <RevealGroup
        as="ul"
        stagger={0.09}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8"
      >
        {projects.map((project, index) => (
          <RevealItem
            key={project.slug}
            as="li"
            className={
              index === 0
                ? "sm:col-span-2"
                : undefined
            }
          >
            <ProjectCard project={project} priority={index === 0} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}