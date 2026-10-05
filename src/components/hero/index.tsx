import { ArrowRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/button";
import { ProfilePhoto } from "@/components/hero/profile-photo";
import { HeroStats } from "@/components/hero/hero-stats";

/**
 * Above-the-fold introduction.
 *
 * Copy follows the brief exactly:
 *   eyebrow    → "HELLO, I'M"
 *   h1         → "Designing Ideas. Building Digital Experiences."
 *   role       → "Graphic Designer & Full-Stack Developer"
 *   lede       → the positioning paragraph
 *   actions    → "Hire Me" (primary) + "View Portfolio" + "Download CV"
 *   availability + 5+ / 50+ / 30+ statistics
 *
 * The headline is the h1 and the name is carried by the eyebrow line's
 * follow-up and the portrait's alt text, so the page's most important string is
 * the promise rather than the name — which is the agency-style structure the
 * brief describes.
 *
 * Layout: two columns on desktop and tablet, stacked and centred on mobile. Kept
 * as a Server Component so the only JavaScript here is the stats counter and the
 * reveal wrapper further down.
 */
export function Hero() {
  return (
    <section
      data-slot="hero"
      className="relative flex min-h-[calc(100svh-var(--spacing-header))] items-center overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24"
    >
      {/* Hairline grid, faded out before it reaches the text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
      />
      {/* Single warm accent bloom — the only gradient in the hero backdrop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[38rem] rounded-full bg-accent/[0.07] blur-[140px]"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
          {/* Copy — centred on mobile, left-aligned from `sm` up. */}
          <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:text-left">
            {/* Block-level so the stack below is spaced by these margins alone.
                As inline-level boxes they picked up half-leading from the
                inherited line-height, so the real gap drifted from `mt-8`. */}
            <p className="mx-auto flex w-fit items-center gap-2.5 rounded-full border border-border bg-bg-elevated px-3.5 py-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-muted sm:mx-0 sm:text-[0.6875rem]">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 animate-pulse-dot rounded-full bg-success"
              />
              {siteConfig.availability.status}
            </p>

            <p className="eyebrow mt-8 block">
              Hello, I&apos;m {siteConfig.name}
            </p>

            <h1 className="mt-5 text-display text-fg">
              Designing Ideas.
              <br />
              <span className="font-accent text-accent">
                Building Digital Experiences.
              </span>
            </h1>

            <p className="mt-7 text-lg font-medium tracking-tight text-accent-soft sm:text-xl">
              {siteConfig.roleShort}
            </p>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:mx-0 sm:text-lg">
              I&apos;m a professional graphic designer, UI/UX designer, and
              full-stack developer who transforms ideas into powerful brands,
              intuitive digital experiences, and scalable web applications.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Button asChild size="lg" className="rounded-xs">
                <Link href="/contact">
                  Hire Me
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="rounded-xs">
                <Link href="/projects">View Portfolio</Link>
              </Button>

              <Button asChild size="lg" variant="ghost" className="rounded-xs">
                <Link href="/resume">
                  <Download aria-hidden="true" />
                  Download CV
                </Link>
              </Button>
            </div>

            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-fg-subtle sm:justify-start">
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-3.5 text-accent" />
                {siteConfig.location.full}
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-1.5 py-1 transition-colors hover:text-accent"
              >
                {siteConfig.email}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </p>
          </div>

          {/* Portrait — stacked below the copy on mobile, beside it on desktop. */}
          <div>
            <ProfilePhoto priority />
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}