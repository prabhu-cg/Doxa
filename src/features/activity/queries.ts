import "server-only";
import { db } from "@/server/db";
import type { ItemActivity, Profile } from "@/generated/prisma/client";

export type ActivityWithActor = ItemActivity & { actor: Profile | null };

export async function listActivityForItem(
  itemId: string,
): Promise<ActivityWithActor[]> {
  return db.itemActivity.findMany({
    where: { itemId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
  });
}
