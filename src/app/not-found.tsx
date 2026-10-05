import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 404 page.
 *
 * Offers the four things a lost visitor actually wants: the projects, the
 * contact page, a way back home, and a mail address if they were looking for
 * something specific that does not exist.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden border-b border-border pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      />

      <div className="container-page relative">
        <div className="max-w-2xl">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Error 404
          </p>

          <p className="font-mono text-6xl text-fg-subtle sm:text-7xl">404</p>

          <h1 className="mt-6 text-display-sm text-fg">
            This page doesn&apos;t exist.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-fg-muted sm:text-lg">
            The link may be out of date, or the page may have moved. Nothing is
            broken on your side — try one of the routes below.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="rounded-xs">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/projects">Browse projects</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-xs">
              <Link href="/contact">Report a broken link</Link>
            </Button>
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {[
              { href: "/about", label: "About", detail: "Background and approach" },
              { href: "/services", label: "Services", detail: "What can be commissioned" },
              { href: "/graphic-design", label: "Graphic Design", detail: "Identity, print, packaging" },
              { href: "/web-design", label: "Web Design", detail: "Responsive site design" },
              {
                href: "/full-stack-development",
                label: "Full-Stack",
                detail: "Next.js, Node.js, Supabase",
              },
              { href: "/resume", label: "Résumé", detail: "Experience and skills" },
            ].map((item) => (
              <li key={item.href} className="bg-bg-elevated">
                <Link
                  href={item.href}
                  className="group flex flex-col gap-1 p-5 transition-colors hover:bg-surface-hover"
                >
                  <span className="text-sm text-fg transition-colors group-hover:text-accent">
                    {item.label}
                  </span>
                  <span className="text-xs text-fg-subtle">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}