import type { Service } from "@/types/content";

/**
 * The eight service offerings.
 *
 * The `index` values drive the "SERVICE 01" labels, so keep them sequential.
 * Slugs are stable keys: the three that have dedicated detail routes
 * (`graphic-design`, `web-design`, `full-stack-development`) are looked up in
 * `app/services/page.tsx` — renaming one silently drops its "View work" link.
 *
 * The list follows the brief exactly, including the three additions over a
 * typical design-and-build offering: e-commerce development, admin dashboards
 * and website maintenance. Together they cover the whole lifecycle, which is the
 * point being made — the same person carries a client from first brief to
 * ongoing support rather than handing them off.
 */
export const services: Service[] = [
  {
    index: "01",
    slug: "graphic-design",
    title: "Graphic Design",
    tagline: "Visual work that reads as one system, everywhere.",
    description:
      "Logo design, social media graphics, posters, advertisements, menus, marketing materials and visual communication — produced as a structured set rather than one-off files.",
    deliverables: [
      "Logo Design",
      "Social Media Graphics",
      "Posters",
      "Advertisements",
      "Menu Design",
      "Marketing Materials",
    ],
    icon: "palette",
  },
  {
    index: "02",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    tagline: "Interfaces designed around how people actually use them.",
    description:
      "User research, wireframes, prototypes, design systems, responsive interfaces and usability testing — every decision documented so engineering can build it without guesswork.",
    deliverables: [
      "User Research",
      "Wireframes",
      "Prototypes",
      "Design Systems",
      "Responsive Interfaces",
      "Usability Testing",
    ],
    icon: "layout-dashboard",
  },
  {
    index: "03",
    slug: "branding",
    title: "Branding",
    tagline: "A complete identity system, not just a logo file.",
    description:
      "Brand identity, logo systems, typography, colour, brand guidelines and visual direction — the strategy underneath the mark, so the brand stays consistent whoever applies it.",
    deliverables: [
      "Brand Identity",
      "Logo System",
      "Typography",
      "Colour Palette",
      "Brand Guidelines",
      "Visual Direction",
    ],
    icon: "gem",
  },
  {
    index: "04",
    slug: "web-design",
    title: "Web Design",
    tagline: "Marketing sites that build credibility in the first five seconds.",
    description:
      "Modern responsive websites, landing pages, corporate sites and portfolio websites. Clear hierarchy and deliberate whitespace that hold up on any screen.",
    deliverables: [
      "Business Websites",
      "Landing Pages",
      "Corporate Websites",
      "Portfolio Websites",
      "Content Structure",
    ],
    icon: "globe",
  },
  {
    index: "05",
    slug: "full-stack-development",
    title: "Full-Stack Development",
    tagline: "Design and code handled by the same person.",
    description:
      "Complete web applications with frontend, backend, APIs, authentication and databases. Because design and development sit in the same head, nothing gets lost in handoff.",
    deliverables: [
      "Frontend",
      "Backend",
      "REST APIs",
      "Authentication",
      "Databases",
      "Deployment",
    ],
    icon: "code-2",
  },
  {
    index: "06",
    slug: "ecommerce-development",
    title: "E-Commerce Development",
    tagline: "Stores where the checkout actually gets finished.",
    description:
      "Online stores, product management, orders, payments and customer systems. Catalogue, cart, checkout and the account area behind it, built to be operated day to day.",
    deliverables: [
      "Product Catalogue",
      "Cart & Checkout",
      "Order Management",
      "Payment Integration",
      "Customer Accounts",
      "Inventory",
    ],
    icon: "shopping-cart",
  },
  {
    index: "07",
    slug: "admin-dashboards",
    title: "Admin Dashboards",
    tagline: "The internal tool that makes the site operable.",
    description:
      "Business dashboards, analytics, management systems and internal tools. Every content type on a client site gets an editing surface, so updates never require a developer.",
    deliverables: [
      "Role-Based Access",
      "Content Management",
      "Analytics Views",
      "Reporting",
      "Audit Logs",
      "Data Entry Forms",
    ],
    icon: "gauge",
  },
  {
    index: "08",
    slug: "website-maintenance",
    title: "Website Maintenance",
    tagline: "Keeping a live site healthy after launch.",
    description:
      "Performance optimization, security updates, bug fixing and continuous improvements. Launch is the start of the engagement, not the end of it.",
    deliverables: [
      "Performance Optimization",
      "Security Updates",
      "Bug Fixing",
      "Dependency Updates",
      "Backups & Uptime",
      "Content Changes",
    ],
    icon: "wrench",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}