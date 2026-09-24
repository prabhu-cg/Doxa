"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { addVote, removeVote } from "@/features/votes/actions";
import { cn } from "@/lib/utils";
import { expectReorder } from "@/lib/vote-reorder";

const chip =
  "vote-chip focus-visible:ring-ring relative flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg border text-[13px] leading-none font-bold tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed";

/**
 * The vote at the head of a grid row: one click, right where you are. Signed-out
 * visitors get the same chip as a link to sign in (and come back); someone who
 * can't vote yet (unconfirmed email, blocked) sees it disabled with the reason.
 */
export function VoteChip({
  orgSlug,
  boardSlug,
  itemSlug,
  initialVoted,
  initialCount,
  itemTitle,
  access,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  initialVoted: boolean;
  initialCount: number;
  itemTitle: string;
  access:
    | { kind: "open" }
    | { kind: "sign-in"; href: string }
    | { kind: "closed"; reason: string };
}) {
  const router = useRouter();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  // Which way the count last moved, so it rolls that way; null until you vote,
  // so the grid doesn't animate on load.
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  const body = (
    <>
      <ChevronUp aria-hidden="true" className="size-4" strokeWidth={2.5} />
      <span className="mt-0.5 overflow-hidden">
        <span
          key={count}
          data-dir={direction ?? undefined}
          className="vote-roll block"
        >
          {count}
        </span>
      </span>
    </>
  );
  const idle =
    "bg-background border-border text-foreground hover:border-primary hover:text-primary-text";

  if (access.kind === "sign-in") {
    return (
      <Link
        href={access.href}
        title="Sign in to vote"
        aria-label={`Sign in to vote for ${itemTitle} (${count} ${count === 1 ? "vote" : "votes"})`}
        className={cn(chip, idle)}
      >
        {body}
      </Link>
    );
  }

  if (access.kind === "closed") {
    return (
      <button
        type="button"
        disabled
        title={access.reason}
        aria-label={`${count} ${count === 1 ? "vote" : "votes"} — ${access.reason}`}
        className={cn(chip, "bg-muted text-muted-foreground opacity-70")}
      >
        {body}
      </button>
    );
  }

  async function onClick() {
    if (pending) return;
    setPending(true);
    const next = !voted;
    setVoted(next);
    setCount((c) => c + (next ? 1 : -1));
    setDirection(next ? "up" : "down");

    const result = next
      ? await addVote(orgSlug, boardSlug, itemSlug)
      : await removeVote(orgSlug, boardSlug, itemSlug);

    setPending(false);
    if (!result.success) {
      setVoted(!next);
      setCount((c) => c + (next ? -1 : 1));
      setDirection(next ? "down" : "up");
      toast.error(result.error);
      return;
    }
    expectReorder();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={voted}
      data-pulse={voted && direction === "up" ? "" : undefined}
      aria-label={`${voted ? "Remove your vote from" : "Vote for"} ${itemTitle}`}
      className={cn(
        chip,
        voted
          ? "bg-primary border-primary text-primary-foreground hover:bg-primary-hover"
          : idle,
      )}
    >
      {body}
    </button>
  );
}
