import type { ProjectCategory } from "@/types/project";

export interface NavItem {
  label: string;
  href: string;
  /** Matched against the pathname to mark the link active. */
  match?: string;
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/", match: "/" },
  { label: "About", href: "/about", match: "/about" },
  { label: "Services", href: "/services", match: "/services" },
  { label: "Skills", href: "/skills", match: "/skills" },
  // Labelled "Portfolio" per the brief. The href stays `/projects` because that
  // is the existing public route — renaming the label avoids a pointless
  // redirect and keeps every inbound link working.
  { label: "Portfolio", href: "/projects", match: "/projects" },
  { label: "Experience", href: "/experience", match: "/experience" },
  { label: "Contact", href: "/contact", match: "/contact" },
];

/** Secondary navigation shown in the footer and mobile menu. */
export const portfolioNavigation: NavItem[] = [
  { label: "Portfolio", href: "/projects" },
  { label: "Graphic Design", href: "/graphic-design" },
  { label: "Web Design", href: "/web-design" },
  { label: "Full-Stack", href: "/full-stack-development" },
  { label: "Experience", href: "/experience" },
  { label: "Resume", href: "/resume" },
];

export const aboutNavigation: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Services", href: "/services" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
];

/** Galleries grouped by the discipline they showcase. */
export const disciplineGalleries: {
  label: string;
  href: string;
  description: string;
  category: ProjectCategory;
}[] = [
  {
    label: "Graphic Design",
    href: "/graphic-design",
    description:
      "Brand identity, posters, menus, packaging and social media artwork.",
    category: "graphic-design",
  },
  {
    label: "Web Design",
    href: "/web-design",
    description:
      "Responsive website design with desktop and mobile previews.",
    category: "web-design",
  },
  {
    label: "Full-Stack",
    href: "/full-stack-development",
    description:
      "Database-backed applications with authentication and admin dashboards.",
    category: "full-stack",
  },
];