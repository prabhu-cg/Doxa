// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getDefaultPriority, listPrioritiesForOrganization } from "./queries";
import { canManagePriorities } from "./permissions";
import { DEFAULT_PRIORITIES } from "./defaults";

/**
 * Priority is organisation-controlled data, the same "data, not code"
 * pattern as Status/ItemType (docs/architecture.md) — this exercises
 * tenant isolation and the default-priority resolution the same way
 * features/statuses' getDefaultStatus equivalent is exercised implicitly
 * via features/items/items.integration.test.ts.
 */
describe("Priority tenant isolation and defaults", () => {
  let orgAId: string;
  let orgBId: string;

  beforeAll(async () => {
    const orgA = await db.organization.create({
      data: {
        name: "Priority Org A",
        slug: `priority-a-${randomUUID().slice(0, 8)}`,
        priorities: { create: DEFAULT_PRIORITIES },
      },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: {
        name: "Priority Org B",
        slug: `priority-b-${randomUUID().slice(0, 8)}`,
      },
    });
    orgBId = orgB.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
  });

  it("only returns priorities belonging to the given organisation", async () => {
    const orgAPriorities = await listPrioritiesForOrganization(orgAId);
    expect(orgAPriorities).toHaveLength(5);
    expect(await listPrioritiesForOrganization(orgBId)).toEqual([]);
  });

  it("severity order matches sortOrder: None < Low < Medium < High < Critical", async () => {
    const priorities = await listPrioritiesForOrganization(orgAId);
    expect(priorities.map((p) => p.name)).toEqual([
      "None",
      "Low",
      "Medium",
      "High",
      "Critical",
    ]);
  });

  it("getDefaultPriority resolves to the org's isDefault priority (None)", async () => {
    const defaultPriority = await getDefaultPriority(orgAId);
    expect(defaultPriority?.name).toBe("None");
  });

  it("an organisation with no priorities configured has no default", async () => {
    expect(await getDefaultPriority(orgBId)).toBeNull();
  });
});

describe("Priority permissions", () => {
  it("only owners and admins can manage priorities", () => {
    expect(canManagePriorities("MEMBER")).toBe(false);
    expect(canManagePriorities("ADMIN")).toBe(true);
    expect(canManagePriorities("OWNER")).toBe(true);
  });
});
