"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Toast host, themed for the dark shell.
 *
 * `richColors` is left off deliberately: the palette is restrained, and the
 * status colours would fight the accent. Errors and successes are distinguished
 * by the icon and the border, not by a loud fill.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xs !border-border !bg-bg-elevated !text-fg !shadow-xl",
          description: "!text-fg-muted",
          actionButton: "!rounded-xs !bg-accent !text-accent-foreground",
          cancelButton: "!rounded-xs !bg-surface-hover !text-fg-muted",
          error: "!border-destructive/40",
          success: "!border-success/40",
        },
      }}
    />
  );
}