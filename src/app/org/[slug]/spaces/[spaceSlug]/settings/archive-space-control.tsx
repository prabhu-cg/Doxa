"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveSpace, restoreSpace } from "@/features/spaces/actions";
import { Button } from "@/components/ui/button";

export function ArchiveSpaceControl({
  orgSlug,
  spaceSlug,
  archived,
}: {
  orgSlug: string;
  spaceSlug: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = archived
      ? await restoreSpace(orgSlug, spaceSlug)
      : await archiveSpace(orgSlug, spaceSlug);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        variant={archived ? "outline" : "destructive"}
        onClick={onClick}
        disabled={pending}
      >
        {pending ? "Working…" : archived ? "Restore space" : "Archive space"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
