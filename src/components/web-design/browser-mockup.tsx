import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Website mockup framed in browser chrome.
 *
 * The generated artwork is a flat 1440×900 sheet, so presenting it inside a
 * browser frame is what makes it read as a website design rather than as an
 * abstract image. Purely presentational — no client state.
 */
export function BrowserMockup({
  src,
  alt,
  url,
  caption,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  /** Shown in the address bar. Decorative — never a real link. */
  url: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("group", className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-bg-elevated transition-colors group-hover:border-border-strong">
        {/* Chrome */}
        <div className="flex items-center gap-3 border-b border-border bg-surface-hover px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-xs border border-border bg-bg px-3 py-1 font-mono text-[0.6875rem] text-fg-subtle">
            {url}
          </span>
        </div>

        {/* Viewport */}
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={1440}
            height={900}
            priority={priority}
            className="w-full"
          />
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-4 flex items-center gap-3 text-sm text-fg-subtle">
          <span aria-hidden="true" className="h-px w-6 bg-border-strong" />
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}