// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getMembershipForSlug, countOwners } from "./queries";
import {
  canDeleteOrganization,
  canLeaveOrganization,
  canUpdateOrganization,
  hasAtLeastRole,
} from "./permissions";

/**
 * Exercises the tenant-isolation and role-enforcement logic directly
 * against the real Supabase Postgres instance, bypassing the Server
 * Action wrappers (which need a live Next.js request for `cookies()`).
 * Profile rows are created directly here rather than through Supabase
 * Auth — these tests only need real foreign-key-valid UUIDs, not real
 * sessions.
 */
describe("organizations tenant isolation and role enforcement", () => {
  const ownerId = randomUUID();
  const memberId = randomUUID();
  const outsiderId = randomUUID();
  let orgId: string;
  const slug = `test-org-${randomUUID().slice(0, 8)}`;

  beforeAll(async () => {
    await db.profile.createMany({
      data: [
        { id: ownerId, displayName: "Test Owner" },
        { id: memberId, displayName: "Test Member" },
        { id: outsiderId, displayName: "Test Outsider" },
      ],
    });

    const org = await db.organization.create({
      data: {
        name: "Test Org",
        slug,
        memberships: {
          create: [
            { userId: ownerId, role: "OWNER" },
            { userId: memberId, role: "MEMBER" },
          ],
        },
      },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: orgId } });
    await db.profile.deleteMany({
      where: { id: { in: [ownerId, memberId, outsiderId] } },
    });
  });

  it("returns the membership and organisation for an actual member", async () => {
    const result = await getMembershipForSlug(slug, ownerId);
    expect(result).not.toBeNull();
    expect(result?.role).toBe("OWNER");
    expect(result?.organization.slug).toBe(slug);
  });

  it("returns null for a user who isn't a member (cross-tenant access)", async () => {
    const result = await getMembershipForSlug(slug, outsiderId);
    expect(result).toBeNull();
  });

  it("returns null for a slug that doesn't exist at all", async () => {
    const result = await getMembershipForSlug("no-such-org-slug", ownerId);
    expect(result).toBeNull();
  });

  it("returns the same null shape for 'no such org' and 'not a member' — IDOR hardening", async () => {
    const nonexistent = await getMembershipForSlug("no-such-org-slug", ownerId);
    const notAMember = await getMembershipForSlug(slug, outsiderId);
    expect(nonexistent).toBe(notAMember); // both null, indistinguishable
  });

  it("counts owners correctly", async () => {
    expect(await countOwners(orgId)).toBe(1);
  });

  it("enforces the role hierarchy", () => {
    expect(hasAtLeastRole("OWNER", "MEMBER")).toBe(true);
    expect(hasAtLeastRole("MEMBER", "OWNER")).toBe(false);
    expect(hasAtLeastRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("only owners and admins can update organisation settings", () => {
    expect(canUpdateOrganization("OWNER")).toBe(true);
    expect(canUpdateOrganization("ADMIN")).toBe(true);
    expect(canUpdateOrganization("MEMBER")).toBe(false);
  });

  it("only owners can delete the organisation", () => {
    expect(canDeleteOrganization("OWNER")).toBe(true);
    expect(canDeleteOrganization("ADMIN")).toBe(false);
  });

  it("blocks the sole owner from leaving, but allows anyone else", () => {
    expect(canLeaveOrganization("OWNER", 1)).toBe(false);
    expect(canLeaveOrganization("OWNER", 2)).toBe(true);
    expect(canLeaveOrganization("MEMBER", 1)).toBe(true);
  });

  it("rejects a duplicate membership for the same user in the same org", async () => {
    await expect(
      db.membership.create({
        data: { organizationId: orgId, userId: ownerId, role: "MEMBER" },
      }),
    ).rejects.toThrow();
  });

  it("cascade-deletes memberships when the organisation is deleted", async () => {
    const tempOrg = await db.organization.create({
      data: {
        name: "Temp org",
        slug: `temp-org-${randomUUID().slice(0, 8)}`,
        memberships: { create: [{ userId: ownerId, role: "OWNER" }] },
      },
    });

    await db.organization.delete({ where: { id: tempOrg.id } });

    const remaining = await db.membership.findMany({
      where: { organizationId: tempOrg.id },
    });
    expect(remaining).toHaveLength(0);
  });
});
