import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { siteConfig, socialLinks } from "@/data/site";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * Closing call to action.
 *
 * Reused at the bottom of every non-contact page so the path to an enquiry is
 * always one click away.
 */
export function ContactCta() {
  return (
    <section
      data-slot="contact-cta"
      className="relative overflow-hidden border-t border-border bg-bg-elevated py-20 sm:py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <Reveal className="container-page relative text-center">
        <p className="eyebrow">Let&apos;s Work Together</p>

        <h2 className="mx-auto mt-6 max-w-3xl text-display-sm text-fg">
          Let&apos;s Build Something Great Together
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
          Have a project, business idea, or digital product in mind? Let&apos;s
          turn your idea into reality.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xs">
            <Link href="/contact">
              Send Message
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xs">
            <a href={`mailto:${siteConfig.email}`}>
              <Mail aria-hidden="true" />
              {siteConfig.email}
            </a>
          </Button>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-fg-muted">
          <li>
            <a
              href={`tel:${siteConfig.phoneHref}`}
              className="inline-flex items-center gap-2 py-1 transition-colors hover:text-accent"
            >
              <Phone aria-hidden="true" className="size-3.5" />
              {siteConfig.phone}
            </a>
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-3.5" />
            {siteConfig.location.full}
          </li>
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-1 transition-colors hover:text-accent"
              >
                <BrandIcon name={social.icon} size={14} />
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}