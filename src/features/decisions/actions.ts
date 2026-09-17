"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireItemForOrgMember } from "@/features/items/queries";
import { logActivity } from "@/features/activity/log";
import { logAuditEvent } from "@/features/audit-log/log";
import { recordDecisionSchema } from "./schema";
import { canRecordDecision } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Records a new Decision for an Item. Deliberately create-only — there is
 * no updateDecision/deleteDecision. Changing your mind means recording
 * another Decision, which becomes the new "current" one while the old row
 * stays in the Item's history exactly as it was — see the Decision model
 * doc comment in prisma/schema.prisma for why this is append-only.
 */
export async function recordDecision(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  input: {
    type: string;
    rationale: string;
    targetDate?: string;
    internalNotes?: string;
    roadmapStage?: string;
  },
): Promise<ActionResult> {
  const { profile, membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canRecordDecision(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can record a decision",
    };
  }

  const parsed = recordDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.$transaction([
    db.decision.create({
      data: {
        organizationId: membership.organization.id,
        itemId: item.id,
        type: parsed.data.type,
        rationale: parsed.data.rationale,
        targetDate: parsed.data.targetDate,
        internalNotes: parsed.data.internalNotes,
        roadmapStage: parsed.data.roadmapStage,
        createdById: profile.id,
      },
    }),
    logActivity(db, {
      itemId: item.id,
      actorId: profile.id,
      type: "DECISION_RECORDED",
      data: { decisionType: parsed.data.type },
    }),
    logAuditEvent(db, {
      organizationId: membership.organization.id,
      actorId: profile.id,
      action: "DECISION_RECORDED",
      targetType: "Item",
      targetId: item.id,
      data: { decisionType: parsed.data.type, itemTitle: item.title },
    }),
  ]);

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}/${itemSlug}`);
  revalidatePath(`/org/${orgSlug}/roadmap`);
  return { success: true };
}
