"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveBoard, restoreBoard } from "@/features/boards/actions";
import { Button } from "@/components/ui/button";

export function ArchiveBoardControl({
  orgSlug,
  boardSlug,
  archived,
}: {
  orgSlug: string;
  boardSlug: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = archived
      ? await restoreBoard(orgSlug, boardSlug)
      : await archiveBoard(orgSlug, boardSlug);
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
        {pending ? "Working…" : archived ? "Restore board" : "Archive board"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
