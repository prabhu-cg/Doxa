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
 * Card grids list the newest first; run against the real database like the
 * other integration tests, with explicit creation dates so the expected order
 * is unambiguous. One throwaway organisation, deleted afterwards.
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
    const [a, , c] = await Promise.all(
      [
        ["Space A", "a", "01"],
        ["Space B", "b", "02"],
        ["Space C", "c", "03"],
      ].map(([name, s, month]) =>
        db.space.create({
          data: { organizationId: orgId, name, slug: s, createdAt: at(month) },
        }),
      ),
    );
    spaceId = a.id;

    // Created out of order on purpose; two spaces so the org-wide list crosses them.
    await Promise.all(
      [
        ["Board 1", "b1", a.id, "01"],
        ["Board 2", "b2", a.id, "03"],
        ["Board 3", "b3", a.id, "02"],
        ["Board 4", "b4", c.id, "04"],
      ].map(([name, s, sid, month]) =>
        db.board.create({
          data: {
            organizationId: orgId,
            spaceId: sid,
            name,
            slug: s,
            createdAt: at(month),
          },
        }),
      ),
    );
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
  });

  it("lists spaces newest first when asked", async () => {
    const spaces = await listSpacesForOrganization(orgId, {
      newestFirst: true,
    });
    expect(spaces.map((s) => s.name)).toEqual([
      "Space C",
      "Space B",
      "Space A",
    ]);
  });

  it("keeps spaces oldest first by default (the New board form pre-selects the first)", async () => {
    const spaces = await listSpacesForOrganization(orgId);
    expect(spaces.map((s) => s.name)).toEqual([
      "Space A",
      "Space B",
      "Space C",
    ]);
  });

  it("lists a space's boards newest first", async () => {
    const boards = await listBoardsForSpace(spaceId);
    expect(boards.map((b) => b.name)).toEqual([
      "Board 2",
      "Board 3",
      "Board 1",
    ]);
  });

  it("lists every board in the organisation newest first, across spaces", async () => {
    const boards = await listBoardsForOrganization(orgId);
    expect(boards.map((b) => b.name)).toEqual([
      "Board 4",
      "Board 2",
      "Board 3",
      "Board 1",
    ]);
  });
});
