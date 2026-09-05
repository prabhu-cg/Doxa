"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireCurrentProfile } from "./queries";
import { updateProfileSchema } from "./schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: {
  displayName: string;
  username?: string;
}): Promise<ActionResult> {
  const profile = await requireCurrentProfile();

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const username = parsed.data.username?.trim() || null;

  if (username) {
    const existing = await db.profile.findUnique({ where: { username } });
    if (existing && existing.id !== profile.id) {
      return { success: false, error: "That username is already taken" };
    }
  }

  await db.profile.update({
    where: { id: profile.id },
    data: { displayName: parsed.data.displayName, username },
  });

  revalidatePath("/profile");
  return { success: true };
}
