import { processSteps } from "@/data/process";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * The six-stage workflow.
 *
 * Rendered as a numbered vertical spine on mobile and a connected grid on wide
 * screens, so the sequence stays legible at every breakpoint.
 */
export function Process() {
  return (
    <Section id="process">
      <SectionHeading
        eyebrow="Process"
        title="How Work Gets Done"
        description="A predictable sequence from first conversation to shipped product. Clients always know which stage a project is in."
      />

      <RevealGroup
        as="ol"
        stagger={0.07}
        className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
      >
        {processSteps.map((step) => (
          <RevealItem
            key={step.index}
            as="li"
            className="group relative bg-bg-elevated p-7 transition-colors duration-300 hover:bg-surface-hover sm:p-8"
          >
            <span
              aria-hidden="true"
              className="font-display text-5xl leading-none text-fg-subtle transition-colors duration-300 group-hover:text-accent"
            >
              {step.index}
            </span>

            <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {step.description}
            </p>

            <ul className="mt-5 space-y-1.5 border-t border-border pt-5">
              {step.outputs.map((output) => (
                <li
                  key={output}
                  className="flex items-center gap-2 font-mono text-[0.6875rem] text-fg-subtle"
                >
                  <span
                    aria-hidden="true"
                    className="size-1 shrink-0 rounded-full bg-accent"
                  />
                  {output}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}