"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  NAME_RACE_MESSAGE,
  nameTakenMessage,
  restoreBlockedMessage,
} from "@/lib/names";
import { insertOrNull } from "@/server/db-errors";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { requireItemForOrgMember } from "@/features/items/queries";
import { scoreCriterionSchema, scoreValueSchema } from "./schema";
import { generateUniqueScoreCriterionSlug } from "./slug";
import { isScoreCriterionNameTaken } from "./queries";
import { canManageScoreCriteria, canScoreItem } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createScoreCriterion(
  orgSlug: string,
  input: { name: string; description?: string; weight: number },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageScoreCriteria(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage scoring criteria",
    };
  }

  const parsed = scoreCriterionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (
    await isScoreCriterionNameTaken(
      membership.organization.id,
      parsed.data.name,
    )
  ) {
    return {
      success: false,
      error: nameTakenMessage("scoring criterion", parsed.data.name),
    };
  }

  const slug = await generateUniqueScoreCriterionSlug(
    membership.organization.id,
    parsed.data.name,
  );

  const highest = await db.scoreCriterion.findFirst({
    where: { organizationId: membership.organization.id },
    orderBy: { sortOrder: "desc" },
  });

  const created = await insertOrNull(() =>
    db.scoreCriterion.create({
      data: {
        organizationId: membership.organization.id,
        name: parsed.data.name,
        description: parsed.data.description,
        weight: parsed.data.weight,
        slug,
        sortOrder: (highest?.sortOrder ?? -1) + 1,
      },
    }),
  );
  if (!created) return { success: false, error: NAME_RACE_MESSAGE };

  revalidatePath(`/org/${orgSlug}/settings/scoring`);
  return { success: true };
}

export async function updateScoreCriterion(
  orgSlug: string,
  criterionId: string,
  input: { name: string; description?: string; weight: number },
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageScoreCriteria(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage scoring criteria",
    };
  }

  const parsed = scoreCriterionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (
    await isScoreCriterionNameTaken(
      membership.organization.id,
      parsed.data.name,
      criterionId,
    )
  ) {
    return {
      success: false,
      error: nameTakenMessage("scoring criterion", parsed.data.name),
    };
  }

  const { count } = await db.scoreCriterion.updateMany({
    where: { id: criterionId, organizationId: membership.organization.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      weight: parsed.data.weight,
    },
  });
  if (count === 0) return { success: false, error: "Criterion not found" };

  revalidatePath(`/org/${orgSlug}/settings/scoring`);
  return { success: true };
}

async function setArchived(
  orgSlug: string,
  criterionId: string,
  archivedAt: Date | null,
): Promise<ActionResult> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageScoreCriteria(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can manage scoring criteria",
    };
  }

  if (archivedAt === null) {
    const current = await db.scoreCriterion.findFirst({
      where: { id: criterionId, organizationId: membership.organization.id },
      select: { name: true },
    });
    if (!current)
      return { success: false, error: "Scoring criterion not found" };
    if (
      await isScoreCriterionNameTaken(
        membership.organization.id,
        current.name,
        criterionId,
      )
    ) {
      return {
        success: false,
        error: restoreBlockedMessage("scoring criterion", current.name),
      };
    }
  }

  const { count } = await db.scoreCriterion.updateMany({
    where: { id: criterionId, organizationId: membership.organization.id },
    data: { archivedAt },
  });
  if (count === 0) return { success: false, error: "Criterion not found" };

  revalidatePath(`/org/${orgSlug}/settings/scoring`);
  return { success: true };
}

export async function archiveScoreCriterion(
  orgSlug: string,
  criterionId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, criterionId, new Date());
}

export async function restoreScoreCriterion(
  orgSlug: string,
  criterionId: string,
): Promise<ActionResult> {
  return setArchived(orgSlug, criterionId, null);
}

/** Sets (upserts) one Item's score against one criterion. Both
 * `boardSlug`/`itemSlug` and `criterionId` are re-verified against this
 * organisation before writing — a client-supplied criterion id is never
 * trusted at face value, same rule as itemTypeId/statusId in
 * features/items/actions.ts. */
export async function setItemScore(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  criterionId: string,
  value: number,
): Promise<ActionResult> {
  const { membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canScoreItem(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to score items",
    };
  }

  const parsedValue = scoreValueSchema.safeParse(value);
  if (!parsedValue.success) {
    return {
      success: false,
      error: parsedValue.error.issues[0]?.message ?? "Invalid score",
    };
  }

  const criterion = await db.scoreCriterion.findFirst({
    where: {
      id: criterionId,
      organizationId: membership.organization.id,
      archivedAt: null,
    },
  });
  if (!criterion) return { success: false, error: "Choose a valid criterion" };

  await db.itemScore.upsert({
    where: { itemId_criterionId: { itemId: item.id, criterionId } },
    create: { itemId: item.id, criterionId, value: parsedValue.data },
    update: { value: parsedValue.data },
  });

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}

export async function clearItemScore(
  orgSlug: string,
  boardSlug: string,
  itemSlug: string,
  criterionId: string,
): Promise<ActionResult> {
  const { membership, item } = await requireItemForOrgMember(
    orgSlug,
    boardSlug,
    itemSlug,
  );
  if (!canScoreItem(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to score items",
    };
  }

  await db.itemScore.deleteMany({
    where: { itemId: item.id, criterionId },
  });

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}/items/${itemSlug}`);
  return { success: true };
}
