"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeMember } from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RemoveMemberControl({
  slug,
  membershipId,
  memberName,
}: {
  slug: string;
  membershipId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    setError(null);
    const result = await removeMember(slug, membershipId);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-destructive">
            Remove
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {memberName}?</DialogTitle>
          <DialogDescription>
            They&apos;ll lose access to this organisation immediately.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Removing…" : "Remove member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
