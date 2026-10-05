export interface Service {
  index: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  /** Lucide icon name resolved in `components/ui/service-icon.tsx`. */
  icon:
    | "palette"
    | "gem"
    | "layout-dashboard"
    | "globe"
    | "code-2"
    | "shopping-cart"
    | "gauge"
    | "wrench";
}

export interface SkillCategory {
  slug: string;
  label: string;
  description: string;
  skills: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  /** Human readable duration, e.g. "2023 — Present". */
  period: string;
  startYear: number;
  endYear: number | null;
  type: "freelance" | "employment" | "internship" | "education" | "project";
  location: string;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /**
   * Portrait of the person the quote belongs to, mapped from the database's
   * `photo_url`. Optional because a quote can only carry a face once that
   * person has agreed to be named and photographed — until then the carousel
   * falls back to a monogram rather than borrowing a stock face, which would
   * misattribute a real-looking portrait to a sample quote.
   */
  image?: string;
  /**
   * Placeholder entries exist so the layout is reviewable before real
   * testimonials arrive. They are excluded from the public carousel and the
   * `isPlaceholder` flag makes the intent explicit in the code.
   */
  isPlaceholder: boolean;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
  outputs: string[];
}