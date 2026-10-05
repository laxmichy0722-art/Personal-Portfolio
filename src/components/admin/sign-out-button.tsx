"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/** Ends the Supabase session and returns to the login screen. */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);

    try {
      const supabase = createClient();
      await supabase?.auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={signOut}
      disabled={busy}
      className="rounded-xs"
    >
      <LogOut aria-hidden="true" />
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}