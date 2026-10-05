import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { BrandIcon } from "@/components/ui/brand-icon";
import { siteConfig, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${siteConfig.name}. Graphic design, UI/UX, responsive web design and full-stack development — email ${siteConfig.email} or use the enquiry form.`,
  alternates: { canonical: "/contact" },
};

const faqs = [
  {
    question: "What is the typical project timeline?",
    answer:
      "A single-page site is usually one to two weeks. A multi-section site with a CMS or admin runs three to six weeks. Brand identity work depends entirely on how many applications the system has to cover.",
  },
  {
    question: "Do you work with clients outside Nepal?",
    answer:
      "Yes. Remote work is the norm here — video calls across UK, US and Australia timezones are all workable, and all communication happens in writing so nothing is lost.",
  },
  {
    question: "Can you design and build, or only one of the two?",
    answer:
      "Both, and together is the better option. Design-only and build-only engagements are possible if you already have a designer or developer in place.",
  },
  {
    question: "What do you need from me to start?",
    answer:
      "A description of the business, what the site or design needs to achieve, any existing brand assets, and an idea of the deadline. That is enough to scope and quote.",
  },
  {
    question: "How much does a project cost?",
    answer:
      "It depends on scope. Quotes are fixed per project rather than hourly, so the price you agree to is the price you pay. Describe what you need in the message and I will come back with something realistic.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let&apos;s Build Something
            <br />
            <span className="font-accent">Great Together.</span>
          </>
        }
        description="Have a project, business idea, or digital product in mind? Let's turn your idea into reality. Tell me what you need below, or email me directly."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* Form */}
          <div>
            <h2 className="text-h3 text-fg">Send a Message</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
              Fields marked with an asterisk are required. Your details are used
              only to reply to this enquiry.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          {/* Direct details */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="eyebrow">Direct Contact</h2>

            <ul className="mt-6 space-y-px overflow-hidden rounded-lg border border-border bg-border">
              <li className="bg-bg-elevated">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-4 p-5 transition-colors hover:bg-surface-hover"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0 text-fg-subtle group-hover:text-accent" />
                  <span className="min-w-0">
                    <span className="eyebrow block">Email</span>
                    <span className="mt-1 block truncate text-sm text-fg">
                      {siteConfig.email}
                    </span>
                  </span>
                </a>
              </li>

              <li className="bg-bg-elevated">
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  className="group flex items-center gap-4 p-5 transition-colors hover:bg-surface-hover"
                >
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-fg-subtle group-hover:text-accent" />
                  <span className="min-w-0">
                    <span className="eyebrow block">Phone</span>
                    <span className="mt-1 block text-sm text-fg">
                      {siteConfig.phone}
                    </span>
                  </span>
                </a>
              </li>

              <li className="flex items-center gap-4 bg-bg-elevated p-5">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
                <span className="min-w-0">
                  <span className="eyebrow block">Location</span>
                  <span className="mt-1 block text-sm text-fg">
                    {siteConfig.location.full}
                  </span>
                </span>
              </li>
            </ul>

            <div className="mt-10">
              <p className="eyebrow">Social Profiles</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-xs border border-border px-3 py-2 text-sm text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
                    >
                      <BrandIcon
                        name={social.icon}
                        size={16}
                        className="text-fg-subtle transition-colors group-hover:text-accent"
                      />
                      {social.label}
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-10 border-l-2 border-accent bg-surface-hover px-5 py-4 text-sm leading-relaxed text-fg-muted">
              <span className="font-medium text-fg">
                {siteConfig.availability.status}.
              </span>{" "}
              {siteConfig.availability.note} Replies usually land within a day.
            </p>
          </aside>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="FAQ"
          title="Before You Write"
          description="The five questions that come up most often. If yours is not here, ask it in the message."
        />

        <Reveal className="mt-12">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-bg-elevated p-6 sm:p-7">
                <dt className="text-sm font-medium text-fg">{faq.question}</dt>
                <dd className="mt-2.5 max-w-3xl text-sm leading-relaxed text-fg-muted">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>
    </>
  );
}