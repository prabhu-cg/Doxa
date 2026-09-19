// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { listSpacesForOrganization } from "./spaces/queries";
import {
  listBoardsForOrganization,
  listBoardsForSpace,
} from "./boards/queries";

/**
 * Card grids lead with the most recently edited or created card, whatever its
 * status. Run against the real database like the other integration tests,
 * with explicit created/edited dates so the expected order is unambiguous —
 * including an old space and an old board that were edited recently, and an
 * archived one that is newer than most. One throwaway organisation, deleted
 * afterwards.
 */
describe("card grid ordering", () => {
  const slug = `list-order-${randomUUID().slice(0, 8)}`;
  let orgId: string;
  let spaceId: string;

  beforeAll(async () => {
    const org = await db.organization.create({
      data: { name: "List Order Org", slug },
    });
    orgId = org.id;

    const at = (month: string) => new Date(`2024-${month}-01T00:00:00Z`);
    // [name, slug, created, last edited, archived?]
    const spaces = await Promise.all(
      [
        ["Space A", "a", "01", "07", false], // oldest, but edited most recently
        ["Space B", "b", "02", "02", false],
        ["Space C", "c", "03", "03", false],
        ["Space D", "d", "05", "05", true], // archived, newer than B and C
      ].map(([name, s, created, edited, archived]) =>
        db.space.create({
          data: {
            organizationId: orgId,
            name: name as string,
            slug: s as string,
            createdAt: at(created as string),
            updatedAt: at(edited as string),
            ...(archived ? { archivedAt: new Date() } : {}),
          },
        }),
      ),
    );
    const [a, , c] = spaces;
    spaceId = a.id;

    await Promise.all(
      [
        ["Board 1", "b1", a.id, "01", "07", false], // oldest, edited most recently
        ["Board 2", "b2", a.id, "03", "03", false],
        ["Board 3", "b3", a.id, "02", "02", false],
        ["Board 4", "b4", c.id, "04", "04", false], // in another space
        ["Board 5", "b5", a.id, "06", "06", true], // archived, newer than 2-4
      ].map(([name, s, sid, created, edited, archived]) =>
        db.board.create({
          data: {
            organizationId: orgId,
            spaceId: sid as string,
            name: name as string,
            slug: s as string,
            createdAt: at(created as string),
            updatedAt: at(edited as string),
            ...(archived ? { status: "ARCHIVED" as const } : {}),
          },
        }),
      ),
    );
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
  });

  const names = (rows: { name: string }[]) => rows.map((r) => r.name);

  it("leads with the most recently edited space", async () => {
    const spaces = await listSpacesForOrganization(orgId, {
      recentFirst: true,
    });
    expect(names(spaces)).toEqual(["Space A", "Space C", "Space B"]);
  });

  it("does not sort archived spaces apart from the rest", async () => {
    const spaces = await listSpacesForOrganization(orgId, {
      includeArchived: true,
      recentFirst: true,
    });
    expect(names(spaces)).toEqual(["Space A", "Space D", "Space C", "Space B"]);
  });

  it("keeps spaces oldest first by default (the New board form pre-selects the first)", async () => {
    const spaces = await listSpacesForOrganization(orgId);
    expect(names(spaces)).toEqual(["Space A", "Space B", "Space C"]);
  });

  it("leads a space's boards with the most recently edited one", async () => {
    const boards = await listBoardsForSpace(spaceId);
    expect(names(boards)).toEqual(["Board 1", "Board 2", "Board 3"]);
  });

  it("does not sort a space's archived boards apart from the rest", async () => {
    const boards = await listBoardsForSpace(spaceId, { includeArchived: true });
    expect(names(boards)).toEqual(["Board 1", "Board 5", "Board 2", "Board 3"]);
  });

  it("orders every board in the organisation by recent activity, across spaces", async () => {
    const boards = await listBoardsForOrganization(orgId);
    expect(names(boards)).toEqual(["Board 1", "Board 4", "Board 2", "Board 3"]);
  });

  it("does not sort archived boards apart in the organisation-wide list either", async () => {
    const boards = await listBoardsForOrganization(orgId, {
      includeArchived: true,
    });
    expect(names(boards)).toEqual([
      "Board 1",
      "Board 5",
      "Board 4",
      "Board 2",
      "Board 3",
    ]);
  });
});
