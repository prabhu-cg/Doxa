// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  canAddMember,
  canCreateBoard,
  canCreateItem,
  canCreateOrganizationForUser,
  getPlanForOrganization,
  getUsageForOrganization,
  hasFeature,
} from "./queries";

/**
 * Exercises the central entitlement/feature system: every check resolves
 * through Subscription -> Plan, usage is computed live (never
 * denormalized), and archived (not just active) Boards/Items still count
 * against a plan's limit — archiving is a visibility change, not a
 * deletion, so it must never be a loophole for cycling unlimited
 * resources. Uses the real, migration-seeded FREE/PRO/BUSINESS Plan rows
 * (there are only ever three, `PlanKey` is globally unique) rather than
 * creating fixture Plans, and reads each plan's own configured limits
 * dynamically instead of hard-coding them, so this test stays correct if
 * the seeded limits are ever reconfigured.
 */
describe("Entitlements", () => {
  const authorId = randomUUID();
  let freeOrgId: string;
  let businessOrgId: string;

  beforeAll(async () => {
    await db.profile.create({ data: { id: authorId, displayName: "Author" } });

    const [freePlan, businessPlan] = await Promise.all([
      db.plan.findUniqueOrThrow({ where: { key: "FREE" } }),
      db.plan.findUniqueOrThrow({ where: { key: "BUSINESS" } }),
    ]);

    const freeOrg = await db.organization.create({
      data: {
        name: "Entitlements Free Org",
        slug: `entitlements-free-${randomUUID().slice(0, 8)}`,
        memberships: { create: { userId: authorId, role: "OWNER" } },
      },
    });
    freeOrgId = freeOrg.id;
    const freeCustomer = await db.customer.create({
      data: { organizationId: freeOrgId },
    });
    await db.subscription.create({
      data: {
        organizationId: freeOrgId,
        customerId: freeCustomer.id,
        planId: freePlan.id,
      },
    });

    const businessOrg = await db.organization.create({
      data: {
        name: "Entitlements Business Org",
        slug: `entitlements-biz-${randomUUID().slice(0, 8)}`,
        memberships: { create: { userId: authorId, role: "OWNER" } },
      },
    });
    businessOrgId = businessOrg.id;
    const businessCustomer = await db.customer.create({
      data: { organizationId: businessOrgId },
    });
    await db.subscription.create({
      data: {
        organizationId: businessOrgId,
        customerId: businessCustomer.id,
        planId: businessPlan.id,
      },
    });
  });

  afterAll(async () => {
    await db.organization.deleteMany({
      where: { id: { in: [freeOrgId, businessOrgId] } },
    });
    await db.profile.delete({ where: { id: authorId } });
  });

  it("resolves the plan for an organisation through its Subscription", async () => {
    const plan = await getPlanForOrganization(freeOrgId);
    expect(plan.key).toBe("FREE");
  });

  it("throws for an organisation with no Subscription row, rather than silently defaulting", async () => {
    const orphanOrg = await db.organization.create({
      data: { name: "Orphan Org", slug: `orphan-${randomUUID().slice(0, 8)}` },
    });
    await expect(getPlanForOrganization(orphanOrg.id)).rejects.toThrow();
    await db.organization.delete({ where: { id: orphanOrg.id } });
  });

  it("hasFeature reads the flag straight from the resolved plan", async () => {
    const [freePlan, businessPlan] = await Promise.all([
      getPlanForOrganization(freeOrgId),
      getPlanForOrganization(businessOrgId),
    ]);
    expect(await hasFeature(freeOrgId, "branding")).toBe(freePlan.branding);
    expect(await hasFeature(businessOrgId, "branding")).toBe(
      businessPlan.branding,
    );
  });

  it("a null limit (BUSINESS) is always allowed regardless of usage", async () => {
    const space = await db.space.create({
      data: { organizationId: businessOrgId, name: "Product", slug: "product" },
    });
    // Create more boards than any FREE-tier limit would allow.
    await db.board.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        organizationId: businessOrgId,
        spaceId: space.id,
        name: `Board ${i}`,
        slug: `board-${i}`,
      })),
    });

    const check = await canCreateBoard(businessOrgId);
    expect(check.limit).toBeNull();
    expect(check.allowed).toBe(true);
  });

  it("archived boards still count against the limit — archiving is not a loophole", async () => {
    const plan = await getPlanForOrganization(freeOrgId);
    const maxBoards = plan.maxBoards;
    expect(maxBoards).not.toBeNull();

    const space = await db.space.create({
      data: { organizationId: freeOrgId, name: "Product", slug: "product-2" },
    });
    const boards = await Promise.all(
      Array.from({ length: maxBoards! }, (_, i) =>
        db.board.create({
          data: {
            organizationId: freeOrgId,
            spaceId: space.id,
            name: `Free Board ${i}`,
            slug: `free-board-${i}`,
          },
        }),
      ),
    );

    let check = await canCreateBoard(freeOrgId);
    expect(check.used).toBe(maxBoards);
    expect(check.allowed).toBe(false);

    // Archiving one doesn't free up quota.
    await db.board.update({
      where: { id: boards[0]!.id },
      data: { status: "ARCHIVED" },
    });
    check = await canCreateBoard(freeOrgId);
    expect(check.used).toBe(maxBoards);
    expect(check.allowed).toBe(false);

    await db.board.deleteMany({ where: { organizationId: freeOrgId } });
  });

  it("getUsageForOrganization counts members, boards, and non-deleted items", async () => {
    const usage = await getUsageForOrganization(freeOrgId);
    expect(usage.members).toBe(1);
    expect(usage.boards).toBe(0);
    expect(usage.items).toBe(0);
  });

  it("canAddMember and canCreateItem resolve through the same checkLimit shape", async () => {
    const memberCheck = await canAddMember(freeOrgId);
    expect(memberCheck.used).toBe(1);
    expect(memberCheck.allowed).toBe(true);

    const itemCheck = await canCreateItem(freeOrgId);
    expect(itemCheck.used).toBe(0);
    expect(itemCheck.allowed).toBe(true);
  });

  it("canCreateOrganizationForUser counts OWNER memberships against FREE's cap", async () => {
    const freshUserId = randomUUID();
    await db.profile.create({
      data: { id: freshUserId, displayName: "Fresh Owner" },
    });

    const check = await canCreateOrganizationForUser(freshUserId);
    expect(check.used).toBe(0);
    expect(check.allowed).toBe(true);

    await db.profile.delete({ where: { id: freshUserId } });
  });

  it("an existing OWNER's count includes organisations on any plan, not just FREE", async () => {
    // authorId owns freeOrgId (FREE) and businessOrgId (BUSINESS) — both
    // must be counted, since the FREE cap applies to how many
    // organisations a user owns in total, not just how many FREE ones.
    const check = await canCreateOrganizationForUser(authorId);
    expect(check.used).toBeGreaterThanOrEqual(2);
  });
});
