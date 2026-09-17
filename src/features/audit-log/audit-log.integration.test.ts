// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { logAuditEvent } from "./log";
import { listAuditLogForOrganization } from "./queries";

/**
 * Exercises the audit log's append-only, tenant-scoped read path.
 * logAuditEvent is called directly (it's not a Server Action — see its
 * doc comment) rather than through a feature action, matching how
 * features/activity/log.ts#logActivity is tested indirectly through the
 * actions that call it elsewhere; here the log function itself is the
 * unit under test.
 */
describe("Audit log", () => {
  const actorId = randomUUID();
  let orgAId: string;
  let orgBId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: actorId, displayName: "Admin" } });
    const orgA = await db.organization.create({
      data: {
        name: "Audit Org A",
        slug: `audit-a-${randomUUID().slice(0, 8)}`,
      },
    });
    orgAId = orgA.id;
    const orgB = await db.organization.create({
      data: {
        name: "Audit Org B",
        slug: `audit-b-${randomUUID().slice(0, 8)}`,
      },
    });
    orgBId = orgB.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
    await db.profile.delete({ where: { id: actorId } });
  });

  it("is tenant-scoped — an org only ever sees its own entries", async () => {
    await logAuditEvent(db, {
      organizationId: orgAId,
      actorId,
      action: "BOARD_CREATED",
      data: { name: "Org A's board" },
    });
    await logAuditEvent(db, {
      organizationId: orgBId,
      actorId,
      action: "BOARD_CREATED",
      data: { name: "Org B's board" },
    });

    const orgAEntries = await listAuditLogForOrganization(orgAId);
    expect(orgAEntries).toHaveLength(1);
    expect((orgAEntries[0]!.data as { name: string }).name).toBe(
      "Org A's board",
    );

    const orgBEntries = await listAuditLogForOrganization(orgBId);
    expect(orgBEntries).toHaveLength(1);
  });

  it("never overwrites a previous entry — every logged event is kept, newest first", async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    await logAuditEvent(db, {
      organizationId: orgAId,
      actorId,
      action: "MEMBER_ROLE_CHANGED",
      data: { fromRole: "MEMBER", toRole: "ADMIN" },
    });

    const entries = await listAuditLogForOrganization(orgAId);
    expect(entries).toHaveLength(2);
    expect(entries[0]!.action).toBe("MEMBER_ROLE_CHANGED");
    expect(entries[1]!.action).toBe("BOARD_CREATED");
  });

  it("carries a nullable actor for system-originated events (e.g. a webhook)", async () => {
    await logAuditEvent(db, {
      organizationId: orgAId,
      actorId: null,
      action: "PLAN_CHANGED",
      data: { source: "stripe_webhook" },
    });

    const entries = await listAuditLogForOrganization(orgAId);
    const systemEntry = entries.find((e) => e.action === "PLAN_CHANGED");
    expect(systemEntry?.actor).toBeNull();
  });

  it("respects a limit option without losing tenant scoping", async () => {
    const limited = await listAuditLogForOrganization(orgAId, { limit: 1 });
    expect(limited).toHaveLength(1);
  });
});
