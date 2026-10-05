import { capabilities } from "@/data/experience";
import { getExperience } from "@/lib/content/portfolio";
import { Section, SectionHeading, Tag } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/** Visual treatment per timeline entry type. */
const typeStyles: Record<string, string> = {
  freelance: "text-accent",
  employment: "text-fg",
  project: "text-fg",
  internship: "text-fg",
  education: "text-fg-muted",
};

/**
 * Experience timeline.
 *
 * A single vertical rule with entries alternating sides on wide screens; on
 * narrow screens everything stacks to one side so the reading order stays
 * strictly top-to-bottom.
 */
export async function Experience({ showCapabilities = true }: { showCapabilities?: boolean }) {
  const experience = await getExperience();

  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Experience"
        title="Career Timeline"
        description="Formal computer science training, production design work, and independent practice covering both disciplines."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <ol className="relative border-l border-border pl-8 lg:pl-10">
          {experience.map((entry, index) => (
            <Reveal
              key={`${entry.company}-${entry.startYear}`}
              as="li"
              delay={index * 0.05}
              className="relative pb-12 last:pb-0"
            >
              {/* Node on the spine */}
              <span
                aria-hidden="true"
                className={`absolute -left-[calc(2rem+4.5px)] top-1.5 size-2.5 rounded-full border-2 border-bg lg:-left-[calc(2.5rem+4.5px)] ${
                  typeStyles[entry.type] === "text-accent"
                    ? "bg-accent"
                    : "bg-border-strong"
                }`}
              />

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                  {entry.period}
                </p>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                  · {entry.location}
                </p>
              </div>

              <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg sm:text-xl">
                {entry.role}
              </h3>
              <p
                className={`mt-1 text-sm font-medium ${typeStyles[entry.type] ?? "text-fg-muted"}`}
              >
                {entry.company}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
                {entry.summary}
              </p>

              <ul className="mt-5 space-y-2">
                {entry.responsibilities.map((responsibility) => (
                  <li
                    key={responsibility}
                    className="flex gap-3 text-sm leading-relaxed text-fg-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                    />
                    {responsibility}
                  </li>
                ))}
              </ul>

              {entry.achievements.length > 0 ? (
                <div className="mt-6 rounded-md border-l-2 border-accent bg-surface-hover px-5 py-4">
                  <p className="eyebrow">Selected outcomes</p>
                  <ul className="mt-3 space-y-2">
                    {entry.achievements.map((achievement) => (
                      <li
                        key={achievement}
                        className="text-sm leading-relaxed text-fg"
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <ul className="mt-6 flex flex-wrap gap-1.5">
                {entry.technologies.map((technology) => (
                  <li key={technology}>
                    <Tag>{technology}</Tag>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>

        {showCapabilities ? (
          <Reveal delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <h3 className="eyebrow">Capabilities</h3>
              <ul className="mt-6 space-y-4">
                {capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex gap-3 border-b border-border pb-4 text-sm text-fg last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-accent"
                    />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}