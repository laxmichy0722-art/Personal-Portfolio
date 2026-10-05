"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  getFillDurationMs,
  relaxFillTimer,
  resetFillTimer,
  startFillTimer,
} from "@/lib/fill-timer";
import {
  budgetOptions,
  contactSchema,
  projectTypeOptions,
  timelineOptions,
  UNSPECIFIED,
  type ContactInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Optional dropdowns carry an explicit "Not specified" entry, because Radix
 * `Select` cannot represent "nothing chosen" any other way. `POST /api/contact`
 * turns the sentinel back into `null` before the database write.
 */
const PROJECT_TYPE_FIELD = [
  { value: UNSPECIFIED, label: "Not specified" },
  ...projectTypeOptions,
];
const BUDGET_FIELD = [
  { value: UNSPECIFIED, label: "Not specified" },
  ...budgetOptions,
];
const TIMELINE_FIELD = [
  { value: UNSPECIFIED, label: "Not specified" },
  ...timelineOptions,
];

/**
 * Project enquiry form.
 *
 * Validation is shared with `POST /api/contact` via `contactSchema`, so the
 * client rules and the server rules cannot drift. The server re-validates
 * regardless — client validation is a UX affordance, never a control.
 *
 * Spam defences layered on top of validation: a honeypot field that humans
 * cannot see, and a minimum fill time that a bot will not wait out. Both are
 * enforced server-side; this component just supplies the raw signals.
 */
export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    startFillTimer();

    // Hold the earliest start time across tab switches, so a visitor who
    // begins a message in one tab and submits in another is not misread as a
    // bot that filled the form instantly.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") relaxFillTimer();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      // Every optional dropdown starts on the sentinel rather than a real value:
      // pre-selecting "Graphic Design" would silently invent an answer on behalf
      // of a visitor who may not know the term.
      projectType: UNSPECIFIED,
      budget: UNSPECIFIED,
      timeline: UNSPECIFIED,
      phone: "",
      message: "",
      website: "",
    },
  });

  const submitting = state.status === "submitting" || isSubmitting;

  // `useWatch` rather than `watch()`: `watch()` returns a new function every
  // render, which React Compiler cannot memoize, so it opts the whole component
  // out of compilation. `useWatch` subscribes to just these two fields and keeps
  // the select triggers in sync without that penalty.
  const [projectType, budget, timeline] = useWatch({
    control,
    name: ["projectType", "budget", "timeline"],
  });

  async function onSubmit(values: ContactInput) {
    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          startedAt: getFillDurationMs(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setState({
          status: "error",
          message:
            payload?.error ??
            "The message could not be sent. Please try again, or email me directly.",
        });
        toast.error("Inquiry not sent", {
          description:
            payload?.error ?? "Please try again, or email me directly.",
        });
        return;
      }

      setState({ status: "success" });
      resetFillTimer();
      reset();
      toast.success("Inquiry sent", {
        description: "Thanks — I read every message and usually reply within a day.",
      });
    } catch {
      const message =
        "Network error. Check your connection, or email me directly at the address on this page.";
      setState({ status: "error", message });
      toast.error("Inquiry not sent", { description: message });
    }
  }

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-lg border border-success/30 bg-success/5 p-8 sm:p-10"
      >
        <CheckCircle2 aria-hidden="true" className="size-7 text-success" />
        <div>
          <p className="text-lg font-semibold text-fg">
            Thanks — your inquiry is in.
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
            I read every message and usually reply within one working day. If
            it&apos;s urgent, reach me on WhatsApp or by phone.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xs"
          onClick={() => setState({ status: "idle" })}
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {state.status === "error" ? (
        <ErrorState
          title="Could not send your inquiry"
          description={state.message}
        />
      ) : null}

      {/* Field order follows the brief: name, email, phone, service, budget,
          timeline — then the project details at full width. The two-column grid
          fills cleanly without reordering anything. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="name"
          label="Full Name"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="rounded-xs"
            {...register("name")}
          />
        </Field>

        <Field
          id="email"
          label="Email Address"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="rounded-xs"
            {...register("email")}
          />
        </Field>

        <Field
          id="phone"
          label="Phone / WhatsApp"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className="rounded-xs"
            {...register("phone")}
          />
        </Field>

        <Field
          id="projectType"
          label="Service Needed"
          error={errors.projectType?.message}
        >
          <SelectField
            id="projectType"
            options={PROJECT_TYPE_FIELD}
            invalid={Boolean(errors.projectType)}
            describedBy={errors.projectType ? "projectType-error" : undefined}
            value={projectType ?? UNSPECIFIED}
            onValueChange={(value) =>
              setValue("projectType", value as ContactInput["projectType"], {
                shouldValidate: true,
              })
            }
          />
        </Field>

        <Field id="budget" label="Budget Range" error={errors.budget?.message}>
          <SelectField
            id="budget"
            options={BUDGET_FIELD}
            invalid={Boolean(errors.budget)}
            describedBy={errors.budget ? "budget-error" : undefined}
            value={budget ?? UNSPECIFIED}
            onValueChange={(value) =>
              setValue("budget", value as ContactInput["budget"], {
                shouldValidate: true,
              })
            }
          />
        </Field>

        <Field
          id="timeline"
          label="Timeline"
          error={errors.timeline?.message}
        >
          <SelectField
            id="timeline"
            options={TIMELINE_FIELD}
            invalid={Boolean(errors.timeline)}
            describedBy={errors.timeline ? "timeline-error" : undefined}
            value={timeline ?? UNSPECIFIED}
            onValueChange={(value) =>
              setValue("timeline", value as ContactInput["timeline"], {
                shouldValidate: true,
              })
            }
          />
        </Field>
      </div>

      <Field
        id="message"
        label="Project Details"
        error={errors.message?.message}
        required
      >
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell me about your project — what you're building, who it's for, and anything else I should know."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="resize-y rounded-xs"
          {...register("message")}
        />
      </Field>

      {/*
        Honeypot. Hidden from sighted users and from assistive technology, and
        removed from the tab order. A real person never fills this in; the
        server discards any submission that does.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Your details are used only to reply to this inquiry. Nothing is
            shared or sold.
          </span>
        </p>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="rounded-xs sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send aria-hidden="true" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** Label + control + error message, wired for screen readers. */
function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-fg">
        {label}
        {required ? (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs text-fg-subtle">(optional)</span>
        )}
      </Label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Radix Select wired to React Hook Form.
 *
 * Radix renders its trigger as a button, so the visible label is associated by
 * `id` rather than by a wrapping `<label>` — a wrapper would double up the
 * click target and break the announcement. `aria-invalid` and
 * `aria-describedby` are forwarded so validation state reaches assistive tech
 * exactly as it does for the text inputs.
 */
function SelectField({
  id,
  options,
  value,
  onValueChange,
  invalid,
  describedBy,
}: {
  id: string;
  options: readonly { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const label = options.find((option) => option.value === value)?.label;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="h-10 w-full rounded-xs"
      >
        <SelectValue placeholder="Select an option">{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}