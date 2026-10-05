"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { navigation, type NavItem } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/navbar/mobile-nav";

/**
 * Sticky site header.
 *
 * Transparent over the hero, then gains a blurred, bordered background once the
 * page is scrolled. The active route is marked with `aria-current` and a small
 * accent indicator, which is also what the mobile sheet reads from.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-site-navbar
      data-scrolled={scrolled}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-header transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-full items-center justify-between gap-6"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-sm"
          aria-label={`${siteConfig.name} — home`}
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xs bg-accent font-mono text-xs font-bold tracking-tight text-accent-foreground transition-transform duration-300 group-hover:rotate-[-6deg]"
          >
            {siteConfig.initials}
          </span>
          <span className="hidden text-sm font-semibold tracking-[0.18em] text-fg sm:block">
            {siteConfig.shortName}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden rounded-xs font-medium tracking-wide sm:inline-flex"
          >
            <Link href="/contact">Let&apos;s Work Together</Link>
          </Button>

          <MobileNav items={navigation} pathname={pathname} />
        </div>
      </nav>
    </header>
  );
}

/** Single navigation link, including the active-route indicator. */
function NavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = isActive(item, pathname);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-sm px-3 py-2 text-sm transition-colors duration-200",
        active ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      {item.label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}

/** Exact match for `/`, prefix match for everything else. */
function isActive(item: NavItem, pathname: string) {
  const match = item.match ?? item.href;
  if (match === "/") return pathname === "/";
  return pathname === match || pathname.startsWith(`${match}/`);
}