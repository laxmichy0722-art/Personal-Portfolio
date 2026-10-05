"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { Testimonial } from "@/types/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Gap between automatic slides. Long enough to read a quote. */
const AUTO_SLIDE_MS = 7000;

/**
 * Testimonial carousel.
 *
 * Two honesty rules are enforced here rather than left to the data file:
 *
 *   1. Any card whose `isPlaceholder` flag is set renders a visible "Sample
 *      testimonial" badge. A reader must never mistake a placeholder for a real
 *      endorsement.
 *   2. With no items at all, the carousel shows an honest empty state rather
 *      than inventing one.
 *
 * Cards also carry a five-star row, per the brief.
 */
/**
 * Five-star row.
 *
 * Decorative and hidden from assistive technology — the rating is not
 * information a screen-reader user needs, because the quote itself is the
 * content — but it is the visual signal the brief asks for.
 */
function Stars() {
  return (
    <span aria-hidden="true" className="flex shrink-0 gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} className="size-4 fill-accent text-accent" />
      ))}
    </span>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  // Read the snap count during render rather than storing it. It only changes
  // when Embla re-initialises, and `reInit` triggers `onSelect`, which
  // re-renders and re-reads it — so the two cannot drift, and no effect is
  // needed to synchronise them.
  const snapCount = emblaApi ? emblaApi.scrollSnapList().length : 0;

  useEffect(() => {
    if (!emblaApi) return;

    // Both handlers run from Embla's own event callbacks, so this is state
    // syncing to an external system rather than a cascading render.
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  /**
   * Auto-slide, per the brief.
   *
   * Paused on hover, on focus-within and whenever the tab is hidden, and
   * suppressed entirely when the visitor has asked for reduced motion — an
   * endlessly-advancing carousel is exactly the kind of movement that setting
   * exists to stop. The interval is cleared on every one of those transitions,
   * so no timer survives the component or leaks after unmount.
   */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      stop();
      if (paused) return;
      timer = setInterval(() => emblaApi?.scrollNext(), AUTO_SLIDE_MS);
    };
    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    // Reduced motion can be switched on mid-session (macOS/iOS system
    // settings, a browser extension). Re-reading `matches` on the event rather
    // than treating the change as a plain "start" signal is what stops the
    // carousel at that moment instead of starting it up again.
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    prefersReducedMotion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      prefersReducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [emblaApi, paused]);

  // Pointer and keyboard interaction should not race the timer: someone reading
  // a quote, or operating the arrows, must not have the slide change underneath
  // them mid-sentence.
  const pauseAutoSlide = useCallback(() => setPaused(true), []);
  const resumeAutoSlide = useCallback(() => setPaused(false), []);

  // React's `onBlur` bubbles, so it also fires when focus moves *between*
  // children — arrowing through the dots would blur the first one and restart
  // the timer while the visitor is still interacting. Only resume once focus
  // has actually left the carousel.
  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      resumeAutoSlide();
    }
  }, [resumeAutoSlide]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-bg-elevated p-10 text-center sm:p-14">
        <Quote aria-hidden="true" className="mx-auto size-6 text-fg-subtle" />
        <p className="mt-4 text-base text-fg">Client testimonials coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
          This section only publishes quotes I can attribute to a real client.
          Once the first project ships with a client&apos;s approval, their words
          appear here.
        </p>
      </div>
    );
  }

  return (
    /* Hover and focus-within pause the auto-slide timer via CSS-free event
       handlers on this wrapper — see the `onMouseEnter` / `onFocus` below. */
    <div
      onMouseEnter={pauseAutoSlide}
      onMouseLeave={resumeAutoSlide}
      onFocus={pauseAutoSlide}
      onBlur={handleBlur}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {items.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="min-w-0 shrink-0 grow-0 basis-full px-0 md:basis-1/2 md:px-4"
            >
              <blockquote className="flex h-full flex-col rounded-lg border border-border bg-bg-elevated p-7 sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <Quote aria-hidden="true" className="size-5 shrink-0 text-accent" />
                  <Stars />
                </div>

                {/* Placeholder flag made visible. Without this a reader has no
                    way to tell a sample from a real endorsement. */}
                {testimonial.isPlaceholder ? (
                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface-hover px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-fg-muted">
                    Sample testimonial
                  </p>
                ) : null}

                <p className="mt-5 flex-1 text-base leading-relaxed text-fg sm:text-lg">
                  {testimonial.quote}
                </p>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-hover font-mono text-xs text-fg-muted">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      testimonial.name.charAt(0)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">
                      {testimonial.name}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">
                      {testimonial.role} · {testimonial.company}
                    </span>
                  </span>
                </figcaption>
              </blockquote>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonials">
          {items.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-label={`Show testimonial ${index + 1} of ${items.length}`}
              onClick={() => emblaApi?.scrollTo(index)}
              /* The visible bar is only 4px tall, which is a 4px pointer target
                 no finger can land on. Padding plus a minimum width keeps the
                 bar's exact 4x16 / 4x32 proportions while lifting the real hit
                 area to 24x24 (WCAG 2.5.8 AA). */
              className="group/dot flex min-w-6 items-center justify-center py-2.5"
            >
              <span
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  selected === index
                    ? "w-8 bg-accent"
                    : "w-4 bg-border-strong group-hover/dot:bg-fg-subtle",
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="rounded-xs"
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="rounded-xs"
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing testimonial {selected + 1} of {snapCount || items.length}.
      </p>
    </div>
  );
}