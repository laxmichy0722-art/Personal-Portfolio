import type { Metadata } from "next";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectGrid } from "@/components/projects/project-grid";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { projectCategories } from "@/data/projects";
import { getProjects } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected work by ${siteConfig.name} — brand identity, graphic design, responsive websites, UI/UX design systems and full-stack applications built with Next.js and Supabase.`,
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const categories = projectCategories.filter((c) => c.slug !== "all");

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title={
          <>
            Selected Work,
            <br />
            <span className="font-accent">Start To Finish.</span>
          </>
        }
        description="Case studies covering the brief, the design decisions and the build. Each one is labelled honestly: these are self-initiated projects where the work is real but no client relationship is being claimed."
        meta={[
          { label: "Case studies", value: String(projects.length) },
          { label: "Categories", value: String(categories.length) },
          { label: "Live URLs", value: "None yet" },
          { label: "Concept projects", value: "All" },
        ]}
      />

      <Section>
        <ProjectGrid projects={projects} headingLevel="h2" />

        {/*
          Honest disclosure, kept visible rather than buried. Without it the
          portfolio implies client work that did not happen.
        */}
        <Reveal className="mt-16">
          <div className="border-l-2 border-accent bg-surface-hover px-6 py-5">
            <h2 className="text-sm font-medium text-fg">
              A note on these projects
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Each case study is an independent project — designed and built from
              scratch, and published as a demonstration of process rather than as
              client work. No client names, budgets or performance metrics are
              claimed anywhere in this portfolio. Real engagements replace these
              entries as they are completed.
            </p>
          </div>
        </Reveal>
      </Section>

      <ContactCta />
    </>
  );
}