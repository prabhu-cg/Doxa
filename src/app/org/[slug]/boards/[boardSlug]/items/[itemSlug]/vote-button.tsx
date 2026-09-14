"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addVote, removeVote } from "@/features/votes/actions";
import { Button } from "@/components/ui/button";

export function VoteButton({
  orgSlug,
  boardSlug,
  itemSlug,
  initialVoted,
  initialCount,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  initialVoted: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) return;
    setPending(true);
    const nextVoted = !voted;
    setVoted(nextVoted);
    setCount((c) => c + (nextVoted ? 1 : -1));

    const result = nextVoted
      ? await addVote(orgSlug, boardSlug, itemSlug)
      : await removeVote(orgSlug, boardSlug, itemSlug);

    setPending(false);
    if (!result.success) {
      setVoted(!nextVoted);
      setCount((c) => c + (nextVoted ? -1 : 1));
      return;
    }
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={voted ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={pending}
      aria-pressed={voted}
    >
      ▲ {count} {count === 1 ? "vote" : "votes"}
    </Button>
  );
}
