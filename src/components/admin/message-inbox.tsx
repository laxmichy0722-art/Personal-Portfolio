"use client";

import { useMemo, useState, useTransition } from "react";
import { Archive, Mail, MailOpen, Reply, Trash2 } from "lucide-react";

import {
  deleteMessage,
  updateMessageStatus,
  type ActionResult,
} from "@/app/admin/actions";
import type { ContactMessage } from "@/types/database";
import {
  budgetLabel,
  LEGACY_BUDGET_LABELS,
  LEGACY_PROJECT_TYPE_LABELS,
  projectTypeLabel,
  timelineLabel,
} from "@/lib/validations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/section";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

type Tab = (typeof STATUS_TABS)[number]["value"];

const statusStyles: Record<string, string> = {
  new: "border-accent text-accent",
  read: "border-border text-fg-subtle",
  replied: "border-border text-fg-muted",
  archived: "border-border text-fg-subtle",
};

/**
 * Enquiry inbox.
 *
 * Actions are server actions, so each button calls straight into
 * `admin/actions.ts` — the browser never receives a database credential, and
 * every write is re-authenticated server-side.
 */
export function MessageInbox({ messages }: { messages: ContactMessage[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<ActionResult | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const base: Record<Tab, number> = {
      all: messages.length,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
    for (const message of messages) {
      if (message.status in base) base[message.status as Tab] += 1;
    }
    return base;
  }, [messages]);

  const visible = useMemo(
    () => (tab === "all" ? messages : messages.filter((m) => m.status === tab)),
    [messages, tab],
  );

  function run(id: string, action: () => Promise<ActionResult>) {
    setPendingId(id);
    setNotice(null);

    startTransition(async () => {
      const result = await action();
      setNotice(result);
      setPendingId(null);
      if (!result.ok) setExpanded((current) => current);
    });
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter messages by status"
        className="flex flex-wrap gap-2"
      >
        {STATUS_TABS.map((item) => {
          const active = tab === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-xs border px-3.5 py-2 text-sm transition-colors",
                active
                  ? "border-accent text-fg"
                  : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              {item.label}
              <span className="font-mono text-[0.6875rem] text-fg-subtle">
                {String(counts[item.value]).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {notice ? (
        <p
          role="status"
          className={cn(
            "mt-6 rounded-xs border px-4 py-3 text-sm",
            notice.ok
              ? "border-border bg-surface-hover text-fg-muted"
              : "border-destructive/40 bg-destructive/10 text-fg",
          )}
        >
          {notice.message}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "message" : "messages"}
        {tab === "all" ? "" : ` marked ${tab}`}.
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-bg-elevated px-6 py-14 text-center">
          <p className="text-sm text-fg">Nothing here yet</p>
          <p className="mt-2 text-sm text-fg-muted">
            {messages.length === 0
              ? "No enquiries have been submitted. Submissions from the contact form appear here immediately."
              : `No messages are marked ${tab}.`}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-px overflow-hidden rounded-lg border border-border bg-border">
          {visible.map((message) => {
            const isOpen = expanded === message.id;
            const busy = pendingId === message.id;

            return (
              <li key={message.id} className="bg-bg-elevated">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : message.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface-hover sm:p-6"
                >
                  <span className="mt-0.5 shrink-0">
                    {message.status === "new" ? (
                      <Mail aria-hidden="true" className="size-4 text-accent" />
                    ) : (
                      <MailOpen
                        aria-hidden="true"
                        className="size-4 text-fg-subtle"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-fg">
                        {message.name}
                      </span>
                      <span className="font-mono text-xs text-fg-subtle">
                        {message.email}
                      </span>
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Tag>{message.subject}</Tag>
                      <span
                        className={cn(
                          "rounded-xs border px-2.5 py-1 font-mono text-[0.6875rem]",
                          statusStyles[message.status] ?? statusStyles.read,
                        )}
                      >
                        {message.status}
                      </span>
                    </span>

                    {!isOpen ? (
                      <span className="mt-2.5 line-clamp-1 block text-sm text-fg-muted">
                        {message.message}
                      </span>
                    ) : null}
                  </span>

                  <time
                    dateTime={message.created_at}
                    className="shrink-0 font-mono text-xs text-fg-subtle"
                  >
                    {new Date(message.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </button>

                {isOpen ? (
                  <div className="border-t border-border px-5 pb-6 pt-5 sm:px-6">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-fg">
                      {message.message}
                    </p>

                    <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {[
                        {
                          label: "Email",
                          value: message.email,
                          href: `mailto:${message.email}`,
                        },
                        message.phone
                          ? { label: "Phone", value: message.phone, href: `tel:${message.phone}` }
                          : null,
                        {
                          label: "Service",
                          value:
                            projectTypeLabel(message.project_type) ??
                            (message.project_type
                              ? LEGACY_PROJECT_TYPE_LABELS[message.project_type]
                              : undefined) ??
                            "—",
                        },
                        {
                          label: "Budget",
                          // `budgetLabel` only knows the five current bands, so
                          // fall back to the legacy table for older rows.
                          value:
                            budgetLabel(message.budget) ??
                            (message.budget
                              ? LEGACY_BUDGET_LABELS[message.budget]
                              : undefined) ??
                            "—",
                        },
                        {
                          label: "Timeline",
                          value: timelineLabel(message.timeline) ?? "—",
                        },
                        { label: "Received", value: message.created_at },
                      ]
                        .filter((row): row is { label: string; value: string; href?: string } =>
                          row !== null,
                        )
                        .map((row) => (
                          <div key={row.label}>
                            <dt className="eyebrow">{row.label}</dt>
                            <dd className="mt-1.5 break-words text-sm text-fg">
                              {row.href ? (
                                <a
                                  href={row.href}
                                  className="underline underline-offset-4 hover:text-accent"
                                >
                                  {row.value}
                                </a>
                              ) : (
                                row.value
                              )}
                            </dd>
                          </div>
                        ))}
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-xs"
                      >
                        <a
                          href={`mailto:${message.email}?subject=${encodeURIComponent(
                            `Re: ${message.subject}`,
                          )}`}
                        >
                          <Mail aria-hidden="true" />
                          Reply
                        </a>
                      </Button>

                      {message.status === "archived" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          className="rounded-xs"
                          onClick={() =>
                            run(message.id, () =>
                              updateMessageStatus({
                                id: message.id,
                                status: "read",
                              }),
                            )
                          }
                        >
                          <MailOpen aria-hidden="true" />
                          Unarchive
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          className="rounded-xs"
                          onClick={() =>
                            run(message.id, () =>
                              updateMessageStatus({
                                id: message.id,
                                status: "archived",
                              }),
                            )
                          }
                        >
                          <Archive aria-hidden="true" />
                          Archive
                        </Button>
                      )}

                      {message.status !== "replied" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          className="rounded-xs"
                          onClick={() =>
                            run(message.id, () =>
                              updateMessageStatus({
                                id: message.id,
                                status: "replied",
                              }),
                            )
                          }
                        >
                          <Reply aria-hidden="true" />
                          Mark Replied
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        className="rounded-xs text-destructive hover:bg-destructive/10"
                        onClick={() => run(message.id, () => deleteMessage(message.id))}
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}