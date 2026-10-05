"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { NavItem } from "@/data/navigation";
import { siteConfig, socialLinks } from "@/data/site";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Mobile navigation drawer.
 *
 * Uses Radix `Sheet`, which supplies the dialog semantics, focus trap, Escape
 * handling and scroll lock. This component only decides what goes inside it.
 */
export function MobileNav({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes, so following a link does not
  // leave the previous page's menu hanging open behind the new one.
  //
  // Adjusted during render rather than in an effect: React explicitly supports
  // deriving state from a prop mid-render, and it avoids the extra render pass
  // an effect-based reset would cause.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xs lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(20rem,85vw)] border-l border-border bg-bg-elevated p-0"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="text-left text-sm font-semibold tracking-[0.18em]">
            {siteConfig.shortName}
          </SheetTitle>
          <SheetDescription className="text-left text-xs text-fg-subtle">
            {siteConfig.role}
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="px-3 py-4">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = isActive(item, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cnLink(active)}
                  >
                    <span className="font-mono text-[0.6875rem] text-fg-subtle">
                      {String(items.indexOf(item) + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border px-6 py-5">
          <Button asChild className="w-full rounded-xs">
            <Link href="/contact" onClick={() => setOpen(false)}>
              Let&apos;s Work Together
            </Link>
          </Button>

          <ul className="mt-5 flex flex-wrap items-center gap-4">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-subtle transition-colors hover:text-accent focus-visible:text-accent"
                >
                  <BrandIcon name={social.icon} size={18} title={social.label} />
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-4 block truncate text-xs text-fg-subtle transition-colors hover:text-fg"
          >
            {siteConfig.email}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function cnLink(active: boolean) {
  return [
    "flex items-center gap-4 rounded-xs px-3 py-3 transition-colors",
    active
      ? "bg-surface-hover text-fg"
      : "text-fg-muted hover:bg-surface-hover hover:text-fg",
  ].join(" ");
}

function isActive(item: NavItem, pathname: string) {
  const match = item.match ?? item.href;
  if (match === "/") return pathname === "/";
  return pathname === match || pathname.startsWith(`${match}/`);
}