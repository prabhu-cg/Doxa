"use client";

import { useState } from "react";
import { leaveOrganization } from "@/features/organizations/actions";
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

export function LeaveOrganizationDialog({
  slug,
  organizationName,
  disabled,
  disabledReason,
}: {
  slug: string;
  organizationName: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    setError(null);
    const result = await leaveOrganization(slug);
    // Success redirects (throws) before returning — only reachable on failure.
    if (!result.success) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive" disabled={disabled}>
            Leave organisation
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave {organizationName}?</DialogTitle>
          <DialogDescription>
            You&apos;ll lose access immediately. Someone else would need to add
            you back.
          </DialogDescription>
        </DialogHeader>
        {disabled && disabledReason ? (
          <p className="text-muted-foreground text-sm">{disabledReason}</p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={pending || disabled}
          >
            {pending ? "Leaving…" : "Leave organisation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
