import type { Metadata } from "next";
import Link from "next/link";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { Skills } from "@/components/skills";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading, Tag } from "@/components/ui/section";
import { getSkillCategories } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Skills",
  description: `The tools and disciplines behind ${siteConfig.name}'s work — Adobe and Figma for design, React and Next.js for the frontend, Node.js and PostgreSQL for the backend.`,
  alternates: { canonical: "/skills" },
};

export default async function SkillsPage() {
  const skillCategories = await getSkillCategories();
  const allSkills = Array.from(
    new Set(skillCategories.flatMap((category) => category.skills)),
  );
  const totalSkillCount = allSkills.length;

  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title={
          <>
            The Toolbox,
            <br />
            <span className="font-accent">Grouped Honestly.</span>
          </>
        }
        description="Skills are listed by discipline rather than scored out of ten. A percentage would be an invented number — what matters is which tool fits which part of the job, and that is what this page describes."
        aside={
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/projects">See them applied</Link>
          </Button>
        }
        meta={[
          { label: "Categories", value: String(skillCategories.length) },
          { label: "Technologies", value: `${totalSkillCount}+` },
          { label: "Design tools", value: "5" },
          { label: "Stack", value: "Modern JS" },
        ]}
      />

      <Skills />

      <Section>
        <SectionHeading
          eyebrow="Complete List"
          title="Everything In The Toolkit"
          description="The full set, flattened. Duplicates appear once — Figma sits in both design and tools because it genuinely is used for both."
        />

        <Reveal className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {allSkills
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((skill) => (
                <li key={skill}>
                  <Tag className="px-3 py-1.5 text-xs">{skill}</Tag>
                </li>
              ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="mt-16">
          <div className="border-l-2 border-accent bg-surface-hover px-6 py-5">
            <p className="text-sm leading-relaxed text-fg-muted">
              <span className="font-medium text-fg">
                Where the depth is:
              </span>{" "}
              identity and interface design in Adobe Illustrator, Photoshop and
              Figma; production frontends in React, Next.js and Tailwind CSS;
              and the server side with Node.js, REST APIs and PostgreSQL via
              Supabase. New tools get added here as they are actually used.
            </p>
          </div>
        </Reveal>
      </Section>

      <ContactCta />
    </>
  );
}