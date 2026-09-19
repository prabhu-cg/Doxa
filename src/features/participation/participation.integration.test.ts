// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getItemForVisitor, listItemsForBoard } from "@/features/items/queries";
import { getResponseSummaryForBoard } from "@/features/decisions/transparency";
import { getPublicRoadmap } from "@/features/roadmap/public";
import { getUsageForOrganization } from "@/features/entitlements/queries";
import {
  listBlockedParticipants,
  listTeamMemberIds,
} from "@/features/moderation/queries";
import { toCommentData } from "@/features/comments/mapper";
import { listCommentsForItem } from "@/features/comments/queries";
import {
  canCommentOnItem,
  canDeleteComment,
} from "@/features/comments/permissions";
import { canFollowItem } from "@/features/followers/permissions";
import { canVoteOnItem } from "@/features/votes/permissions";
import {
  PARTICIPATION_LIMITS,
  checkCommentRate,
  checkSubmissionRate,
  checkVoteRate,
} from "./rate-limit";

/**
 * The data-level guarantees behind customer participation, against the real
 * database like the other integration tests (the Server Actions need a live
 * request for cookies, so they are covered end to end in the browser). One
 * throwaway organisation with a team member and two customers, then the
 * profiles.
 */
describe("community participation", () => {
  const teamId = randomUUID();
  const customerId = randomUUID();
  const otherCustomerId = randomUUID();
  const slug = `participation-${randomUUID().slice(0, 8)}`;
  let orgId: string;
  let boardId: string;
  let spaceId: string;
  let typeId: string;
  let statusId: string;
  let priorityId: string;
  let itemCounter = 0;

  function makeItem(extra: Record<string, unknown> = {}) {
    itemCounter += 1;
    return db.item.create({
      data: {
        organizationId: orgId,
        spaceId,
        boardId,
        itemTypeId: typeId,
        statusId,
        priorityId,
        authorId: customerId,
        origin: "COMMUNITY",
        title: `Item ${itemCounter}`,
        slug: `item-${itemCounter}`,
        ...extra,
      },
    });
  }

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: teamId, displayName: "Teammate" },
        { id: customerId, displayName: "Customer" },
        { id: otherCustomerId, displayName: "Other customer" },
      ],
    });
    const org = await db.organization.create({
      data: { name: "Participation Org", slug },
    });
    orgId = org.id;
    await db.membership.create({
      data: { organizationId: orgId, userId: teamId, role: "ADMIN" },
    });
    const [type, status, priority, space] = await Promise.all([
      db.itemType.create({
        data: { organizationId: orgId, name: "Idea", slug: "idea" },
      }),
      db.status.create({
        data: { organizationId: orgId, name: "Open", slug: "open" },
      }),
      db.priority.create({
        data: { organizationId: orgId, name: "None", slug: "none" },
      }),
      db.space.create({
        data: { organizationId: orgId, name: "Space", slug: "space" },
      }),
    ]);
    typeId = type.id;
    statusId = status.id;
    priorityId = priority.id;
    spaceId = space.id;
    const board = await db.board.create({
      data: {
        organizationId: orgId,
        spaceId,
        name: "Board",
        slug: "board",
        visibility: "PUBLIC",
      },
    });
    boardId = board.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
    await db.profile.deleteMany({
      where: { id: { in: [teamId, customerId, otherCustomerId] } },
    });
  });

  describe("permissions", () => {
    it("lets a participant (no role) vote, comment and follow", () => {
      expect(canVoteOnItem(null)).toBe(true);
      expect(canCommentOnItem(null)).toBe(true);
      expect(canFollowItem(null)).toBe(true);
    });

    it("never lets a participant delete someone else's comment", () => {
      expect(canDeleteComment(null, false)).toBe(false);
      expect(canDeleteComment(null, true)).toBe(true);
      expect(canDeleteComment("MEMBER", false)).toBe(false);
      expect(canDeleteComment("ADMIN", false)).toBe(true);
    });
  });

  describe("a submission awaiting review", () => {
    let pendingSlug: string;
    let approvedSlug: string;

    beforeAll(async () => {
      const pending = await makeItem({ awaitingReview: true });
      const approved = await makeItem(); // an approved community item, for contrast
      pendingSlug = pending.slug;
      approvedSlug = approved.slug;
      await db.decision.createMany({
        data: [pending, approved].map((item) => ({
          organizationId: orgId,
          itemId: item.id,
          type: "PLANNED" as const,
          rationale: "Planned",
          roadmapStage: "NOW" as const,
          createdById: teamId,
        })),
      });
    });

    it("is left off the board's list, and shown to the team on request", async () => {
      const visible = await listItemsForBoard(boardId);
      expect(visible.map((i) => i.slug)).not.toContain(pendingSlug);

      const forTeam = await listItemsForBoard(
        boardId,
        {},
        { includePending: true },
      );
      expect(forTeam.map((i) => i.slug)).toContain(pendingSlug);
    });

    it("is invisible to the public and to other people, but not to its author", async () => {
      expect(await getItemForVisitor(boardId, pendingSlug)).toBeNull();
      expect(
        await getItemForVisitor(boardId, pendingSlug, otherCustomerId),
      ).toBeNull();
      expect(
        (await getItemForVisitor(boardId, pendingSlug, customerId))?.slug,
      ).toBe(pendingSlug);
    });

    it("does not count toward the board's response stats", async () => {
      const summary = await getResponseSummaryForBoard(boardId);
      expect(summary.total).toBe(1);
    });

    it("stays off the public roadmap even with a roadmap decision", async () => {
      const roadmap = await getPublicRoadmap(slug);
      const shown = [
        ...Object.values(roadmap?.stages ?? {}).flat(),
        ...(roadmap?.shipped ?? []),
      ].map((i) => i.slug);
      // The approved item with the same decision does show, so this is the
      // review flag doing the work and not an empty roadmap.
      expect(shown).toContain(approvedSlug);
      expect(shown).not.toContain(pendingSlug);
    });

    it("never raises the plan's item usage", async () => {
      const usage = await getUsageForOrganization(orgId);
      expect(usage.items).toBe(0);
    });
  });

  describe("team labels", () => {
    it("labels a team member's comment as the team's, and a customer's as not", async () => {
      const item = await makeItem();
      await db.comment.createMany({
        data: [
          { itemId: item.id, authorId: teamId, body: "From the team" },
          { itemId: item.id, authorId: customerId, body: "From a customer" },
        ],
      });
      const teamIds = await listTeamMemberIds(orgId);
      expect([...teamIds]).toEqual([teamId]);

      const comments = (await listCommentsForItem(item.id)).map((c) =>
        toCommentData(c, teamIds),
      );
      const byBody = Object.fromEntries(
        comments.map((c) => [c.body, c.authorIsTeam]),
      );
      expect(byBody).toEqual({
        "From the team": true,
        "From a customer": false,
      });
    });
  });

  describe("blocking", () => {
    it("is per organisation and unique per person", async () => {
      await db.participantBlock.create({
        data: {
          organizationId: orgId,
          userId: customerId,
          blockedById: teamId,
        },
      });
      await expect(
        db.participantBlock.create({
          data: {
            organizationId: orgId,
            userId: customerId,
            blockedById: teamId,
          },
        }),
      ).rejects.toMatchObject({ code: "P2002" });

      const blocked = await listBlockedParticipants(orgId);
      expect(blocked.map((b) => b.displayName)).toEqual(["Customer"]);

      await db.participantBlock.deleteMany({
        where: { organizationId: orgId, userId: customerId },
      });
      expect(await listBlockedParticipants(orgId)).toEqual([]);
    });
  });

  describe("rate limits", () => {
    const anHourAndABitLater = () => new Date(Date.now() + 61 * 60 * 1000);

    it("lets a new participant submit", async () => {
      expect(await checkSubmissionRate(orgId, otherCustomerId)).toEqual({
        allowed: true,
      });
    });

    it("stops a participant who has submitted too much in an hour, then lets them back", async () => {
      for (let i = 0; i < PARTICIPATION_LIMITS.submissionsPerHour; i++) {
        await makeItem({ authorId: otherCustomerId });
      }
      const blocked = await checkSubmissionRate(orgId, otherCustomerId);
      expect(blocked.allowed).toBe(false);

      // An hour on, the recent-submission window has emptied.
      expect(
        await checkSubmissionRate(orgId, otherCustomerId, anHourAndABitLater()),
      ).toEqual({ allowed: true });
    });

    it("limits how many submissions can wait for review at once", async () => {
      const person = randomUUID();
      await db.profile.create({ data: { id: person, displayName: "Eager" } });
      try {
        for (let i = 0; i < PARTICIPATION_LIMITS.pendingSubmissions; i++) {
          await makeItem({
            authorId: person,
            awaitingReview: true,
            // Old enough not to trip the hourly limit, so this is the pending cap.
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          });
        }
        const result = await checkSubmissionRate(orgId, person);
        expect(result.allowed).toBe(false);
      } finally {
        await db.item.deleteMany({ where: { authorId: person } });
        await db.profile.delete({ where: { id: person } });
      }
    });

    it("limits comments per hour, only for the person doing them", async () => {
      const item = await makeItem();
      await db.comment.createMany({
        data: Array.from(
          { length: PARTICIPATION_LIMITS.commentsPerHour },
          (_, i) => ({
            itemId: item.id,
            authorId: otherCustomerId,
            body: `Comment ${i}`,
          }),
        ),
      });
      expect((await checkCommentRate(orgId, otherCustomerId)).allowed).toBe(
        false,
      );
      expect((await checkCommentRate(orgId, teamId)).allowed).toBe(true);
      expect(
        (await checkCommentRate(orgId, otherCustomerId, anHourAndABitLater()))
          .allowed,
      ).toBe(true);
    });

    it("limits votes per hour, counting a vote that was later taken back", async () => {
      const item = await makeItem();
      await db.itemActivity.createMany({
        data: Array.from({ length: PARTICIPATION_LIMITS.votesPerHour }, () => ({
          itemId: item.id,
          actorId: otherCustomerId,
          type: "VOTE_ADDED" as const,
        })),
      });
      // No Vote row exists — the activity alone counts.
      expect((await checkVoteRate(orgId, otherCustomerId)).allowed).toBe(false);
      expect((await checkVoteRate(orgId, customerId)).allowed).toBe(true);
    });
  });
});
