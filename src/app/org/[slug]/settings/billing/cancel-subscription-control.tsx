"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "@/features/billing/actions";
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

export function CancelSubscriptionControl({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    setError(null);
    const result = await cancelSubscription(orgSlug);
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
          <Button variant="outline" className="text-destructive">
            Cancel plan
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your plan?</DialogTitle>
          <DialogDescription>
            You&apos;ll keep your current plan&apos;s features until the end of
            the billing period, then move to Free.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Keep plan</Button>} />
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Cancelling…" : "Cancel plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
