import type { Metadata } from "next";

import { MessageInbox } from "@/components/admin/message-inbox";
import { Section } from "@/components/ui/section";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactMessage } from "@/types/database";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

/**
 * Column order matches how an inbox gets triaged.
 *
 * `timeline` sits directly after `budget` so urgency — the fastest signal for
 * which enquiry to answer first — is readable from the row without opening it.
 */
const SELECT = [
  "id",
  "name",
  "email",
  "phone",
  "subject",
  "project_type",
  "budget",
  "timeline",
  "message",
  "status",
  "created_at",
] as const;

export default async function AdminDashboardPage() {
  let messages: ContactMessage[] = [];
  let error: string | null = null;

  const admin = createAdminClient();

  if (admin) {
    const { data, error: queryError } = await admin
      .from("contact_messages")
      .select(SELECT.join(", "))
      .order("created_at", { ascending: false })
      .limit(200);

    if (queryError) {
      error = queryError.message;
    } else {
      messages = (data ?? []) as unknown as ContactMessage[];
    }
  }

  const unread = messages.filter((message) => message.status === "new").length;

  return (
    <Section bordered={false} className="pb-24 pt-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="eyebrow mb-4">Dashboard</p>
          <h1 className="text-display-sm text-fg">Enquiries</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
            Submissions from the public contact form, newest first. Select a
            message to read it in full and change its status.
          </p>
        </div>

        {messages.length > 0 ? (
          <dl className="flex gap-8">
            <div>
              <dt className="eyebrow">Total</dt>
              <dd className="mt-1.5 font-mono text-2xl text-fg">
                {String(messages.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Unread</dt>
              <dd
                className={`mt-1.5 font-mono text-2xl ${
                  unread > 0 ? "text-accent" : "text-fg"
                }`}
              >
                {String(unread).padStart(2, "0")}
              </dd>
            </div>
          </dl>
        ) : null}
      </header>

      <div className="mt-10">
        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
            <p className="text-sm font-medium text-fg">
              Could not load enquiries
            </p>
            <p className="mt-2 font-mono text-xs text-fg-muted">{error}</p>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Most likely the table does not exist yet. Run{" "}
              <code className="font-mono text-xs text-accent">
                supabase/schema.sql
              </code>{" "}
              in the Supabase SQL editor.
            </p>
          </div>
        ) : (
          <MessageInbox messages={messages} />
        )}
      </div>
    </Section>
  );
}