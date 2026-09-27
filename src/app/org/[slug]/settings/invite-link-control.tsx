"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createInviteLink,
  regenerateInviteLink,
  revokeInviteLink,
} from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";
import { PublicLinkField } from "@/components/public-link";
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

type Result = { success: boolean; error?: string };

/**
 * The one quick-win alternative to per-email invitations (there's no email
 * delivery in this app yet — see README's "Not implemented" note): a
 * single reusable "join this organisation" link, shown, created,
 * regenerated or revoked from here. Owners/admins only — gated by the
 * caller passing this in at all (see settings/page.tsx).
 */
export function InviteLinkControl({
  slug,
  token,
}: {
  slug: string;
  token: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<Result>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  if (!token) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Anyone with this link can join as a member — no email delivery
          required.
        </p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => createInviteLink(slug))}
        >
          {pending ? "Creating…" : "Create invite link"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        Anyone with this link can join as a member — no email delivery
        required.
      </p>
      <PublicLinkField path={`/join/${token}`} />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => regenerateInviteLink(slug))}
        >
          Regenerate
        </Button>
        <Dialog>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={pending}
              >
                Revoke
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke the invite link?</DialogTitle>
              <DialogDescription>
                The current link stops working immediately. You can create a
                new one any time.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() => run(() => revokeInviteLink(slug))}
              >
                {pending ? "Revoking…" : "Revoke link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
