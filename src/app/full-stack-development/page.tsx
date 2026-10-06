import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectGrid } from "@/components/projects/project-grid";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading, Tag } from "@/components/ui/section";
import {
  getProjectsByCategory,
  getServiceBySlug,
} from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Full-Stack Development",
  description: `Full-stack development with Next.js, React, TypeScript, Node.js, PostgreSQL and Supabase by ${siteConfig.name} â€” schemas, typed APIs, authentication and admin dashboards, designed and built by the same person.`,
  alternates: { canonical: "/full-stack-development" },
};

/** Request path through the stack, top to bottom. */
const layers = [
  {
    step: "01",
    name: "Client",
    detail: "React components in the browser. Server components render the read-heavy paths; client components own interactivity.",
    tech: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    step: "02",
    name: "Framework",
    detail: "Next.js App Router with server-rendered routes, route handlers for the API, and metadata generated per page.",
    tech: ["Next.js", "React Server Components", "Metadata API"],
  },
  {
    step: "03",
    name: "Application",
    detail: "Zod validation at the boundary, server-side authorisation on every mutation, and no secret ever reaching the browser.",
    tech: ["Node.js", "Zod", "Server Actions"],
  },
  {
    step: "04",
    name: "Data",
    detail: "PostgreSQL with real foreign keys and row-level security. Aggregates computed in the database, not in JavaScript.",
    tech: ["Supabase", "PostgreSQL", "RLS"],
  },
];

const capabilities = [
  {
    title: "Database design",
    body: "Relational modelling with proper keys and constraints, so the data stays correct when the code around it changes.",
  },
  {
    title: "Typed APIs",
    body: "Route handlers with a shared validation schema per endpoint â€” the same schema runs on the client and the server.",
  },
  {
    title: "Authentication",
    body: "Supabase Auth with row-level security, so authorisation is enforced by the database rather than by UI state.",
  },
  {
    title: "Admin dashboards",
    body: "Authenticated surfaces for editing real content, with status handling and confirmations rather than happy-path-only flows.",
  },
  {
    title: "Deployment",
    body: "Vercel builds with environment separation, so preview deployments cannot touch production data.",
  },
  {
    title: "Performance",
    body: "Server rendering by default, image optimisation, and metadata generated per route rather than hardcoded.",
  },
];

export default async function FullStackPage() {
  const service = await getServiceBySlug("full-stack-development");
  const stackProjects = await getProjectsByCategory("full-stack");

  return (
    <>
      <PageHeader
        eyebrow="Full-Stack Development"
        title={
          <>
            Designed And
            <br />
            <span className="font-accent">Actually Shipped.</span>
          </>
        }
        description="Most portfolios show the design and leave the engineering to someone else. This side shows the other half â€” schemas, APIs, authentication and admin surfaces, built by the same person who drew the interface."
        aside={
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 py-1 text-sm text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Discuss a build
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
        meta={[
          { label: "Framework", value: "Next.js" },
          { label: "Language", value: "TypeScript" },
          { label: "Database", value: "PostgreSQL" },
          { label: "Auth", value: "Supabase" },
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
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable}>
                    <Tag>{deliverable}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Architecture */}
      <Section>
        <SectionHeading
          eyebrow="Architecture"
          title="How A Request Moves Through The Stack"
          description="Four layers, each with one job. Every project follows the same shape because the shape is what makes the code predictable."
        />

        <RevealGroup
          as="ol"
          stagger={0.09}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
        >
          {layers.map((layer) => (
            <RevealItem key={layer.name} as="li" className="bg-bg-elevated p-7">
              <span className="font-mono text-xs text-accent">{layer.step}</span>
              <h3 className="mt-5 text-lg text-fg">{layer.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {layer.detail}
              </p>
              <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-border pt-5">
                {layer.tech.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Capabilities */}
      <Section>
        <SectionHeading
          eyebrow="Capabilities"
          title="What Gets Built"
          description="The engineering work behind a portfolio site, described in terms of what it protects rather than what it uses."
        />

        <RevealGroup
          as="dl"
          stagger={0.06}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {capabilities.map((capability) => (
            <RevealItem key={capability.title} className="bg-bg-elevated p-7">
              <dt className="text-sm font-medium text-fg">
                {capability.title}
              </dt>
              <dd className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                {capability.body}
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Projects */}
      {stackProjects.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="Case Studies"
            title="Built, Not Just Designed"
            description="Database-backed applications with authentication, admin surfaces and analytics. Screens are design renders â€” the projects are not publicly hosted."
          />
          <div className="mt-14">
            <ProjectGrid
              projects={stackProjects}
              initialFilter="full-stack"
            />
          </div>
        </Section>
      ) : null}

      <ContactCta />
    </>
  );
}