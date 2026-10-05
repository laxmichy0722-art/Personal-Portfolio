import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectGrid } from "@/components/projects/project-grid";
import { BrowserMockup } from "@/components/web-design/browser-mockup";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  getProjectsByCategory,
  getServiceBySlug,
} from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Web Design",
  description: `Responsive website design by ${siteConfig.name} — business sites, portfolios, landing pages and restaurant websites that hold up from a 320px phone to an ultrawide display.`,
  alternates: { canonical: "/web-design" },
};

const principles = [
  {
    title: "Mobile first, not mobile shrunk",
    body: "Every layout is designed at the narrowest viewport first and widened from there, so nothing relies on hiding overflow to survive on a phone.",
  },
  {
    title: "Hierarchy before decoration",
    body: "A visitor should be able to say what the page is about within a second. Type scale and spacing carry that; imagery supports it rather than carrying it alone.",
  },
  {
    title: "Documented states",
    body: "Hover, focus, loading, empty and error states are part of the design, not something discovered during the build.",
  },
  {
    title: "Real content lengths",
    body: "Designs are built with realistic copy lengths rather than lorem ipsum, because a heading that fits in the mockup often does not fit in production.",
  },
];

export default async function WebDesignPage() {
  const service = await getServiceBySlug("web-design");
  const webProjects = await getProjectsByCategory("web-design");

  return (
    <>
      <PageHeader
        eyebrow="Web Design"
        title={
          <>
            Websites That
            <br />
            <span className="font-accent">Earn Attention.</span>
          </>
        }
        description="Design for businesses that need to look credible quickly. Clear hierarchy, deliberate whitespace, and layouts that survive being resized by someone who does not care about your grid."
        aside={
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Request a website
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
        meta={[
          { label: "Layouts", value: "320px+" },
          { label: "Breakpoints", value: "4" },
          { label: "Design tool", value: "Figma" },
          { label: "Buildable", value: "Yes" },
        ]}
      />

      {service ? (
        <Section>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <div>
              <h2 className="text-h3 text-fg">{service.tagline}</h2>
              <p className="mt-6 text-base leading-relaxed text-fg-muted">
                {service.description}
              </p>
            </div>
            <div>
              <p className="eyebrow">Deliverables</p>
              <ul className="mt-4 space-y-2.5">
                {service.deliverables.map((deliverable) => (
                  <li
                    key={deliverable}
                    className="flex gap-2.5 text-sm text-fg-muted"
                  >
                    <span aria-hidden="true" className="text-accent">
                      ·
                    </span>
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Mockups */}
      <Section>
        <SectionHeading
          eyebrow="Mockups"
          title="Website Designs"
          description="Two pages from an agricultural business site — homepage and services — showing the lead section and the card system that holds three or six services without a relayout."
        />

        <div className="mt-14 space-y-12">
          <Reveal>
            <BrowserMockup
              src="/images/projects/cg-agro-home.svg"
              alt="CG Agro Farm homepage with a photographic hero and service cards"
              url="cgagrofarm.com"
              caption="Homepage — lead with capability, not company history"
              priority
            />
          </Reveal>

          <Reveal delay={0.08}>
            <BrowserMockup
              src="/images/projects/cg-agro-services.svg"
              alt="Services page grouped by buyer intent"
              url="cgagrofarm.com/services"
              caption="Services grouped by buyer intent rather than internal department"
            />
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-10">
          <p className="border-l-2 border-border pl-4 text-xs leading-relaxed text-fg-subtle">
            These are design renders produced in Figma, not live deployments. The
            address shown in the frame is illustrative — no site is hosted at that
            address.
          </p>
        </Reveal>
      </Section>

      {/* Principles */}
      <Section>
        <SectionHeading
          eyebrow="Approach"
          title="Four Rules I Design By"
          description="These are the constraints that decide a layout before any visual styling happens."
        />

        <RevealGroup
          as="ol"
          stagger={0.08}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2"
        >
          {principles.map((principle, index) => (
            <RevealItem key={principle.title} as="li" className="bg-bg-elevated p-7 sm:p-9">
              <span className="font-mono text-xs text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-lg text-fg">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {principle.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Related case studies */}
      {webProjects.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="Case Study"
            title="The Full Brief"
            description="The design decisions behind this project, including the buyer research and the responsive system."
          />
          <div className="mt-14">
            <ProjectGrid projects={webProjects} initialFilter="web-design" />
          </div>
        </Section>
      ) : null}

      <ContactCta />
    </>
  );
}