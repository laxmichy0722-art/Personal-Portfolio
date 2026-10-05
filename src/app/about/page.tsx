import type { Metadata } from "next";
import Link from "next/link";

import { About } from "@/components/about";
import { ContactCta } from "@/components/contact/contact-cta";
import { Experience } from "@/components/experience";
import { PageHeader } from "@/components/layout/page-header";
import { Process } from "@/components/process";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { derivedStats } from "@/data/stats";
import { siteConfig, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name}, a ${siteConfig.role.toLowerCase()} from ${siteConfig.location.full}. Design practice, engineering background and how the two combine.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Designing With Purpose,
            <br />
            <span className="font-accent">Building With Code.</span>
          </>
        }
        description={`A design practice with an engineering foundation — brand systems, product interfaces and the full-stack work that ships them, based in ${siteConfig.location.full}.`}
        aside={
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xs">
              <Link href="/contact">Start a Project</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/resume">Download Résumé</Link>
            </Button>
          </div>
        }
        meta={derivedStats.map((stat) => ({
          label: stat.label,
          value: `${stat.value}${stat.suffix}`,
        }))}
      />

      <About />
      <Process />
      <Experience />

      <Section>
        <SectionHeading
          eyebrow="Elsewhere"
          title="Find Me Online"
          description="The fastest way to reach me is email. These are the other places my work shows up."
        />

        <Reveal className="mt-12">
          <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {socialLinks.map((social) => (
              <li key={social.label} className="bg-bg-elevated">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 p-6 transition-colors hover:bg-surface-hover"
                >
                  <span>
                    <span className="block text-sm font-medium text-fg">
                      {social.label}
                    </span>
                    <span className="mt-1 block font-mono text-xs text-fg-subtle">
                      {social.handle}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-fg-subtle transition-colors group-hover:text-accent"
                  >
                    ↗
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <ContactCta />
    </>
  );
}