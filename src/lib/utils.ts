import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract a readable client IP from proxy headers.
 *
 * `x-forwarded-for` is a comma-separated chain; the first entry is the original
 * client. Returns `null` when no header is present.
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || null;
}

/**
 * Split text into lines, tolerating blank lines.
 *
 * Long-form copy in the data files uses `\n\n` between paragraphs; rendering
 * needs real elements so spacing and screen readers both behave.
 */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Format an ISO timestamp as e.g. "4 Oct 2026". */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Absolute time for `title`/`dateTime` attributes — unambiguous for machines
 * and for readers who need to distinguish two messages from the same day.
 */
export function toDateTimeAttribute(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

/** Join truthy class-name fragments. Thin alias kept for template readability. */
export function classes(...values: ClassValue[]) {
  return cn(values);
}