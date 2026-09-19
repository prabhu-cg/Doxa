// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getPublicRoadmap, hasPublicBoard } from "./public";

/**
 * What the public roadmap may show — and, more importantly, what it must never
 * show: anything from a Private or archived board, archived or deleted items,
 * declined or duplicate items, and anything whose CURRENT decision says so.
 * Against the real database like the other integration tests; throwaway
 * organisations, then the profile.
 */
describe("public roadmap", () => {
  const profileId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  const slug = `public-roadmap-${suffix}`;
  const privateOnlySlug = `private-only-${suffix}`;
  let orgId: string;
  let privateOnlyOrgId: string;

  const at = (day: number) => new Date(Date.UTC(2024, 0, day));

  beforeAll(async () => {
    await db.profile.create({
      data: { id: profileId, displayName: "Decider" },
    });
    const [org, privateOnly] = await Promise.all([
      db.organization.create({ data: { name: "Roadmap Org", slug } }),
      db.organization.create({
        data: { name: "Private Only", slug: privateOnlySlug },
      }),
    ]);
    orgId = org.id;
    privateOnlyOrgId = privateOnly.id;

    async function scaffold(organizationId: string) {
      const [type, status, priority, space] = await Promise.all([
        db.itemType.create({
          data: { organizationId, name: "Idea", slug: "idea" },
        }),
        db.status.create({
          data: { organizationId, name: "Open", slug: "open" },
        }),
        db.priority.create({
          data: { organizationId, name: "None", slug: "none" },
        }),
        db.space.create({
          data: { organizationId, name: "Space", slug: "space" },
        }),
      ]);
      return { organizationId, type, status, priority, space };
    }
    const main = await scaffold(orgId);
    const board = (name: string, extra: Record<string, unknown>) =>
      db.board.create({
        data: {
          organizationId: orgId,
          spaceId: main.space.id,
          name,
          slug: name.toLowerCase(),
          ...extra,
        },
      });
    const [pub, priv, archivedBoard] = await Promise.all([
      board("Public", { visibility: "PUBLIC" }),
      board("Private", { visibility: "PRIVATE" }),
      board("Archived", { visibility: "PUBLIC", status: "ARCHIVED" }),
    ]);

    type D = [
      (
        | "PLANNED"
        | "IN_PROGRESS"
        | "DEFERRED"
        | "COMPLETED"
        | "DECLINED"
        | "DUPLICATE"
      ),
      "NOW" | "NEXT" | "LATER" | null,
      number,
    ];
    async function item(
      boardId: string,
      name: string,
      decisions: D[],
      extra: Record<string, unknown> = {},
    ) {
      const created = await db.item.create({
        data: {
          organizationId: orgId,
          spaceId: main.space.id,
          boardId,
          itemTypeId: main.type.id,
          statusId: main.status.id,
          priorityId: main.priority.id,
          authorId: profileId,
          title: name,
          slug: name.toLowerCase(),
          ...extra,
        },
      });
      for (const [type, stage, day] of decisions) {
        await db.decision.create({
          data: {
            organizationId: orgId,
            itemId: created.id,
            type,
            rationale: `${name}: ${type}`,
            roadmapStage: stage,
            createdById: profileId,
            createdAt: at(day),
          },
        });
      }
    }

    await item(pub.id, "A-next", [["PLANNED", "NEXT", 1]]);
    await item(pub.id, "B-now", [["IN_PROGRESS", "NOW", 1]]);
    await item(pub.id, "C-later", [["DEFERRED", "LATER", 1]]);
    await item(pub.id, "D-shipped", [["COMPLETED", null, 5]]);
    await item(pub.id, "E-declined-with-stage", [["DECLINED", "NEXT", 1]]);
    await item(pub.id, "F-duplicate", [["DUPLICATE", null, 1]]);
    await item(pub.id, "G-planned-no-stage", [["PLANNED", null, 1]]);
    await item(pub.id, "H-undecided", []);
    await item(pub.id, "I-archived-item", [["PLANNED", "NOW", 1]], {
      archivedAt: new Date(),
    });
    await item(pub.id, "J-deleted-item", [["PLANNED", "NOW", 1]], {
      deletedAt: new Date(),
    });
    await item(priv.id, "K-private-board", [["PLANNED", "NOW", 1]]);
    await item(archivedBoard.id, "L-archived-board", [["PLANNED", "NOW", 1]]);
    // The CURRENT decision wins, in both directions.
    await item(pub.id, "M-planned-then-declined", [
      ["PLANNED", "NOW", 1],
      ["DECLINED", null, 2],
    ]);
    await item(pub.id, "N-declined-then-planned", [
      ["DECLINED", null, 1],
      ["PLANNED", "NEXT", 2],
    ]);

    // An organisation whose only board is Private has no public roadmap at all.
    const other = await scaffold(privateOnlyOrgId);
    await db.board.create({
      data: {
        organizationId: privateOnlyOrgId,
        spaceId: other.space.id,
        name: "Hidden",
        slug: "hidden",
        visibility: "PRIVATE",
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgId, privateOnlyOrgId] } },
    });
    await db.profile.deleteMany({ where: { id: profileId } });
  });

  const titles = (rows: { title: string }[]) => rows.map((r) => r.title).sort();

  it("places items by their current decision's stage", async () => {
    const roadmap = await getPublicRoadmap(slug);
    expect(titles(roadmap!.stages.NOW)).toEqual(["B-now"]);
    expect(titles(roadmap!.stages.NEXT)).toEqual([
      "A-next",
      "N-declined-then-planned",
    ]);
    expect(titles(roadmap!.stages.LATER)).toEqual(["C-later"]);
  });

  it("lists completed items as shipped", async () => {
    const roadmap = await getPublicRoadmap(slug);
    expect(titles(roadmap!.shipped)).toEqual(["D-shipped"]);
  });

  it("never shows a declined or duplicate item, or one with no stage or decision", async () => {
    const roadmap = await getPublicRoadmap(slug);
    const everything = [
      ...roadmap!.stages.NOW,
      ...roadmap!.stages.NEXT,
      ...roadmap!.stages.LATER,
      ...roadmap!.shipped,
    ].map((i) => i.title);
    for (const hidden of [
      "E-declined-with-stage",
      "F-duplicate",
      "G-planned-no-stage",
      "H-undecided",
      "M-planned-then-declined",
    ]) {
      expect(everything).not.toContain(hidden);
    }
  });

  it("never shows archived or deleted items, or anything on a Private or archived board", async () => {
    const roadmap = await getPublicRoadmap(slug);
    const everything = JSON.stringify(roadmap);
    for (const hidden of [
      "I-archived-item",
      "J-deleted-item",
      "K-private-board",
      "L-archived-board",
    ]) {
      expect(everything).not.toContain(hidden);
    }
  });

  it("lists only the public, active boards", async () => {
    const roadmap = await getPublicRoadmap(slug);
    expect(roadmap!.boards.map((b) => b.name)).toEqual(["Public"]);
  });

  it("is null for an unknown organisation and for one with no public board", async () => {
    expect(await getPublicRoadmap(`no-such-org-${suffix}`)).toBeNull();
    expect(await getPublicRoadmap(privateOnlySlug)).toBeNull();
  });

  it("knows whether an organisation has a public board", async () => {
    expect(await hasPublicBoard(orgId)).toBe(true);
    expect(await hasPublicBoard(privateOnlyOrgId)).toBe(false);
  });
});
