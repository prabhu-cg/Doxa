// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  getPlanByKey,
  getSubscriptionForOrganization,
  listPlans,
} from "./queries";
import { canManageBilling } from "./permissions";
import { DEFAULT_PLANS } from "./defaults";

/**
 * Exercises the billing data model: the three global Plan rows seeded by
 * prisma/migrations/20260916084203_phase5_* match DEFAULT_PLANS (the
 * source of truth application code reads seed data from), and every
 * organisation's Subscription resolves to its Customer/Plan correctly.
 * changePlan/cancelSubscription themselves are Server Actions needing a
 * live request context (same reasoning as every other
 * *.integration.test.ts in this codebase) and are exercised end-to-end
 * instead, in e2e/billing.spec.ts.
 */
describe("Plan seeding", () => {
  it("seeds exactly one row per PlanKey, matching DEFAULT_PLANS", async () => {
    const plans = await listPlans();
    expect(plans).toHaveLength(3);
    expect(plans.map((p) => p.key).sort()).toEqual(["BUSINESS", "FREE", "PRO"]);

    for (const expected of DEFAULT_PLANS) {
      const actual = plans.find((p) => p.key === expected.key);
      expect(actual).toBeDefined();
      expect(actual!.maxOrganizations).toBe(expected.maxOrganizations);
      expect(actual!.maxMembers).toBe(expected.maxMembers);
      expect(actual!.maxBoards).toBe(expected.maxBoards);
      expect(actual!.maxItems).toBe(expected.maxItems);
      expect(actual!.advancedPrioritisation).toBe(
        expected.advancedPrioritisation,
      );
      expect(actual!.branding).toBe(expected.branding);
    }
  });

  it("FREE plan has zero cost and the tightest limits", async () => {
    const free = await getPlanByKey("FREE");
    expect(free?.priceMonthlyCents).toBe(0);
    expect(free?.branding).toBe(false);
    expect(free?.advancedPrioritisation).toBe(false);
  });

  it("BUSINESS plan has unlimited organisations/members/boards/items", async () => {
    const business = await getPlanByKey("BUSINESS");
    expect(business?.maxOrganizations).toBeNull();
    expect(business?.maxMembers).toBeNull();
    expect(business?.maxBoards).toBeNull();
    expect(business?.maxItems).toBeNull();
  });
});

describe("Customer/Subscription relationship", () => {
  let orgId: string;

  beforeAll(async () => {
    const freePlan = await getPlanByKey("FREE");
    const org = await db.organization.create({
      data: {
        name: "Billing Test Org",
        slug: `billing-test-${randomUUID().slice(0, 8)}`,
      },
    });
    orgId = org.id;
    const customer = await db.customer.create({
      data: { organizationId: orgId },
    });
    await db.subscription.create({
      data: {
        organizationId: orgId,
        customerId: customer.id,
        planId: freePlan!.id,
      },
    });
  });

  afterAll(async () => {
    await db.organization.delete({ where: { id: orgId } });
  });

  it("resolves an organisation's subscription with its plan attached", async () => {
    const subscription = await getSubscriptionForOrganization(orgId);
    expect(subscription?.plan.key).toBe("FREE");
    expect(subscription?.status).toBe("ACTIVE");
    expect(subscription?.cancelAtPeriodEnd).toBe(false);
  });

  it("returns null for an organisation with no billing record", async () => {
    expect(
      await getSubscriptionForOrganization("nonexistent-org-id"),
    ).toBeNull();
  });
});

describe("Billing permissions", () => {
  it("only the owner can manage billing, not an admin", () => {
    expect(canManageBilling("MEMBER")).toBe(false);
    expect(canManageBilling("ADMIN")).toBe(false);
    expect(canManageBilling("OWNER")).toBe(true);
  });
});
