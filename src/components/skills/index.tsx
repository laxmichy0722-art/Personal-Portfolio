import { getSkillCategories } from "@/lib/content/portfolio";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";

/**
 * Grouped skill listing — DESIGN / FRONTEND / BACKEND / DATABASE / TOOLS.
 *
 * Deliberately no percentage bars: a "95% Figma" bar implies a measurable
 * standard that does not exist, and a designer who cannot say exactly how much
 * Photoshop they use is normal. Skills are grouped by discipline and presented as
 * tags, with the category description carrying the seniority signal instead —
 * something that can be defended in a conversation.
 *
 * Grid note: five categories plus the closing panel is six cells, laid out
 * 2-up, so the grid fills exactly. The hairline effect uses `gap-px` over a
 * `bg-border` container, which means a partial final row would render its empty
 * cell as a grey block — so the count matters here.
 */
export async function Skills() {
  const skillCategories = await getSkillCategories();

  // Derived here rather than imported so the count always reflects whatever the
  // loader returned, whether that was the database or the static fallback.
  const totalSkillCount = new Set(
    skillCategories.flatMap((category) => category.skills),
  ).size;

  return (
    <Section id="skills">
      <SectionHeading
        eyebrow="Skills"
        title="Design, Build &amp; Ship"
        description={`${totalSkillCount} tools across design, frontend, backend, databases and the toolchain — grouped by what they are actually used for.`}
      />

      <RevealGroup
        as="ul"
        stagger={0.06}
        className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3"
      >
        {skillCategories.map((category) => (
          <RevealItem
            key={category.slug}
            as="li"
            className="group bg-bg-elevated p-7 transition-colors duration-300 hover:bg-surface-hover sm:p-8"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-h3 text-fg">{category.label}</h3>
              <span className="font-mono text-[0.6875rem] text-fg-subtle">
                {String(category.skills.length).padStart(2, "0")}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {category.description}
            </p>

            <ul className="mt-6 flex flex-wrap gap-1.5">
              {category.skills.map((skill) => (
                <li key={skill}>
                  <span className="inline-flex items-center rounded-xs border border-border bg-surface-hover px-2.5 py-1 text-xs text-fg-muted transition-colors duration-200 group-hover:border-border-strong group-hover:text-fg">
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}

        <RevealItem
          as="li"
          className="flex flex-col justify-center bg-fg p-7 text-bg sm:p-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-bg/70">
            Also comfortable with
          </p>
          <p className="mt-4 text-lg leading-snug text-bg">
            Accessibility audits, print prepress, SEO and performance work,
            serverless deployment.
          </p>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}