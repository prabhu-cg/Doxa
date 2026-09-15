// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  notifyCommentAdded,
  notifyMentions,
  notifyStatusChanged,
} from "./create";
import { countUnreadNotifications, listNotificationsForUser } from "./queries";

describe("Notification creation and tenant isolation", () => {
  const authorId = randomUUID();
  const followerId = randomUUID();
  const replyAuthorId = randomUUID();
  let orgId: string;
  let otherOrgId: string;
  let itemId: string;

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: authorId, displayName: "Author" },
        { id: followerId, displayName: "Follower" },
        { id: replyAuthorId, displayName: "Reply Author" },
      ],
    });
    const org = await db.organization.create({
      data: {
        name: "Notif Test Org",
        slug: `notif-test-${randomUUID().slice(0, 8)}`,
      },
    });
    orgId = org.id;
    const otherOrg = await db.organization.create({
      data: {
        name: "Notif Other Org",
        slug: `notif-other-${randomUUID().slice(0, 8)}`,
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
    const priority = await db.priority.create({
      data: {
        organizationId: orgId,
        name: "None",
        slug: "none",
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
        priorityId: priority.id,
        authorId,
        title: "Dark mode",
        slug: "dark-mode",
      },
    });
    itemId = item.id;

    await db.itemFollower.createMany({
      data: [
        { itemId, userId: authorId },
        { itemId, userId: followerId },
      ],
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgId, otherOrgId] } },
    });
    await db.profile.deleteMany({
      where: { id: { in: [authorId, followerId, replyAuthorId] } },
    });
  });

  it("notifyCommentAdded notifies every follower except the commenter", async () => {
    const comment = await db.comment.create({
      data: { itemId, authorId: followerId, body: "Nice!" },
    });

    await notifyCommentAdded({
      organizationId: orgId,
      itemId,
      commentId: comment.id,
      actorId: followerId,
    });

    const notifications = await db.notification.findMany({ where: { itemId } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]!.userId).toBe(authorId);
    expect(notifications[0]!.type).toBe("ITEM_COMMENT");

    await db.notification.deleteMany({ where: { itemId } });
    await db.comment.delete({ where: { id: comment.id } });
  });

  it("a reply notifies the parent comment's author as COMMENT_REPLY, not a duplicate ITEM_COMMENT", async () => {
    const parent = await db.comment.create({
      data: { itemId, authorId: replyAuthorId, body: "Original" },
    });
    await db.itemFollower.create({ data: { itemId, userId: replyAuthorId } });

    const reply = await db.comment.create({
      data: {
        itemId,
        authorId: followerId,
        parentId: parent.id,
        body: "Reply",
      },
    });

    await notifyCommentAdded({
      organizationId: orgId,
      itemId,
      commentId: reply.id,
      actorId: followerId,
      parentId: parent.id,
    });

    const notifications = await db.notification.findMany({ where: { itemId } });
    // Exactly one notification per recipient: the parent author gets
    // COMMENT_REPLY (the more specific type), never also a generic
    // ITEM_COMMENT for the same event.
    const forReplyAuthor = notifications.filter(
      (n) => n.userId === replyAuthorId,
    );
    expect(forReplyAuthor).toHaveLength(1);
    expect(forReplyAuthor[0]!.type).toBe("COMMENT_REPLY");

    await db.notification.deleteMany({ where: { itemId } });
    await db.comment.deleteMany({ where: { itemId } });
    await db.itemFollower.deleteMany({
      where: { itemId, userId: replyAuthorId },
    });
  });

  it("notifyMentions never notifies the mentioning user about their own comment", async () => {
    const comment = await db.comment.create({
      data: { itemId, authorId, body: "@follower" },
    });

    await notifyMentions({
      organizationId: orgId,
      itemId,
      commentId: comment.id,
      actorId: authorId,
      mentionedIds: [authorId, followerId],
    });

    const notifications = await db.notification.findMany({
      where: { itemId, type: "MENTION" },
    });
    expect(notifications.map((n) => n.userId)).toEqual([followerId]);

    await db.notification.deleteMany({ where: { itemId } });
    await db.comment.delete({ where: { id: comment.id } });
  });

  it("notifyStatusChanged notifies followers other than the actor, carrying from/to in data", async () => {
    await notifyStatusChanged({
      organizationId: orgId,
      itemId,
      actorId: authorId,
      fromStatus: "Open",
      toStatus: "Planned",
    });

    const notifications = await db.notification.findMany({ where: { itemId } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]!.userId).toBe(followerId);
    expect(notifications[0]!.data).toMatchObject({
      fromStatus: "Open",
      toStatus: "Planned",
    });

    await db.notification.deleteMany({ where: { itemId } });
  });

  it("listNotificationsForUser and countUnreadNotifications are scoped to one organisation", async () => {
    await db.notification.create({
      data: {
        organizationId: orgId,
        userId: authorId,
        type: "MENTION",
        itemId,
      },
    });
    await db.notification.create({
      data: { organizationId: otherOrgId, userId: authorId, type: "MENTION" },
    });

    const scoped = await listNotificationsForUser(orgId, authorId);
    expect(scoped.every((n) => n.organizationId === orgId)).toBe(true);
    expect(scoped.length).toBeGreaterThanOrEqual(1);

    const unread = await countUnreadNotifications(orgId, authorId);
    expect(unread).toBe(scoped.filter((n) => !n.readAt).length);

    await db.notification.deleteMany({ where: { userId: authorId } });
  });
});
