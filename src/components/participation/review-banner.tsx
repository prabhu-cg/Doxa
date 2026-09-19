"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveSubmission,
  declineSubmission,
} from "@/features/moderation/actions";
import { Button } from "@/components/ui/button";

/**
 * Shown to the team on a community submission that hasn't been approved.
 * Until it is, only the team and the person who submitted it can see it.
 */
export function ReviewBanner({
  orgSlug,
  boardSlug,
  itemSlug,
  authorName,
  canModerate,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  authorName: string;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "approve" | "decline") {
    if (action === "decline" && !window.confirm("Decline and remove this?")) {
      return;
    }
    setPending(true);
    setError(null);
    const result =
      action === "approve"
        ? await approveSubmission(orgSlug, boardSlug, itemSlug)
        : await declineSubmission(orgSlug, boardSlug, itemSlug);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (action === "decline")
      router.push(`/org/${orgSlug}/boards/${boardSlug}`);
    else router.refresh();
  }

  return (
    <div
      role="status"
      className="bg-accent/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium">Waiting for review</p>
        <p className="text-muted-foreground text-xs">
          {authorName} submitted this from the public board. It stays hidden
          from everyone else until it is approved.
        </p>
        {error ? (
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
      </div>
      {canModerate ? (
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => run("approve")}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run("decline")}
          >
            Decline
          </Button>
        </div>
      ) : null}
    </div>
  );
}
