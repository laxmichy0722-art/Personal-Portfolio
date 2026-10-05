import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getServices } from "@/lib/content/portfolio";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * Service cards. Each card expands on hover to reveal the deliverables list, so
 * the grid stays scannable at rest while still carrying the full detail.
 *
 * Grid note: the hairline effect is built with `gap-px` over a `bg-border`
 * container, so every row must be completely full or the empty cell shows as a
 * grey block. Eight cards in three columns would leave one visible gap, hence
 * the 2-up / 4-up layout instead of the 3-column grid in the brief.
 */
export async function Services() {
  const services = await getServices();

  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="What I Do"
        description="Eight practices, one workflow. Most engagements combine a couple of them — a brand identity usually arrives with the site that carries it."
        aside={
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/services">
              All services
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <RevealGroup
        as="ul"
        stagger={0.08}
        className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
      >
        {services.map((service) => (
          <RevealItem key={service.slug} as="li" className="group relative bg-bg-elevated">
            <article className="flex h-full flex-col p-7 transition-colors duration-300 group-hover:bg-surface-hover sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <span className="font-mono text-xs tracking-[0.14em] text-fg-subtle">
                  SERVICE {service.index}
                </span>
                <ServiceIcon
                  name={service.icon}
                  className="size-6 text-fg-subtle transition-colors duration-300 group-hover:text-accent"
                />
              </div>

              <h3 className="mt-6 text-h3 text-fg">{service.title}</h3>
              <p className="mt-2 text-sm text-accent">{service.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed text-fg-muted">
                {service.description}
              </p>

              <ul className="mt-7 flex flex-wrap gap-1.5 border-t border-border pt-6">
                {service.deliverables.map((deliverable) => (
                  <li
                    key={deliverable}
                    className="rounded-xs bg-surface-hover px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted"
                  >
                    {deliverable}
                  </li>
                ))}
              </ul>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}