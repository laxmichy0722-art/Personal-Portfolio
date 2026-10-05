/** Site-wide personal details. Single source of truth for the brand. */
export const siteConfig = {
  name: "Laxmi Chaudhary",
  shortName: "LAXMI",
  initials: "LC",
  /** The brief's professional title, used verbatim in metadata and JSON-LD. */
  role: "Graphic Designer | UI/UX Designer | Full-Stack Developer",
  /** Shorter form for tight spaces (hero, footer, cards). */
  roleShort: "Graphic Designer & Full-Stack Developer",
  alternativeRole: "Creative Designer | UI/UX Designer | Full-Stack Developer",
  tagline: "Designing Ideas. Building Digital Experiences.",
  description:
    "Professional graphic designer, UI/UX designer and full-stack developer based in Lalitpur, Nepal, creating powerful brands, intuitive digital experiences and scalable web applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  locale: "en_US",
  email: "laxmichy0722@gmail.com",
  phone: "9742987676",
  phoneHref: "+9779742987676",
  location: {
    city: "Lalitpur",
    area: "Imadol",
    country: "Nepal",
    full: "Imadol, Lalitpur, Nepal",
  },
  /**
   * Portrait used by the hero and the about page.
   *
   * This is the real photograph. It is served from `public/images/profile.jpg`
   * at its native 1080×1084 resolution and presented inside a clipping shape
   * with `object-cover` + centre alignment, so the face is never stretched or
   * clipped meaningfully (see ProfilePhoto).
   *
   * To swap it for a new photo, overwrite that one file — or repoint this
   * value at the new path. Every consumer reads this field.
   */
  profileImage: "/images/profile.jpg",
  /** Alt text. Required by the spec and by WCAG 1.1.1 for meaningful images. */
  profileImageAlt:
    "Laxmi Chaudhary - Graphic Designer and Full-Stack Web Designer",
  availability: {
    status: "AVAILABLE FOR FREELANCE PROJECTS",
    short: "Available for freelance",
    engagement: "Freelance / Full-Time",
    note: "Taking on freelance projects and full-time roles.",
  },
  seo: {
    title: "Laxmi Chaudhary | Graphic Designer, UI/UX Designer & Full-Stack Developer Nepal",
    description:
      "Professional graphic designer, UI/UX designer and full-stack developer from Lalitpur, Nepal. I transform ideas into powerful brands, intuitive digital experiences and scalable web applications.",
    /**
     * Target keywords, verbatim from the brief. Used for the `keywords`
     * meta tag only — there is no `meta keywords` search-engine ranking to
     * chase, but the value is still a useful summary of the intended
     * positioning, and it is surfaced in the admin SEO panel.
     */
    keywords: [
      "Graphic Designer Nepal",
      "UI UX Designer Nepal",
      "Full Stack Developer Nepal",
      "Web Designer Nepal",
      "Freelance Graphic Designer",
      "Freelance Full Stack Developer",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Normalised social profiles.
 *
 * The brief lists GitHub, LinkedIn, Behance, Dribbble and Instagram. Facebook is
 * omitted deliberately: it adds nothing for an international client audience
 * and would be the only link without a matching design-platform profile.
 */
export const socialLinks = [
  {
    label: "GitHub",
    handle: "@laxmich",
    href: "https://github.com/laxmich",
    icon: "github",
  },
  {
    label: "LinkedIn",
    handle: "@laxmich",
    href: "https://linkedin.com/in/laxmich",
    icon: "linkedin",
  },
  {
    label: "Behance",
    handle: "@laxmich",
    href: "https://behance.net/laxmich",
    icon: "behance",
  },
  {
    label: "Dribbble",
    handle: "@laxmich",
    href: "https://dribbble.com/laxmich",
    icon: "dribbble",
  },
  {
    label: "Instagram",
    handle: "@laxmich",
    href: "https://instagram.com/laxmich",
    icon: "instagram",
  },
] as const;

export type SocialLink = (typeof socialLinks)[number];

/** Absolute URL helper for metadata, sitemap and JSON-LD. */
export function absoluteUrl(path: string = "/") {
  const base = siteConfig.url;
  return new URL(path, base).toString();
}