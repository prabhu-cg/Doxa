// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { insertOrNull } from "@/server/db-errors";
import { isSpaceNameTaken } from "./spaces/queries";
import { isBoardNameTaken } from "./boards/queries";
import { isItemTypeNameTaken } from "./item-types/queries";
import { isStatusNameTaken } from "./statuses/queries";
import { isPriorityNameTaken } from "./priorities/queries";
import { isScoreCriterionNameTaken } from "./scoring/queries";
import { isCategoryNameTaken } from "./categories/queries";
import { isTagNameTaken } from "./tags/queries";

/**
 * The "no two active things share a name" rule, run against the real
 * database like the other integration tests (the Server Actions themselves
 * need a live request for auth cookies, so the checks they call are what's
 * exercised here). Two throwaway organisations, deleted afterwards — their
 * cascade removes everything seeded under them.
 */
describe("name uniqueness checks", () => {
  const suffix = randomUUID().slice(0, 8);
  let orgId: string;
  let otherOrgId: string;
  let spaceId: string;
  let otherSpaceId: string;

  type Case = {
    label: string;
    /** A name held by an active row in `orgId`. */
    active: string;
    activeId: string;
    /** A name held only by an archived row (absent for kinds that can't be archived). */
    archived?: string;
    taken: (name: string, excludeId?: string) => Promise<boolean>;
  };
  let cases: Case[];

  beforeAll(async () => {
    const org = await db.organization.create({
      data: { name: "Names Org", slug: `names-org-${suffix}` },
    });
    const other = await db.organization.create({
      data: { name: "Other Names Org", slug: `names-other-${suffix}` },
    });
    orgId = org.id;
    otherOrgId = other.id;
    const gone = new Date();

    const space = await db.space.create({
      data: { organizationId: orgId, name: "Product", slug: "product" },
    });
    await db.space.create({
      data: {
        organizationId: orgId,
        name: "Old Space",
        slug: "old-space",
        archivedAt: gone,
      },
    });
    const otherSpace = await db.space.create({
      data: { organizationId: orgId, name: "Engineering", slug: "engineering" },
    });
    spaceId = space.id;
    otherSpaceId = otherSpace.id;
    // Same name in another organisation must never conflict.
    await db.space.create({
      data: {
        organizationId: otherOrgId,
        name: "Marketing",
        slug: "marketing",
      },
    });

    const board = await db.board.create({
      data: {
        organizationId: orgId,
        spaceId,
        name: "Feature Requests",
        slug: "feature-requests",
      },
    });
    await db.board.create({
      data: {
        organizationId: orgId,
        spaceId,
        name: "Legacy",
        slug: "legacy",
        status: "ARCHIVED",
      },
    });

    const itemType = await db.itemType.create({
      data: { organizationId: orgId, name: "Bug", slug: "bug" },
    });
    await db.itemType.create({
      data: {
        organizationId: orgId,
        name: "Retired",
        slug: "retired",
        archivedAt: gone,
      },
    });
    const status = await db.status.create({
      data: { organizationId: orgId, name: "Open", slug: "open" },
    });
    await db.status.create({
      data: {
        organizationId: orgId,
        name: "Closed",
        slug: "closed",
        archivedAt: gone,
      },
    });
    const priority = await db.priority.create({
      data: { organizationId: orgId, name: "High", slug: "high" },
    });
    await db.priority.create({
      data: {
        organizationId: orgId,
        name: "Low",
        slug: "low",
        archivedAt: gone,
      },
    });
    const criterion = await db.scoreCriterion.create({
      data: { organizationId: orgId, name: "Impact", slug: "impact" },
    });
    await db.scoreCriterion.create({
      data: {
        organizationId: orgId,
        name: "Effort",
        slug: "effort",
        archivedAt: gone,
      },
    });
    const category = await db.category.create({
      data: { organizationId: orgId, name: "Mobile", slug: "mobile" },
    });
    const tag = await db.tag.create({
      data: { organizationId: orgId, name: "performance", slug: "performance" },
    });

    cases = [
      {
        label: "space",
        active: "Product",
        activeId: spaceId,
        archived: "Old Space",
        taken: (n, x) => isSpaceNameTaken(orgId, n, x),
      },
      {
        label: "item type",
        active: "Bug",
        activeId: itemType.id,
        archived: "Retired",
        taken: (n, x) => isItemTypeNameTaken(orgId, n, x),
      },
      {
        label: "status",
        active: "Open",
        activeId: status.id,
        archived: "Closed",
        taken: (n, x) => isStatusNameTaken(orgId, n, x),
      },
      {
        label: "priority",
        active: "High",
        activeId: priority.id,
        archived: "Low",
        taken: (n, x) => isPriorityNameTaken(orgId, n, x),
      },
      {
        label: "scoring criterion",
        active: "Impact",
        activeId: criterion.id,
        archived: "Effort",
        taken: (n, x) => isScoreCriterionNameTaken(orgId, n, x),
      },
      {
        label: "category",
        active: "Mobile",
        activeId: category.id,
        taken: (n, x) => isCategoryNameTaken(orgId, n, x),
      },
      {
        label: "tag",
        active: "performance",
        activeId: tag.id,
        taken: (n, x) => isTagNameTaken(orgId, n, x),
      },
    ];
    // Boards are scoped to a space, not an organisation.
    cases.push({
      label: "board (in its own space)",
      active: "Feature Requests",
      activeId: board.id,
      archived: "Legacy",
      taken: (n, x) => isBoardNameTaken(spaceId, n, x),
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgId, otherOrgId] } },
    });
  });

  it("finds an active row with the same name", async () => {
    for (const c of cases) {
      expect(await c.taken(c.active), c.label).toBe(true);
    }
  });

  it("ignores case", async () => {
    for (const c of cases) {
      expect(await c.taken(c.active.toUpperCase()), c.label).toBe(true);
      expect(await c.taken(c.active.toLowerCase()), c.label).toBe(true);
    }
  });

  it("is free for a name nothing uses", async () => {
    for (const c of cases) {
      expect(await c.taken("Definitely Unused"), c.label).toBe(false);
    }
  });

  it("does not let an archived row block its name", async () => {
    for (const c of cases.filter((c) => c.archived)) {
      expect(await c.taken(c.archived!), c.label).toBe(false);
    }
  });

  it("does not collide a row with itself (rename, restore)", async () => {
    for (const c of cases) {
      expect(await c.taken(c.active, c.activeId), c.label).toBe(false);
      // …but it still collides with a *different* row.
      expect(await c.taken(c.active, "some-other-id"), c.label).toBe(true);
    }
  });

  it("never conflicts across organisations", async () => {
    expect(await isSpaceNameTaken(orgId, "Marketing")).toBe(false);
    expect(await isSpaceNameTaken(otherOrgId, "Marketing")).toBe(true);
    expect(await isSpaceNameTaken(otherOrgId, "Product")).toBe(false);
  });

  it("scopes a board's name to its space", async () => {
    expect(await isBoardNameTaken(spaceId, "Feature Requests")).toBe(true);
    expect(await isBoardNameTaken(otherSpaceId, "Feature Requests")).toBe(
      false,
    );
  });
});

describe("insertOrNull", () => {
  const slug = `insert-or-null-${randomUUID().slice(0, 8)}`;
  let orgId: string;

  beforeAll(async () => {
    const org = await db.organization.create({
      data: { name: "Insert Org", slug },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
  });

  it("returns the row when the insert succeeds", async () => {
    const created = await insertOrNull(() =>
      db.space.create({
        data: { organizationId: orgId, name: "First", slug: "same" },
      }),
    );
    expect(created?.name).toBe("First");
  });

  it("returns null when the slug constraint refuses the insert", async () => {
    const created = await insertOrNull(() =>
      db.space.create({
        data: { organizationId: orgId, name: "Second", slug: "same" },
      }),
    );
    expect(created).toBeNull();
  });

  it("still throws anything that is not a unique violation", async () => {
    await expect(
      insertOrNull(() =>
        db.space.create({
          data: {
            organizationId: "no-such-organisation",
            name: "Orphan",
            slug: "orphan",
          },
        }),
      ),
    ).rejects.toThrow();
  });
});
