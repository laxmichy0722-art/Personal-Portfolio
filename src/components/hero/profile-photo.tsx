import Image from "next/image";

import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Technology chips orbiting the portrait.
 *
 * The brief asks for Figma, React, Node.js, Photoshop and JavaScript floating
 * around the image. They are placed at fixed percentages rather than scattered
 * randomly so the composition stays deliberate at every breakpoint, and each one
 * is small and low-contrast enough to read as texture, not as competing focal
 * points. All are decorative — the technologies are named in the page text and
 * in the skills section, so hiding them from assistive technology loses nothing.
 */
const ORBIT_CHIPS = [
  { label: "Figma", className: "left-[-6%] top-[12%]" },
  { label: "React", className: "right-[-4%] top-[26%]" },
  { label: "Photoshop", className: "left-[-9%] bottom-[26%]" },
  { label: "JavaScript", className: "right-[-2%] bottom-[13%]" },
  { label: "Node.js", className: "left-[38%] bottom-[-7%]" },
] as const;

/**
 * Hero portrait.
 *
 * Sizing is container-driven, not viewport-driven:
 *
 *   `width: clamp(240px, 100%, 560px)`
 *
 * The `100%` term is what makes this safe. A `vw`-based width overflows at
 * exactly 1024px: the grid column there is ~361px wide but carries 24px of
 * left padding, leaving 337px of content box — while `35vw` still asks for
 * 358px, pushing the portrait ~21px past the viewport edge. Resolving against
 * the container instead means the portrait can never be wider than the space it
 * was actually given, and the 240px floor keeps it clear of the gutter at 320px
 * (where the container leaves 280px).
 *
 * The 560px ceiling is set just above the widest hero grid track (562px at
 * 1440px). The old 480px ceiling bound early: from 1280px up the portrait
 * stopped growing and left up to 82px of its own column empty, so the right
 * column read as a small element floating in a wide gap. At 560px the portrait
 * fills its track and the dead space above and below it drops from ~128px to
 * ~88px against the taller copy column.
 *
 * The brief asks for an "organic" shape rather than a plain rectangle or a
 * perfect circle. `rounded-[38%_62%_55%_45%/45%_38%_62%_55%]` gives an asymmetric
 * four-corner blob that reads as hand-cut without looking broken. It is a
 * `clip-path`-free CSS radius so it stays crisp at any DPR and costs nothing.
 *
 * The photograph is 1080×1084 — a 0.4% difference from 1:1 — and `object-cover`
 * scales uniformly, so the face is never stretched and is barely cropped. Chips
 * sit outside the blob's optical centre, so decoration never crosses the face.
 */
export function ProfilePhoto({
  className,
  priority = false,
  showChips = true,
}: {
  className?: string;
  /** Set on the hero image so it is not lazy-loaded (it is the LCP element). */
  priority?: boolean;
  /** Chips are for the hero only; the about page reuses this without them. */
  showChips?: boolean;
}) {
  return (
    <div
      className={cn("relative mx-auto w-[clamp(240px,100%,560px)]", className)}
    >
      {/* --- Decoration: orange glow + offset accent ring, behind the portrait --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 -z-10 rounded-full bg-accent/20 blur-[70px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] border border-accent/20"
      />

      {/* --- The portrait --- */}
      <div
        className="relative aspect-square w-full overflow-hidden border border-border bg-bg-elevated"
        style={{
          // Organic blob. Percentages are resolved against the element's own
          // box, so the silhouette holds its shape at every size.
          borderRadius: "38% 62% 55% 45% / 45% 38% 62% 55%",
        }}
      >
        <Image
          src={siteConfig.profileImage}
          alt={siteConfig.profileImageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 420px, (min-width: 768px) 340px, (min-width: 640px) 280px, 240px"
          className="object-cover object-center"
        />
      </div>

      {/* --- Floating technology chips --- */}
      {showChips ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {ORBIT_CHIPS.map((chip) => (
            <span
              key={chip.label}
              className={cn(
                "absolute whitespace-nowrap rounded-full border border-border bg-bg-elevated/90 px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-fg-muted uppercase backdrop-blur-sm sm:px-3 sm:text-[0.6875rem]",
                chip.className,
              )}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}