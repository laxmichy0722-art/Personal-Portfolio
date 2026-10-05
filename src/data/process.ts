import type { ProcessStep, Testimonial } from "@/types/content";

/**
 * The six-stage workflow used on both the home page and the services page.
 *
 * Titles follow the brief exactly: Discover, Research, Design, Develop, Test,
 * Launch.
 *
 * Step 02 was "Plan" in an earlier revision. Research is the stronger position
 * here: it describes evidence-gathering (user research, competitor analysis,
 * audits) rather than internal scheduling, which is the part clients actually
 * want to see done before a single pixel moves.
 */
export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Discover",
    description:
      "Understand the business, the users and the goal before anything is drawn.",
    outputs: ["Project brief", "Requirements", "Success criteria"],
  },
  {
    index: "02",
    title: "Research",
    description:
      "Study the users, the competition and the existing platform — analytics, interviews and audits that establish what to build and what to avoid.",
    outputs: ["User research", "Competitor analysis", "Platform audit"],
  },
  {
    index: "03",
    title: "Design",
    description:
      "Create wireframes, visual systems and interface designs, validated before build.",
    outputs: ["Wireframes", "Visual system", "UI designs"],
  },
  {
    index: "04",
    title: "Develop",
    description:
      "Build responsive, scalable and accessible applications with typed code.",
    outputs: ["Production code", "Database schema", "APIs"],
  },
  {
    index: "05",
    title: "Test",
    description:
      "Test performance, usability and responsiveness across real devices and connections.",
    outputs: ["QA passes", "Performance report", "Accessibility audit"],
  },
  {
    index: "06",
    title: "Launch",
    description:
      "Deploy, optimise and maintain the product, then keep iterating on real feedback.",
    outputs: ["Deployment", "Monitoring", "Maintenance"],
  },
];

/**
 * Client testimonials.
 *
 * ── THESE ARE SAMPLES, NOT REAL QUOTES ────────────────────────────────────────
 * The brief specifies a testimonials section but supplies no real client
 * feedback, so the three entries below are written as *illustrations of the
 * format* — representative of the kind of project the quote would describe, not
 * a claim that a real person said it.
 *
 * Every one carries `isPlaceholder: true`, and `Testimonials` renders a visible
 * "Sample testimonial" badge on any card whose flag is set. That label is not
 * decoration: an invented endorsement presented as real is the one thing on a
 * portfolio that damages trust in everything else on the page.
 *
 * `getPublishedTestimonials()` returns these so the section is reviewable, and
 * the admin dashboard can replace them with real, client-approved quotes — at
 * which point the badge disappears automatically because the flag flips.
 */
export const testimonials: Testimonial[] = [
  {
    id: "sample-1",
    quote:
      "Sample testimonial — replace with a real client quote. Keep this structure: what the problem was, what was delivered, and the outcome the client could measure.",
    name: "Client Name",
    role: "Role, e.g. Founder",
    company: "Company Name",
    isPlaceholder: true,
  },
  {
    id: "sample-2",
    quote:
      "Sample testimonial — replace with a real client quote. Specific detail reads as credible; general praise does not.",
    name: "Client Name",
    role: "Role, e.g. Restaurant Owner",
    company: "Company Name",
    isPlaceholder: true,
  },
  {
    id: "sample-3",
    quote:
      "Sample testimonial — replace with a real client quote. Add this through the admin dashboard once a client approves the wording.",
    name: "Client Name",
    role: "Role, e.g. Operations Manager",
    company: "Company Name",
    isPlaceholder: true,
  },
];

/**
 * Quotes eligible for display.
 *
 * This returns the samples too — the brief asks for the section to exist and be
 * reviewable, and each card is labelled. Nothing here is presented as a real
 * endorsement.
 */
export function getPublishedTestimonials() {
  return testimonials;
}