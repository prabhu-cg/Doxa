"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unblockParticipant } from "@/features/moderation/actions";
import { Button } from "@/components/ui/button";

export function UnblockParticipantControl({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await unblockParticipant(slug, userId);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="sm" disabled={pending} onClick={onClick}>
        Unblock
      </Button>
      {error ? (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      ) : null}
    </>
  );
}
