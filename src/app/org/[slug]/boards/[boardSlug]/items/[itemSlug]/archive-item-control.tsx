"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveItem, restoreItem } from "@/features/items/actions";
import { Button } from "@/components/ui/button";

export function ArchiveItemControl({
  orgSlug,
  boardSlug,
  itemSlug,
  archived,
  onDone,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  archived: boolean;
  /** Called after a successful archive or restore. */
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = archived
      ? await restoreItem(orgSlug, boardSlug, itemSlug)
      : await archiveItem(orgSlug, boardSlug, itemSlug);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone?.();
  }

  return (
    <div className="space-y-2">
      <Button
        variant={archived ? "outline" : "destructive"}
        onClick={onClick}
        disabled={pending}
      >
        {pending ? "Working…" : archived ? "Restore item" : "Archive item"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
