import type { Metadata } from "next";

import { About } from "@/components/about";
import { ContactCta } from "@/components/contact/contact-cta";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Process } from "@/components/process";
import { FeaturedProjects } from "@/components/projects/featured-projects";
import { Services } from "@/components/services";
import { Skills } from "@/components/skills";
import { TechnologyStack } from "@/components/technology-stack";
import { Testimonials } from "@/components/testimonials";
import { Section, SectionHeading } from "@/components/ui/section";
import { getTestimonials } from "@/lib/content/portfolio";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  // The root layout already declares the canonical home title and description.
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <Skills />
      <TechnologyStack />
      <Process />
      <Experience />

      {testimonials.length > 0 ? (
        <Section id="testimonials">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Clients Say"
            description="Sample quotes showing the layout and tone. These are placeholders until real, client-approved feedback replaces them."
          />
          <div className="mt-12">
            <Testimonials items={testimonials} />
          </div>
        </Section>
      ) : null}

      <ContactCta />

      {/*
        Introductory copy for crawlers. Rendered visually hidden so the visible
        page stays uncluttered while search engines and assistive technology get
        an unambiguous description of who the site belongs to.
      */}
      <p className="sr-only">
        {siteConfig.name} is a {siteConfig.role.toLowerCase()} based in{" "}
        {siteConfig.location.full}, working across {siteConfig.alternativeRole}.
        This portfolio covers brand identity, UI/UX design, responsive web design
        and full-stack development with Next.js, React, TypeScript, Node.js and
        Supabase.
      </p>
    </>
  );
}