import { headlineStats } from "@/data/stats";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * Professional statistics — 5+ years, 50+ projects, 30+ clients.
 *
 * Values come from `headlineStats` in `src/data/stats.ts` so all three are
 * editable in one place. Three figures, so the band is a 3-up grid rather than
 * the previous 4-up.
 */
export function HeroStats() {
  return (
    <RevealGroup
      as="dl"
      stagger={0.07}
      className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:mt-28"
    >
      {headlineStats.map((stat) => (
        <RevealItem key={stat.id} className="bg-bg-elevated p-6 sm:p-8">
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block font-display text-4xl leading-none text-fg sm:text-5xl">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </span>
            <span
              aria-hidden="true"
              className="mt-3 block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fg-muted"
            >
              {stat.label}
            </span>
          </dd>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}