import Link from "next/link";
import type { Viewer } from "@/features/participation/access";
import { authPath } from "@/lib/safe-next";

/**
 * What to tell a visitor who can't (yet) take part, or nothing when they can.
 * `action` finishes the sentence: "…to vote", "…to comment".
 */
export function ParticipationNotice({
  viewer,
  next,
  action,
}: {
  viewer: Viewer;
  /** The page to come back to after signing in. */
  next: string;
  action: string;
}) {
  switch (viewer.status) {
    case "active":
      return null;
    case "anonymous":
      return (
        <>
          <Link
            href={authPath("login", next)}
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>{" "}
          or{" "}
          <Link
            href={authPath("signup", next)}
            className="text-foreground underline underline-offset-4"
          >
            create an account
          </Link>{" "}
          to {action}.
        </>
      );
    case "unverified":
      return (
        <>
          Confirm your email address to {action} — we sent you a link when you
          signed up.
        </>
      );
    case "blocked":
      return <>You can&apos;t take part in this community.</>;
  }
}
