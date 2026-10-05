import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import {
  budgetLabel,
  collectFieldErrors,
  contactSchema,
  deriveSubject,
  optionalValue,
  projectTypeLabel,
  timelineLabel,
} from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { notifyNewInquiry } from "@/lib/email/notify";
import type {
  ContactBudgetRange,
  ContactProjectType,
  ContactTimelineRange,
} from "@/types/database";

/** Reject oversized bodies before parsing. */
const MAX_BODY_BYTES = 16 * 1024;

/** Allow 5 enquiries per IP per 10 minutes. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

/** No human fills this form in under two seconds. */
const MIN_FILL_MS = 2000;

/** Bot submissions are accepted silently so the bot gets no signal. */
const SPY_ACKNOWLEDGEMENT = {
  ok: true,
  message: "Thanks — your inquiry has been received.",
} as const;

/**
 * Reads the honeypot value straight off the raw body.
 *
 * Runs *before* schema validation on purpose: validating first would reject the
 * submission with a 400 that names the anti-spam field, which both tells the bot
 * it was caught and confirms the mechanism exists.
 */
function readHoneypot(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>).website;
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request too large." },
      { status: 413 },
    );
  }

  // --- Rate limit ------------------------------------------------------
  const ip = getClientIp(request.headers) ?? "unknown";
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMIT);

  if (!limit.success) {
    return NextResponse.json(
      {
        error: `Too many messages from this connection. Please try again in ${limit.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  // --- Parse + validate ------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  // --- Honeypot ---------------------------------------------------------
  // Checked before validation so the response is indistinguishable from success.
  if (readHoneypot(body)) {
    return NextResponse.json(SPY_ACKNOWLEDGEMENT, { status: 201 });
  }

  // --- Validate ---------------------------------------------------------
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some fields need attention.",
        fieldErrors: collectFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  // `website` (the honeypot) and `startedAt` (the fill timer) are bot-defence
  // signals, not enquiry data — both are discarded here rather than persisted.
  const { startedAt, website, ...fields } = parsed.data;
  void website;

  // Optional fields arrive as `undefined`, `""` or the `UNSPECIFIED` sentinel when
  // left blank. The columns are nullable, and sending `null` rather than `""`
  // keeps "not provided" distinct from "provided but empty" in the database.
  const phone = fields.phone?.trim() ? fields.phone.trim() : null;
  const projectType = optionalValue(fields.projectType);
  const budget = optionalValue(fields.budget);
  const timeline = optionalValue(fields.timeline);

  // --- Timing -----------------------------------------------------------
  // Only enforced when the client supplied a duration. A visitor whose clock
  // failed should still be able to reach a human, so a missing value is not
  // treated as proof of a bot.
  if (startedAt !== undefined && startedAt < MIN_FILL_MS) {
    return NextResponse.json(SPY_ACKNOWLEDGEMENT, { status: 201 });
  }

  // --- Persistence -----------------------------------------------------
  if (!isSupabaseConfigured) {
    console.error(
      "[contact] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, and run supabase/schema.sql.",
    );
    return NextResponse.json(
      {
        error:
          "The enquiry form is not connected yet. Please email me directly and I will reply straight away.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "The enquiry form is temporarily unavailable." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      name: fields.name,
      email: fields.email,
      phone,
      // The brief's form has no company field; the column stays nullable and is
      // simply left unset rather than carrying a dead empty string.
      company: null,
      project_type: projectType as ContactProjectType,
      budget: budget as ContactBudgetRange,
      timeline: timeline as ContactTimelineRange,
      // The form no longer collects a subject, but the column is NOT NULL, so it
      // is derived from the chosen service. See `deriveSubject()`.
      subject: deriveSubject(projectType),
      message: fields.message,
      status: "new",
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[contact] insert failed:", error.message);
    // The visitor did nothing wrong — do not leak database detail.
    return NextResponse.json(
      {
        error:
          "Your message could not be saved. Please email me directly and I will reply straight away.",
      },
      { status: 500 },
    );
  }

  // Email notification is best-effort: the inquiry is already stored, so a
  // mail-provider failure must not turn a successful submission into an error.
  const subject = deriveSubject(projectType);
  const notification = await notifyNewInquiry({
    id: data.id,
    subject,
    name: fields.name,
    email: fields.email,
    phone,
    projectTypeLabel: projectTypeLabel(projectType) ?? null,
    budgetLabel: budgetLabel(budget) ?? null,
    timelineLabel: timelineLabel(timeline) ?? null,
    message: fields.message,
  });

  if (!notification.sent && notification.error) {
    console.warn("[contact] notification failed:", notification.error);
  }

  return NextResponse.json(
    { ok: true, id: data.id, notified: notification.sent },
    { status: 201 },
  );
}

/** Explicitly reject other verbs so the endpoint is POST-only. */
export function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}