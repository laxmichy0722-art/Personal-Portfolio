import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactCta } from "@/components/contact/contact-cta";
import { Gallery } from "@/components/graphic-design/gallery";
import { PageHeader } from "@/components/layout/page-header";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading, Tag } from "@/components/ui/section";
import { galleryItems } from "@/data/gallery";
import { getServiceBySlug } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Graphic Design",
  description: `Brand identity, logos, social media design, posters, menus and packaging by ${siteConfig.name}. Print-ready artwork prepared with Adobe Illustrator, Photoshop and InDesign.`,
  alternates: { canonical: "/graphic-design" },
};

const toolGroups = [
  {
    label: "Identity & Logos",
    items: ["Construction grids", "Wordmarks & monograms", "Clear-space rules", "Full brand systems"],
  },
  {
    label: "Print",
    items: ["Posters", "Brochures", "Menus", "Business cards", "Flyers"],
  },
  {
    label: "Digital & Social",
    items: ["Social templates", "Story formats", "Feed systems", "Display banners"],
  },
  {
    label: "Packaging",
    items: ["Coffee & retail bags", "Label design", "Dieline preparation", "Print finish specs"],
  },
];

export default async function GraphicDesignPage() {
  const service = await getServiceBySlug("graphic-design");

  return (
    <>
      <PageHeader
        eyebrow="Graphic Design"
        title={
          <>
            Identity Systems,
            <br />
            <span className="font-accent">Not Just A Logo.</span>
          </>
        }
        description="Graphic design work built as rules rather than as artwork: a mark on a construction grid, colour with assigned roles, a type scale, and the applications that prove the system survives being used."
        aside={
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Commission a design
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
        meta={[
          { label: "Gallery items", value: String(galleryItems.length) },
          { label: "Disciplines", value: String(toolGroups.length) },
          { label: "Print ready", value: "Yes" },
          { label: "Tools", value: "AI · PS · ID" },
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

      <Section>
        <SectionHeading
          eyebrow="Gallery"
          title="Selected Artwork"
          description="Identity systems, social campaigns, menus and packaging. Select any piece to view it full size."
        />

        <div className="mt-14">
          <Gallery items={galleryItems} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Capabilities"
          title="What I Can Produce"
          description="Grouped by where the artwork ends up, since that is what determines the file formats and the print specs."
        />

        <RevealGroup
          as="dl"
          stagger={0.08}
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
        >
          {toolGroups.map((group) => (
            <RevealItem key={group.label} as="div" className="bg-bg-elevated p-6">
              <dt className="eyebrow">{group.label}</dt>
              <dd className="mt-5 space-y-2.5">
                {group.items.map((item) => (
                  <p key={item} className="flex gap-2.5 text-sm text-fg-muted">
                    <span aria-hidden="true" className="text-accent">
                      ·
                    </span>
                    {item}
                  </p>
                ))}
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <ContactCta />
    </>
  );
}