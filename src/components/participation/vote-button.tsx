"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError(null);
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
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant={voted ? "default" : "outline"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        aria-pressed={voted}
      >
        <ChevronUp strokeWidth={2.5} />
        {count} {count === 1 ? "vote" : "votes"}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive w-full text-xs">
          {error}
        </p>
      ) : null}
    </>
  );
}
