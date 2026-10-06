import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PrintResume } from "@/components/resume/print-resume";
import { Section, Tag } from "@/components/ui/section";
import { capabilities } from "@/data/experience";
import { getExperience, getSkillCategories } from "@/lib/content/portfolio";
import { siteConfig, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${siteConfig.name} — ${siteConfig.role} in ${siteConfig.location.full}. Experience, capabilities and technical skills. Printable as a PDF.`,
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const [experience, skillCategories] = await Promise.all([
    getExperience(),
    getSkillCategories(),
  ]);
  const allSkills = Array.from(
    new Set(skillCategories.flatMap((category) => category.skills)),
  );

  return (
    <>
      <PageHeader
        eyebrow="Résumé"
        title={
          <>
            Experience &amp;
            <br />
            <span className="font-accent">Capabilities.</span>
          </>
        }
        description={`${siteConfig.role} based in ${siteConfig.location.full}. The full record below — use “Save as PDF” to download a copy, or the print dialog's destination control to file it directly.`}
        aside={
          <div className="flex flex-wrap gap-3">
            <PrintResume />
            <Link
              href="/contact"
              className="inline-flex h-9 items-center gap-2 rounded-xs border border-border px-4 text-sm text-fg transition-colors hover:bg-surface-hover print:hidden"
            >
              Get in touch
            </Link>
          </div>
        }
      />

      {/* Contact block — first thing on any printed page */}
      <Section bordered={false} className="pt-0 sm:pt-0 lg:pt-0">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
            {
              label: "Phone",
              value: siteConfig.phone,
              href: `tel:${siteConfig.phoneHref}`,
            },
            { label: "Location", value: siteConfig.location.full },
            { label: "Availability", value: siteConfig.availability.short },
          ].map((item) => (
            <div key={item.label}>
              <p className="eyebrow">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-2 block break-words py-1 text-sm text-fg underline-offset-4 hover:text-accent hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 text-sm text-fg">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6">
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 font-mono text-xs text-fg-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {social.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* Summary */}
      <Section>
        <h2 className="text-h3 text-fg">Summary</h2>
        <div className="mt-6 max-w-3xl space-y-5 text-base leading-relaxed text-fg-muted">
          <p>
            {siteConfig.name} is a {siteConfig.role.toLowerCase()} working from{" "}
            {siteConfig.location.full}. The practice covers both halves of a
            digital project: brand identity and interface design in the Adobe
            and Figma toolset, and production frontends and backends built with
            React, Next.js, Node.js and PostgreSQL.
          </p>
          <p>
            The computer science degree is what makes the engineering side
            genuine rather than incidental — the same person who draws the
            interface also models the database, writes the API and ships it. That
            means no handoff gap, and no phase of a project where the design
            quietly stops being what was approved.
          </p>
        </div>

        <div className="mt-12">
          <h3 className="eyebrow">Core Capabilities</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <li key={capability}>
                <Tag className="px-3 py-1.5 text-xs">{capability}</Tag>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Experience */}
      <Section>
        <h2 className="text-h3 text-fg">Experience</h2>

        <ol className="mt-12 space-y-px overflow-hidden rounded-lg border border-border bg-border">
          {experience.map((entry) => (
            <li key={`${entry.company}-${entry.startYear}`} className="bg-bg-elevated p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div>
                  <h3 className="text-lg text-fg">{entry.role}</h3>
                  <p className="mt-1 text-sm text-accent">{entry.company}</p>
                </div>
                <p className="font-mono text-xs text-fg-subtle sm:shrink-0">
                  {entry.period}
                  {entry.location ? ` · ${entry.location}` : ""}
                </p>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-fg-muted">
                {entry.summary}
              </p>

              {entry.responsibilities.length > 0 ? (
                <ul className="mt-6 space-y-2.5">
                  {entry.responsibilities.map((responsibility) => (
                    <li
                      key={responsibility}
                      className="flex gap-3 text-sm leading-relaxed text-fg-muted"
                    >
                      <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-accent" />
                      {responsibility}
                    </li>
                  ))}
                </ul>
              ) : null}

              {entry.technologies.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-border pt-5">
                  {entry.technologies.map((technology) => (
                    <li key={technology}>
                      <Tag>{technology}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      {/* Skills */}
      <Section>
        <h2 className="text-h3 text-fg">Technical Skills</h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category) => (
            <div key={category.slug} className="bg-bg-elevated p-6">
              <h3 className="eyebrow">{category.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
                {category.description}
              </p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {category.skills.map((skill) => (
                  <li key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 font-mono text-xs text-fg-subtle">
          {allSkills.length} technologies across {skillCategories.length}{" "}
          disciplines.
        </p>
      </Section>

      <Section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-muted">
            References available on request. Full case studies are on the{" "}
            <Link href="/projects" className="py-1 text-fg underline underline-offset-4 hover:text-accent">
              projects page
            </Link>
            .
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 py-1 text-sm text-fg underline-offset-4 transition-colors hover:text-accent hover:underline print:hidden"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rotate-180" />
            View projects
          </Link>
        </div>
      </Section>
    </>
  );
}