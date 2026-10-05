import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MetaRow, Section, SectionHeading, Tag } from "@/components/ui/section";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getProjects,
} from "@/lib/content/portfolio";
import { absoluteUrl } from "@/data/site";

type Params = { slug: string };

/**
 * Pre-renders every published case study.
 *
 * Falls back to the static list when Supabase is not configured, so a project
 * deployed without a database still generates its detail pages at build time
 * instead of 404-ing.
 */
export async function generateStaticParams() {
  const all = await getProjects();
  return all.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: absoluteUrl(`/projects/${project.slug}`),
      images: [{ url: project.image, alt: project.imageAlt }],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const { previous, next } = await getAdjacentProjects(project.slug);

  return (
    <>
      <PageHeader
        eyebrow={`${project.categoryLabel} · ${project.index}`}
        title={project.title}
        description={project.summary}
        aside={
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 py-1 text-sm text-fg-muted transition-colors hover:text-accent"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All projects
          </Link>
        }
        meta={project.results.map((result) => ({
          label: result.label,
          value: result.value,
        }))}
      />

      {/* Cover */}
      <Section bordered={false} className="pt-0 sm:pt-0 lg:pt-0">
        <Reveal>
          <figure className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
            <Image
              src={project.image}
              alt={project.imageAlt}
              width={1440}
              height={900}
              priority
              className="w-full"
            />
          </figure>
        </Reveal>
      </Section>

      {/* Facts */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-h3 text-fg">The Brief</h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-fg-muted">
              {project.overview.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-14 text-h3 text-fg">The Problem</h2>
            <p className="mt-5 text-base leading-relaxed text-fg-muted">
              {project.problem}
            </p>

            <h2 className="mt-14 text-h3 text-fg">The Approach</h2>
            <p className="mt-5 text-base leading-relaxed text-fg-muted">
              {project.solution}
            </p>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="rounded-lg border border-border bg-bg-elevated px-6 py-2">
              <MetaRow label="Client" value={project.client} />
              <MetaRow label="Year" value={project.year} />
              <MetaRow label="Role" value={project.role} />
              <MetaRow
                label="Status"
                value={
                  project.status === "live" ? "Live" : "Concept project"
                }
              />
              <MetaRow label="Category" value={project.categoryLabel} />
            </dl>

            <div className="mt-8">
              <p className="eyebrow">Built With</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.map((technology) => (
                  <li key={technology}>
                    <Tag>{technology}</Tag>
                  </li>
                ))}
              </ul>
            </div>

            {project.links.length > 0 ? (
              <div className="mt-8 flex flex-col gap-2">
                {project.links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="outline"
                    className="rounded-xs"
                  >
                    <a href={link.href}>
                      {link.label}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-8 border-l-2 border-border pl-4 text-xs leading-relaxed text-fg-subtle">
                No public link for this project. Independent work without a
                live deployment is described in full here instead of linking to
                something that does not exist.
              </p>
            )}
          </aside>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionHeading
          eyebrow="How It Was Made"
          title="Design Then Build"
          description="Design decisions and engineering decisions, kept separate because they are genuinely different problems — and the interface only works when both are answered."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-2">
          <Reveal className="bg-bg-elevated p-7 sm:p-9">
            <h3 className="eyebrow">Design Process</h3>
            <ol className="mt-6 space-y-5">
              {project.designProcess.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="font-mono text-xs text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-fg-muted">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.08} className="bg-bg-elevated p-7 sm:p-9">
            <h3 className="eyebrow">Development Process</h3>
            <ol className="mt-6 space-y-5">
              {project.developmentProcess.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="font-mono text-xs text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-fg-muted">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Section>

      {/* Features */}
      <Section>
        <SectionHeading eyebrow="Scope" title="What Was Built" />

        <Reveal className="mt-12">
          <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {project.features.map((feature) => (
              <li
                key={feature}
                className="bg-bg-elevated px-5 py-4 text-sm text-fg-muted"
              >
                {feature}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* Screens */}
      {project.screenshots.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="Screens"
            title="Selected Screens"
            description="Layouts and states produced during the project. These are design renders rather than deployment screenshots — the project is not publicly hosted."
          />

          <div className="mt-14 space-y-10">
            {project.screenshots.map((shot, index) => (
              <Reveal key={shot.src} delay={index * 0.06}>
                <figure>
                  <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1440}
                      height={900}
                      className="w-full"
                    />
                  </div>
                  <figcaption className="mt-4 flex items-center gap-3 text-sm text-fg-subtle">
                    <span aria-hidden="true" className="h-px w-6 bg-border-strong" />
                    {shot.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Prev / next */}
      <Section className="border-t border-border">
        <nav aria-label="More projects" className="grid gap-px sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/projects/${previous.slug}`}
              className="group flex flex-col gap-2 py-2 pr-6 transition-colors"
            >
              <span className="eyebrow flex items-center gap-2">
                <ArrowLeft
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:-translate-x-1"
                />
                Previous
              </span>
              <span className="text-lg text-fg transition-colors group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group flex flex-col gap-2 py-2 text-right sm:items-end"
            >
              <span className="eyebrow flex items-center gap-2">
                Next
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                />
              </span>
              <span className="text-lg text-fg transition-colors group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      </Section>

      <ContactCta />
    </>
  );
}