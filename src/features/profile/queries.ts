import "server-only";
import { db } from "@/server/db";
import { requireAuthenticatedSupabaseUser } from "@/features/auth/queries";
import type { Profile } from "@/generated/prisma/client";

/**
 * The signup trigger (see prisma/migrations) provisions a Profile row for
 * every new auth user, but a page can theoretically render in the brief
 * window before that trigger commits. This fallback makes that race
 * harmless instead of a broken page.
 */
async function getOrCreateProfile(userId: string, email: string | undefined) {
  const existing = await db.profile.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const fallbackDisplayName = email?.split("@")[0] ?? "there";
  return db.profile.upsert({
    where: { id: userId },
    create: { id: userId, displayName: fallbackDisplayName },
    update: {},
  });
}

export async function requireCurrentProfile(): Promise<Profile> {
  const user = await requireAuthenticatedSupabaseUser();
  return getOrCreateProfile(user.id, user.email);
}
