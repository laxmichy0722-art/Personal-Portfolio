"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";

import {
  galleryCategories,
  type GalleryCategory,
  type GalleryItem,
} from "@/data/gallery";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Tag } from "@/components/ui/section";

/**
 * Graphic design gallery with a lightbox.
 *
 * A masonry layout via CSS columns rather than a fixed grid, because the source
 * artwork has mixed aspect ratios and a uniform grid would crop or letterbox
 * most of it. Filtering is client-side against statically imported data.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const visible = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.category === filter),
    [items, filter],
  );

  const active = openIndex === null ? undefined : visible[openIndex];

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        // Wrap around so the gallery never dead-ends.
        return (current + delta + visible.length) % visible.length;
      });
    },
    [visible.length],
  );

  // Arrow-key paging inside the lightbox. Bound on the dialog only while open.
  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, step]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter gallery by category"
        className="flex flex-wrap gap-2"
      >
        {galleryCategories.map((category) => {
          const activeChip = filter === category.slug;
          const count =
            category.slug === "all"
              ? items.length
              : items.filter((item) => item.category === category.slug).length;

          // Categories with nothing in them stay visible but disabled, so the
          // set of disciplines is discoverable without pretending there's work.
          const disabled = count === 0;

          return (
            <button
              key={category.slug}
              type="button"
              disabled={disabled}
              onClick={() => {
                setFilter(category.slug);
                setOpenIndex(null);
              }}
              aria-pressed={activeChip}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-xs border px-3.5 py-2 text-sm transition-colors duration-200",
                disabled && "cursor-not-allowed opacity-40",
                !disabled &&
                  (activeChip
                    ? "border-accent text-fg"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg"),
              )}
            >
              {activeChip ? (
                <motion.span
                  layoutId="gallery-filter-active"
                  className="absolute inset-0 -z-10 rounded-xs bg-accent/10"
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
              {category.label}
              <span className="font-mono text-[0.6875rem] text-fg-subtle">
                {String(count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "item" : "items"}
        {filter === "all" ? "" : ` in ${filter}`}.
      </p>

      {visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing in this category yet"
            description="This filter is ready — work lands here as soon as it is published."
          />
        </div>
      ) : (
        <motion.ul
          layout
          className="mt-10 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {visible.map((item, index) => (
            <motion.li
              key={item.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.3),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-6 break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group block w-full overflow-hidden rounded-lg border border-border bg-bg-elevated text-left transition-colors hover:border-border-strong"
              >
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    width={1440}
                    height={900}
                    loading="lazy"
                    className="w-full"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Expand className="size-5 text-white" />
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-medium text-fg">
                      {item.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-fg-subtle">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {item.description}
                  </p>
                </div>
              </button>
              <span className="sr-only">Open {item.title} in a lightbox</span>
            </motion.li>
          ))}
        </motion.ul>
      )}

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(72rem,calc(100%-2rem))] gap-0 border-border bg-bg-elevated p-0 sm:max-w-[min(72rem,calc(100%-2rem))]"
        >
          {active ? (
            <>
              <DialogTitle className="sr-only">{active.title}</DialogTitle>
              <DialogDescription className="sr-only">
                {active.description}
              </DialogDescription>

              <div className="relative overflow-hidden rounded-t-lg border-b border-border bg-bg">
                <Image
                  src={active.image}
                  alt={active.imageAlt}
                  width={1440}
                  height={900}
                  className="w-full"
                  priority
                />
              </div>

              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">{active.categoryLabel}</p>
                  <p className="mt-3 text-lg text-fg">{active.title}</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
                    {active.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {active.tools.map((tool) => (
                      <li key={tool}>
                        <Tag>{tool}</Tag>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => step(-1)}
                    >
                      <ArrowLeft aria-hidden="true" />
                      <span className="sr-only">Previous item</span>
                    </Button>
                    <span className="px-2 font-mono text-xs text-fg-subtle">
                      {(openIndex ?? 0) + 1} / {visible.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => step(1)}
                    >
                      <ArrowRight aria-hidden="true" />
                      <span className="sr-only">Next item</span>
                    </Button>
                  </div>

                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-fg-muted"
                    >
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}