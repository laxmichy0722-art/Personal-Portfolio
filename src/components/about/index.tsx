import { ArrowRight, Download, MapPin } from "lucide-react";
import Link from "next/link";

import { capabilities } from "@/data/experience";
import { siteConfig } from "@/data/site";
import { ProfilePhoto } from "@/components/hero/profile-photo";
import { Button } from "@/components/ui/button";
import { MetaRow, Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/**
 * Expertise areas, per the brief.
 *
 * "Full-Stack Development" is listed alongside front-end and back-end rather
 * than instead of them: the point of the list is that one person covers the
 * whole span, which is the claim the rest of the portfolio is making.
 */
const expertise = [
  "Graphic Design",
  "UI/UX Design",
  "Branding",
  "Frontend Development",
  "Backend Development",
  "Full-Stack Development",
];

/**
 * About section — portrait left, introduction right, per the brief.
 *
 * Split across the home page and `/about`, which shares these blocks. The
 * narrative column stays the primary content; the portrait is capped rather than
 * full-height so it never competes with the text for attention on wide screens.
 */
export function About() {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow="About Me"
        title={
          <>
            Designing With Purpose,
            <br />
            <span className="font-accent">Building With Code.</span>
          </>
        }
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        {/* Portrait — left column on desktop, above the copy on mobile. */}
        <Reveal className="mx-auto lg:mx-0 lg:sticky lg:top-28">
          <ProfilePhoto showChips={false} />

          <dl className="mt-10 border-t border-border">
            <MetaRow label="Name" value={siteConfig.name} />
            <MetaRow
              label="Location"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-3.5 text-fg-subtle" />
                  {siteConfig.location.full}
                </span>
              }
            />
            <MetaRow label="Role" value={siteConfig.roleShort} />
            <MetaRow
              label="Availability"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-success" />
                  {siteConfig.availability.engagement}
                </span>
              }
            />
            <MetaRow
              label="Focus"
              value={`${capabilities.length} capability areas`}
            />
          </dl>
        </Reveal>

        {/* Narrative */}
        <Reveal delay={0.1} className="max-w-2xl">
          <div className="space-y-6 text-base leading-relaxed text-fg-muted sm:text-lg">
            <p>
              I&apos;m {siteConfig.name}, a professional graphic designer, UI/UX
              designer and full-stack developer based in{" "}
              {siteConfig.location.full}.
            </p>
            <p>
              My work sits where visual craft meets engineering discipline. I
              design brand systems and interfaces, then build the products that
              run on them — which means the spacing, the type scale and the
              interaction model are the same decisions in the design file and in
              the shipped code, not two versions that drift apart.
            </p>
            <p>
              Most studios split design and development across two teams and two
              handovers. Working across both means a project can go from brief to
              live site without a gap in the middle, and it usually costs less,
              because nobody is billing for the translation.
            </p>
          </div>

          <p className="eyebrow mt-12">Expertise</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {expertise.map((area) => (
              <li
                key={area}
                className="rounded-xs border border-border px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-accent hover:text-fg"
              >
                {area}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="rounded-xs">
              <Link href="/contact">
                Hire Me
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/resume">
                <Download aria-hidden="true" />
                Download CV
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}