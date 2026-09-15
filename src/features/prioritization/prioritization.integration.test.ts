// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { listItemsForPrioritization } from "./queries";
import { canViewPrioritization } from "./permissions";

/**
 * Exercises the admin prioritisation view's query: it spans every board
 * in the organisation (unlike listItemsForBoard), carries both community
 * signal (votes) and business signal (score) without collapsing them, is
 * sortable by each, and stays tenant-scoped.
 */
describe("listItemsForPrioritization", () => {
  const authorId = randomUUID();
  const voterId = randomUUID();
  let orgAId: string;
  let orgBId: string;
  let lowVoteHighScoreId: string;
  let highVoteLowScoreId: string;

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: authorId, displayName: "Author" },
        { id: voterId, displayName: "Voter" },
      ],
    });

    const orgA = await db.organization.create({
      data: {
        name: "Prioritization Org A",
        slug: `prio-a-${randomUUID().slice(0, 8)}`,
      },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: {
        name: "Prioritization Org B",
        slug: `prio-b-${randomUUID().slice(0, 8)}`,
      },
    });
    orgBId = orgB.id;

    const space = await db.space.create({
      data: { organizationId: orgAId, name: "Product", slug: "product" },
    });
    const boardOne = await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: space.id,
        name: "Board One",
        slug: "board-one",
      },
    });
    const boardTwo = await db.board.create({
      data: {
        organizationId: orgAId,
        spaceId: space.id,
        name: "Board Two",
        slug: "board-two",
      },
    });
    const itemType = await db.itemType.create({
      data: { organizationId: orgAId, name: "Feature", slug: "feature" },
    });
    const status = await db.status.create({
      data: {
        organizationId: orgAId,
        name: "Open",
        slug: "open",
        isDefault: true,
      },
    });
    const priority = await db.priority.create({
      data: {
        organizationId: orgAId,
        name: "None",
        slug: "none",
        isDefault: true,
      },
    });
    const criterion = await db.scoreCriterion.create({
      data: {
        organizationId: orgAId,
        name: "Impact",
        slug: "impact",
        weight: 1,
      },
    });

    const lowVoteHighScore = await db.item.create({
      data: {
        organizationId: orgAId,
        spaceId: space.id,
        boardId: boardOne.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        priorityId: priority.id,
        authorId,
        title: "Low votes, high score",
        slug: "low-votes-high-score",
      },
    });
    lowVoteHighScoreId = lowVoteHighScore.id;
    await db.itemScore.create({
      data: {
        itemId: lowVoteHighScore.id,
        criterionId: criterion.id,
        value: 5,
      },
    });

    // Item lives on a different board within the same org — the view is
    // org-wide, not board-scoped.
    const highVoteLowScore = await db.item.create({
      data: {
        organizationId: orgAId,
        spaceId: space.id,
        boardId: boardTwo.id,
        itemTypeId: itemType.id,
        statusId: status.id,
        priorityId: priority.id,
        authorId,
        title: "High votes, low score",
        slug: "high-votes-low-score",
      },
    });
    highVoteLowScoreId = highVoteLowScore.id;
    await db.vote.create({
      data: { itemId: highVoteLowScore.id, userId: voterId },
    });
    await db.itemScore.create({
      data: {
        itemId: highVoteLowScore.id,
        criterionId: criterion.id,
        value: 1,
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
    await db.profile.deleteMany({ where: { id: { in: [authorId, voterId] } } });
  });

  it("spans every board in the organisation, not just one", async () => {
    const items = await listItemsForPrioritization(orgAId);
    const ids = items.map((i) => i.id);
    expect(ids).toEqual(
      expect.arrayContaining([lowVoteHighScoreId, highVoteLowScoreId]),
    );
  });

  it("sorting by votes and sorting by score can disagree — neither is implied by the other", async () => {
    const byVotes = await listItemsForPrioritization(orgAId, { sort: "votes" });
    const byScore = await listItemsForPrioritization(orgAId, { sort: "score" });

    expect(byVotes[0]?.id).toBe(highVoteLowScoreId);
    expect(byScore[0]?.id).toBe(lowVoteHighScoreId);
  });

  it("carries both the raw vote count and the computed score on the same row", async () => {
    const items = await listItemsForPrioritization(orgAId);
    const highVoteItem = items.find((i) => i.id === highVoteLowScoreId);
    expect(highVoteItem?._count.votes).toBe(1);
    expect(highVoteItem?.score).toBe(1);
  });

  it("is scoped to one organisation", async () => {
    expect(await listItemsForPrioritization(orgBId)).toEqual([]);
  });
});

describe("Prioritization permissions", () => {
  it("the internal prioritisation view is admin+-only", () => {
    expect(canViewPrioritization("MEMBER")).toBe(false);
    expect(canViewPrioritization("ADMIN")).toBe(true);
    expect(canViewPrioritization("OWNER")).toBe(true);
  });
});
