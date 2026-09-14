"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { requireBoardForOrgMember } from "./queries";
import { createBoardSchema, updateBoardSchema } from "./schema";
import { generateUniqueBoardSlug } from "./slug";
import { canManageBoards } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

export async function createBoard(
  orgSlug: string,
  input: {
    name: string;
    description?: string;
    spaceId: string;
    visibility: "PUBLIC" | "PRIVATE";
  },
): Promise<ActionResult & { slug?: string }> {
  const { membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageBoards(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can create boards",
    };
  }

  const parsed = createBoardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // spaceId is client-supplied (a <select> value) — never trust it without
  // re-verifying it actually belongs to this organisation.
  const space = await db.space.findFirst({
    where: {
      id: parsed.data.spaceId,
      organizationId: membership.organization.id,
      archivedAt: null,
    },
  });
  if (!space) {
    return { success: false, error: "Choose a valid, active space" };
  }

  const slug = await generateUniqueBoardSlug(
    membership.organization.id,
    parsed.data.name,
  );

  await db.board.create({
    data: {
      organizationId: membership.organization.id,
      spaceId: space.id,
      name: parsed.data.name,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      slug,
    },
  });

  revalidatePath(`/org/${orgSlug}/boards`);
  revalidatePath(`/org/${orgSlug}/spaces/${space.slug}`);
  return { success: true, slug };
}

export async function updateBoard(
  orgSlug: string,
  boardSlug: string,
  input: {
    name: string;
    description?: string;
    visibility: "PUBLIC" | "PRIVATE";
  },
): Promise<ActionResult> {
  const { membership, board } = await requireBoardForOrgMember(
    orgSlug,
    boardSlug,
  );
  if (!canManageBoards(membership.role)) {
    return { success: false, error: "Only owners and admins can edit boards" };
  }

  const parsed = updateBoardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await db.board.update({
    where: { id: board.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
    },
  });

  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
  return { success: true };
}

export async function archiveBoard(
  orgSlug: string,
  boardSlug: string,
): Promise<ActionResult> {
  const { membership, board } = await requireBoardForOrgMember(
    orgSlug,
    boardSlug,
  );
  if (!canManageBoards(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can archive boards",
    };
  }

  await db.board.update({
    where: { id: board.id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath(`/org/${orgSlug}/boards`);
  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
  return { success: true };
}

export async function restoreBoard(
  orgSlug: string,
  boardSlug: string,
): Promise<ActionResult> {
  const { membership, board } = await requireBoardForOrgMember(
    orgSlug,
    boardSlug,
  );
  if (!canManageBoards(membership.role)) {
    return {
      success: false,
      error: "Only owners and admins can restore boards",
    };
  }

  await db.board.update({
    where: { id: board.id },
    data: { status: "ACTIVE" },
  });

  revalidatePath(`/org/${orgSlug}/boards`);
  revalidatePath(`/org/${orgSlug}/boards/${boardSlug}`);
  revalidatePath(`/b/${orgSlug}/${boardSlug}`);
  return { success: true };
}
