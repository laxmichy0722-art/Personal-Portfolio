import Link from "next/link";

import {
  aboutNavigation,
  disciplineGalleries,
  portfolioNavigation,
} from "@/data/navigation";
import { siteConfig, socialLinks } from "@/data/site";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

/**
 * Site footer: brand block, the three gallery routes, contact details and the
 * legal line. `data-site-footer` is referenced by the print stylesheet so the
 * footer is dropped when the resume is printed.
 */
export function Footer() {
  return (
    <footer
      data-site-footer
      className="border-t border-border bg-bg-elevated"
    >
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <p className="text-sm font-semibold tracking-[0.18em] text-fg">
              {siteConfig.name.toUpperCase()}
            </p>
            <p className="mt-3 text-sm text-fg-muted">{siteConfig.roleShort}</p>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              {siteConfig.roleShort} creating meaningful digital experiences.
            </p>
            <p className="mt-4 font-accent text-lg text-fg">
              &ldquo;{siteConfig.tagline}&rdquo;
            </p>

            <ul className="mt-6 flex flex-wrap items-center gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-9 place-items-center rounded-xs border border-border text-fg-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                  >
                    <BrandIcon
                      name={social.icon}
                      size={17}
                      title={`${siteConfig.name} on ${social.label}`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <h2 className="eyebrow">Portfolio</h2>
            <ul className="mt-5 space-y-3">
              {portfolioNavigation.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Disciplines">
            <h2 className="eyebrow">Disciplines</h2>
            <ul className="mt-5 space-y-3">
              {disciplineGalleries.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
              {aboutNavigation
                .filter(
                  (item) =>
                    !disciplineGalleries.some((d) => d.href === item.href),
                )
                .map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{item.label}</FooterLink>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="eyebrow">Contact</h2>
            <address className="mt-5 space-y-3 text-sm not-italic text-fg-muted">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  className="transition-colors hover:text-accent"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="text-fg-subtle">{siteConfig.location.full}</li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-fg transition-colors hover:text-accent"
                >
                  Start a project →
                </Link>
              </li>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs text-fg-subtle">
              &copy; 2026 {siteConfig.name}. All Rights Reserved.
            </p>
            <p className="mt-1.5 font-mono text-xs text-fg-subtle">
              Designed &amp; Developed by {siteConfig.name}
            </p>
          </div>
          <ScrollToTop />
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-fg-muted transition-colors hover:text-fg"
    >
      {children}
    </Link>
  );
}