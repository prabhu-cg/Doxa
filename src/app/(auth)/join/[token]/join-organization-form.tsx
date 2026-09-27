"use client";

import { useState } from "react";
import { joinOrganizationViaInvite } from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";

/** A successful join redirects server-side (see joinOrganizationViaInvite),
 * so this only ever has to handle the failure case coming back. */
export function JoinOrganizationForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onJoin() {
    setPending(true);
    setError(null);
    const result = await joinOrganizationViaInvite(token);
    setPending(false);
    if (!result.success) setError(result.error);
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button
        type="button"
        className="w-full"
        disabled={pending}
        onClick={onJoin}
      >
        {pending ? "Joining…" : "Join organisation"}
      </Button>
    </div>
  );
}
