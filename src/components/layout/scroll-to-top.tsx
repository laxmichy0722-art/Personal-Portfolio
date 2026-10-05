"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Back-to-top control.
 *
 * Appears after the first viewport of scroll. Hidden from assistive tech while
 * off-screen so keyboard and screen-reader users do not land on an invisible
 * button at the end of the document.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "inline-flex items-center gap-2 self-start rounded-xs border border-border px-3 py-2 font-mono text-xs text-fg-muted transition-all duration-300",
        "hover:border-accent hover:text-accent",
        "disabled:pointer-events-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp aria-hidden="true" className="size-3.5" />
      Back to top
    </button>
  );
}