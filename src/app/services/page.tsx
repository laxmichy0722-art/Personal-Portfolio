import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { Process } from "@/components/process";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading, Tag } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getServices } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
  description: `Eight services from ${siteConfig.name}: graphic design, UI/UX design, branding, web design, full-stack development, e-commerce development, admin dashboards and website maintenance.`,
  alternates: { canonical: "/services" },
};

/**
 * Detail routes that exist as dedicated pages, with the rest on this page.
 * Keyed by `Service.slug`, so these must match `src/data/services.ts` exactly —
 * a mismatched key silently drops the link rather than erroring.
 */
const detailRoutes: Record<string, { href: string; label: string }> = {
  "graphic-design": { href: "/graphic-design", label: "View graphic design work" },
  "web-design": { href: "/web-design", label: "View web design work" },
  "full-stack-development": {
    href: "/full-stack-development",
    label: "View full-stack work",
  },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={
          <>
            Design And Code,
            <br />
            <span className="font-accent">From One Person.</span>
          </>
        }
        description="Most studios split design and development across two teams and two handovers. Here they sit in the same head — which is why the build rarely diverges from the design, and why a project can go from brief to live site without a gap in the middle."
        aside={
          <Button asChild className="rounded-xs">
            <Link href="/contact">Discuss a Project</Link>
          </Button>
        }
        meta={[
          { label: "Services", value: String(services.length) },
          { label: "Engagement", value: "Project-based" },
          { label: "Handoff", value: "None needed" },
          { label: "Based in", value: siteConfig.location.city },
        ]}
      />

      <Section>
        <SectionHeading
          eyebrow="What I Do"
          title="Eight Practices, One Workflow"
          description="Each service is listed with what actually gets delivered. If a project needs two of them, they run as one engagement rather than two invoices."
        />

        <RevealGroup as="ol" stagger={0.07} className="mt-14 space-y-px">
          {services.map((service) => {
            const detail = detailRoutes[service.slug];

            return (
              <RevealItem key={service.slug} as="li">
                <article className="group grid gap-8 border-t border-border py-10 lg:grid-cols-[auto_1fr_1fr] lg:gap-16">
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
                    <span className="font-mono text-xs tracking-[0.14em] text-fg-subtle">
                      {service.index}
                    </span>
                    <ServiceIcon
                      name={service.icon}
                      className="size-7 text-fg-subtle transition-colors duration-300 group-hover:text-accent"
                    />
                  </div>

                  <div>
                    <h3 className="text-h3 text-fg">{service.title}</h3>
                    <p className="mt-2 text-sm text-accent">{service.tagline}</p>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-fg-muted">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    <p className="eyebrow">Deliverables</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable}>
                          <Tag>{deliverable}</Tag>
                        </li>
                      ))}
                    </ul>

                    {detail ? (
                      <Link
                        href={detail.href}
                        className="mt-7 inline-flex items-center gap-1.5 py-1 text-sm text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
                      >
                        {detail.label}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    ) : null}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      <Process />
      <ContactCta />
    </>
  );
}