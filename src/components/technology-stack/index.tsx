import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

/**
 * Technology stack marquee.
 *
 * A horizontal strip of the tools actually used, duplicated once so the CSS
 * translate loop is seamless. This is the brief's requested tech section: the
 * skills grid above is organised by discipline and says what each category is
 * for, whereas this is a fast "does this person work with my stack" scan.
 *
 * The duplicated half is `aria-hidden` so a screen reader hears each technology
 * once rather than twice, and the whole strip is hidden from assistive tech
 * entirely because the same tools are already listed as text on /skills.
 */
const GROUPS = [
  {
    label: "Frontend",
    tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML", "CSS"],
  },
  {
    label: "Backend",
    tools: ["Node.js", "Express.js", "REST API"],
  },
  {
    label: "Database",
    tools: ["MongoDB", "PostgreSQL", "MySQL", "Supabase", "Firebase"],
  },
  {
    label: "Tools",
    tools: ["Git", "GitHub", "Figma", "VS Code", "Vercel", "Docker", "Postman"],
  },
];

function Row({ groups }: { groups: typeof GROUPS }) {
  return (
    <div className="flex shrink-0 items-center">
      {groups.map((group) => (
        <div key={group.label} className="flex items-center">
          <span className="px-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle sm:px-8">
            {group.label}
          </span>
          {group.tools.map((tool) => (
            <span
              key={tool}
              className="whitespace-nowrap px-5 text-sm font-medium text-fg-muted"
            >
              {tool}
            </span>
          ))}
          <span aria-hidden="true" className="text-accent">
            /
          </span>
        </div>
      ))}
    </div>
  );
}

export function TechnologyStack() {
  return (
    <Section id="stack">
      <SectionHeading
        eyebrow="Tech Stack"
        title="The Tools Behind The Work"
        description="The same stack whether the job is a brand guideline or a database-backed application."
      />

      <Reveal className="mt-12">
        {/*
          Edge-to-edge strip. The mask fades both ends so items enter and leave
          rather than being clipped at a hard edge, and `motion-reduce` pins it
          static — a scrolling marquee is exactly the movement that setting
          exists to suppress.
        */}
        <div className="relative overflow-hidden border-y border-border bg-bg-elevated py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] motion-reduce:[mask-image:none]">
          <div className="flex w-max animate-marquee motion-reduce:w-full motion-reduce:justify-center motion-reduce:flex-wrap motion-reduce:gap-x-5">
            <Row groups={GROUPS} />
            <div aria-hidden="true" className="motion-reduce:hidden">
              <Row groups={GROUPS} />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}