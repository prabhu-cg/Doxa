"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing } from "lucide-react";
import { followItem, unfollowItem } from "@/features/followers/actions";
import { Button } from "@/components/ui/button";

export function FollowButton({
  orgSlug,
  boardSlug,
  itemSlug,
  initialFollowing,
  initialCount,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  initialFollowing: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError(null);
    const nextFollowing = !following;
    setFollowing(nextFollowing);
    setCount((c) => c + (nextFollowing ? 1 : -1));

    const result = nextFollowing
      ? await followItem(orgSlug, boardSlug, itemSlug)
      : await unfollowItem(orgSlug, boardSlug, itemSlug);

    setPending(false);
    if (!result.success) {
      setFollowing(!nextFollowing);
      setCount((c) => c + (nextFollowing ? -1 : 1));
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant={following ? "secondary" : "outline"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        aria-pressed={following}
      >
        {following ? <BellRing /> : <Bell />}
        {following ? "Following" : "Follow"} · {count}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive w-full text-xs">
          {error}
        </p>
      ) : null}
    </>
  );
}
