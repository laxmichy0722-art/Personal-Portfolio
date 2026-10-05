import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { Experience } from "@/components/experience";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { getExperience } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description: `Career history and capabilities of ${siteConfig.name} — computer science training at Tribhuvan University, design practice, and independent full-stack work since 2023.`,
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const timeline = await getExperience();
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title={
          <>
            Computer Science
            <br />
            <span className="font-accent">Background, Design Practice.</span>
          </>
        }
        description="A computer science degree, then production design work, then independent practice covering both disciplines. The order matters — it is why the code follows the design intent instead of arguing with it."
        aside={
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xs">
              <Link href="/resume">
                Full Résumé
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        }
        meta={[
          { label: "Timeline entries", value: String(timeline.length) },
          { label: "Practice since", value: "2021" },
          { label: "Degree", value: "B.Sc. CS" },
          { label: "Base", value: siteConfig.location.city },
        ]}
      />

      <Experience showCapabilities={false} />

      <Section>
        <SectionHeading
          eyebrow="How I Work"
          title="Availability & Engagement"
          description="Practical details about taking on work, so the first conversation is about the project rather than about logistics."
        />

        <Reveal className="mt-12">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Availability",
                value: "Open to freelance and project work, remote or around Lalitpur.",
              },
              {
                label: "Project types",
                value:
                  "Brand identity, business websites, landing pages, dashboards and full-stack products.",
              },
              {
                label: "Typical scope",
                value:
                  "Single-page sites through to multi-section sites with an authenticated admin.",
              },
              {
                label: "Working style",
                value:
                  "Direct — one point of contact, written progress updates, no account managers.",
              },
              {
                label: "Design + build",
                value:
                  "Both handled in-house, so the build matches the design without a handoff.",
              },
              {
                label: "Timezone",
                value: "Nepal Time (UTC+5:45), flexible for overlap with other zones.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-bg-elevated p-6">
                <dt className="eyebrow">{item.label}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      <ContactCta />
    </>
  );
}