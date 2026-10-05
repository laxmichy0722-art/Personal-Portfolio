import { getNotificationEmail } from "@/lib/env";
import { siteConfig } from "@/data/site";

/**
 * Email notifications for new project inquiries.
 *
 * Talks to Resend's REST API over `fetch` rather than pulling in an SDK — the
 * request is a single JSON POST, so a dependency would not earn its keep.
 *
 * Entirely optional: with no credentials configured this is a no-op and the
 * inquiry is still stored in Supabase. `POST /api/contact` therefore treats a
 * notification failure as non-fatal.
 */

export interface InquiryNotification {
  id: string;
  name: string;
  email: string;
  /**
   * Summary line for the inbox and the mail subject.
   *
   * Derived from the selected service rather than written by the visitor — the
   * form dropped its own subject field, but the database column is NOT NULL.
   */
  subject: string;
  phone?: string | null;
  /** Human-readable labels, resolved by the caller from the stored enum values. */
  projectTypeLabel?: string | null;
  budgetLabel?: string | null;
  timelineLabel?: string | null;
  message: string;
}

export interface NotificationResult {
  sent: boolean;
  error?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Only these characters reach the HTML body, so there is no injection risk. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function notifyNewInquiry(
  inquiry: InquiryNotification,
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = getNotificationEmail();

  if (!apiKey || !from || !to) {
    return { sent: false };
  }

  // Every enquiry gets a complete row set, with an em dash standing in for an
  // optional field the visitor skipped, so the table reads predictably instead of
  // silently varying in height between messages.
  const rows: [string, string][] = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Service", inquiry.projectTypeLabel ?? "—"],
    ["Budget", inquiry.budgetLabel ?? "—"],
    ["Timeline", inquiry.timelineLabel ?? "—"],
    ["Phone", inquiry.phone || "—"],
  ];

  // Inline-styled and table-based: email clients ignore most CSS. The palette is
  // hardcoded to the dark theme tokens rather than read from CSS, because there is
  // no stylesheet in an email client. These must match the `@theme` values in
  // `src/app/globals.css`.
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;background:#0D0D0D;color:#FFFFFF;padding:32px;border-radius:8px;border:1px solid #262626">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#888888">New project inquiry</p>
      <h1 style="margin:0 0 24px;font-size:22px;font-weight:600">${escapeHtml(inquiry.subject)}</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 16px 8px 0;color:#888888;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
            <td style="padding:8px 0;color:#FFFFFF">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #262626">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#888888">Project details</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#FFFFFF;white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#888888">Reply directly to this email to answer ${escapeHtml(inquiry.name)}.</p>
    </div>
  `;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiry.email,
        subject: `New inquiry: ${inquiry.subject} — ${inquiry.name}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        sent: false,
        error: `Resend responded ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/** Reply address shown in the notification, for clarity in the mail client. */
export const notificationReplyTo = siteConfig.email;