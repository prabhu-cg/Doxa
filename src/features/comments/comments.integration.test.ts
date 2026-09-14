// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { countCommentsForItem, listCommentsForItem } from "./queries";
import { resolveMentionedProfileIds } from "./mentions";
import {
  canCommentOnItem,
  canDeleteComment,
  canEditComment,
} from "./permissions";

/**
 * Exercises Comment threading, moderation soft-delete, and mention
 * resolution directly against the real Supabase Postgres instance — see
 * the equivalent note in features/votes/votes.integration.test.ts for why
 * this bypasses the createComment/deleteComment Server Actions.
 */
describe("Comments: threading, soft-delete, mentions", () => {
  const authorId = randomUUID();
  const replierId = randomUUID();
  let orgId: string;
  let otherOrgId: string;
  let itemId: string;

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: authorId, displayName: "Author", username: "author" },
        { id: replierId, displayName: "Replier", username: "replier" },
      ],
    });
    const org = await db.organization.create({
      data: {
        name: "Comment Test Org",
        slug: `comment-test-${randomUUID().slice(0, 8)}`,
      },
    });
    orgId = org.id;
    await db.membership.createMany({
      data: [
        { organizationId: orgId, userId: authorId, role: "OWNER" },
        { organizationId: orgId, userId: replierId, role: "MEMBER" },
      ],
    });

    const otherOrg = await db.organization.create({
      data: {
        name: "Other Org",
        slug: `comment-other-${randomUUID().slice(0, 8)}`,
      },
    });
    otherOrgId = otherOrg.id;

    const space = await db.space.create({
      data: { organizationId: orgId, name: "Product", slug: "product" },
    });
    const board = await db.board.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        name: "Board",
        slug: "board",
      },
    });
    const itemType = await db.itemType.create({
      data: { organizationId: orgId, name: "Feature", slug: "feature" },
    });
    const status = await db.status.create({
      data: {
        organizationId: orgId,
        name: "Open",
        slug: "open",
        isDefault: true,
      },
    });
    const item = await db.item.create({
      data: {
        organizationId: orgId,
        spaceId: space.id,
        boardId: board.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        authorId,
        title: "Dark mode",
        slug: "dark-mode",
      },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgId, otherOrgId] } },
    });
    await db.profile.deleteMany({
      where: { id: { in: [authorId, replierId] } },
    });
  });

  it("a top-level comment with a reply is returned nested one level deep", async () => {
    const top = await db.comment.create({
      data: { itemId, authorId, body: "Great idea!" },
    });
    const reply = await db.comment.create({
      data: { itemId, authorId: replierId, parentId: top.id, body: "Agreed." },
    });

    const comments = await listCommentsForItem(itemId);
    expect(comments).toHaveLength(1);
    expect(comments[0]!.id).toBe(top.id);
    expect(comments[0]!.replies).toHaveLength(1);
    expect(comments[0]!.replies[0]!.id).toBe(reply.id);

    await db.comment.deleteMany({ where: { itemId } });
  });

  it("countCommentsForItem excludes soft-deleted comments", async () => {
    const a = await db.comment.create({
      data: { itemId, authorId, body: "A" },
    });
    const b = await db.comment.create({
      data: { itemId, authorId, body: "B" },
    });
    expect(await countCommentsForItem(itemId)).toBe(2);

    await db.comment.update({
      where: { id: b.id },
      data: { deletedAt: new Date(), body: "" },
    });
    expect(await countCommentsForItem(itemId)).toBe(1);

    // Soft-deleted comments still render (as "[deleted]") to preserve
    // thread structure — listCommentsForItem doesn't filter them out.
    const comments = await listCommentsForItem(itemId);
    expect(comments.map((c) => c.id)).toContain(a.id);
    expect(comments.map((c) => c.id)).toContain(b.id);
    expect(comments.find((c) => c.id === b.id)?.body).toBe("");

    await db.comment.deleteMany({ where: { itemId } });
  });

  it("resolveMentionedProfileIds only resolves usernames that are members of the given organisation", async () => {
    const ids = await resolveMentionedProfileIds(
      orgId,
      "cc @replier and @author, not @nobody",
    );
    expect(ids.sort()).toEqual([authorId, replierId].sort());
  });

  it("resolveMentionedProfileIds ignores a username that belongs to a different organisation", async () => {
    const ids = await resolveMentionedProfileIds(
      otherOrgId,
      "@author @replier",
    );
    expect(ids).toEqual([]);
  });

  it("resolveMentionedProfileIds returns nothing for a body with no mentions", async () => {
    expect(await resolveMentionedProfileIds(orgId, "no mentions here")).toEqual(
      [],
    );
  });
});

describe("Comment permissions", () => {
  it("any org member can comment", () => {
    expect(canCommentOnItem("MEMBER")).toBe(true);
    expect(canCommentOnItem("OWNER")).toBe(true);
  });

  it("only the author can edit their own comment — not even an admin", () => {
    expect(canEditComment(true)).toBe(true);
    expect(canEditComment(false)).toBe(false);
  });

  it("the author or an admin+ can delete a comment (self-delete or moderation)", () => {
    expect(canDeleteComment("MEMBER", true)).toBe(true);
    expect(canDeleteComment("MEMBER", false)).toBe(false);
    expect(canDeleteComment("ADMIN", false)).toBe(true);
    expect(canDeleteComment("OWNER", false)).toBe(true);
  });
});
