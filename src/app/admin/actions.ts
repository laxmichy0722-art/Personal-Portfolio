"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateMessageSchema } from "@/lib/validations";
import type { ContactMessageRow } from "@/types/database";

/**
 * The columns `updateMessageStatus` is allowed to write.
 *
 * Typed as a `Pick` rather than an index signature so the Supabase client still
 * checks the keys: a typo is a compile error instead of a silently ignored
 * column.
 */
type MessageStatusPatch = Pick<ContactMessageRow, "status"> &
  Partial<Pick<ContactMessageRow, "read_at" | "replied_at" | "archived_at">>;

/**
 * Admin server actions for `contact_messages`.
 *
 * Every action re-authenticates before touching the service-role client. The
 * proxy and layout checks are UX; these checks are what actually prevent an
 * unauthenticated write, because Server Actions are directly reachable HTTP
 * endpoints and are not covered by layout rendering.
 */

/** Resolves the service-role client, but only for a signed-in user. */
async function authorise() {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  return { admin, email: user.email ?? null };
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Marks a message as read the first time it is opened. */
export async function markMessageRead(id: string): Promise<ActionResult> {
  const auth = await authorise();
  if (!auth) return { ok: false, message: "Not authorised." };

  const { error } = await auth.admin
    .from("contact_messages")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  return { ok: true, message: "Marked as read." };
}

/** Moves a message between new, read, replied and archived. */
export async function updateMessageStatus(
  input: unknown,
): Promise<ActionResult> {
  const parsed = updateMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const auth = await authorise();
  if (!auth) return { ok: false, message: "Not authorised." };

  const { id, status } = parsed.data;
  const now = new Date().toISOString();

  // The timestamps record *when* a state was reached, so the admin can tell
  // "never looked at" from "read three weeks ago". They are only ever set, never
  // cleared: reopening an archived message must not erase the fact it was
  // archived at a known time.
  const patch: MessageStatusPatch = { status };
  if (status === "read") patch.read_at = now;
  if (status === "replied") {
    patch.replied_at = now;
    // A replied message has necessarily been read.
    patch.read_at = now;
  }
  if (status === "archived") patch.archived_at = now;

  const { data, error } = await auth.admin
    .from("contact_messages")
    .update(patch)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  // No returned row means nothing matched — a stale inbox tab, not a failure.
  if (!data) return { ok: false, message: "Message not found." };

  revalidatePath("/admin");
  return { ok: true, message: `Moved to ${status}.` };
}

/** Permanently removes a message. */
export async function deleteMessage(id: string): Promise<ActionResult> {
  const auth = await authorise();
  if (!auth) return { ok: false, message: "Not authorised." };

  const { error } = await auth.admin
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  return { ok: true, message: "Deleted." };
}

/** Signs the current user out. */
export async function signOutAction(): Promise<ActionResult> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Not configured." };

  await supabase.auth.signOut();
  return { ok: true, message: "Signed out." };
}