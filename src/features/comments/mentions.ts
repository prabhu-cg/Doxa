import "server-only";
import { db } from "@/server/db";

const MENTION_PATTERN = /@([a-zA-Z0-9_-]{1,32})/g;

/**
 * Extracts `@username` tokens from a comment body and resolves them to
 * Profiles that are members of the given organisation — anything else (a
 * typo, a non-member username, a stray "@" in prose) is left as inert
 * text. Called once at write time; the resulting CommentMention rows are
 * what the app reads afterward, never a re-parse of `body` — see
 * "Mentions" in the Phase 3 brief.
 */
export async function resolveMentionedProfileIds(
  organizationId: string,
  body: string,
): Promise<string[]> {
  const usernames = [
    ...new Set(
      [...body.matchAll(MENTION_PATTERN)]
        .map((match) => match[1])
        .filter((username): username is string => !!username),
    ),
  ];
  if (usernames.length === 0) return [];

  const profiles = await db.profile.findMany({
    where: {
      username: { in: usernames },
      memberships: { some: { organizationId } },
    },
    select: { id: true },
  });
  return profiles.map((p) => p.id);
}
