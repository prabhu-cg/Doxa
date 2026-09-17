import "server-only";
import { db } from "@/server/db";
import type { Plan } from "@/generated/prisma/client";

export type FeatureFlag =
  | "advancedPrioritisation"
  | "analytics"
  | "branding"
  | "apiAccess"
  | "integrations";

/**
 * The plan an organisation is currently on, resolved through its
 * Subscription — never a hard-coded default. Every organisation has
 * exactly one Subscription from the moment it's created (see
 * features/organizations/actions.ts), so a missing row here means the
 * data is inconsistent, not that the caller should silently fall back to
 * FREE — surfacing that loudly (throwing) beats masking a bug.
 */
export async function getPlanForOrganization(
  organizationId: string,
): Promise<Plan> {
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
  if (!subscription) {
    throw new Error(
      `Organization ${organizationId} has no Subscription row — every organisation must get one at creation time`,
    );
  }
  return subscription.plan;
}

export async function hasFeature(
  organizationId: string,
  feature: FeatureFlag,
): Promise<boolean> {
  const plan = await getPlanForOrganization(organizationId);
  return plan[feature];
}

export type UsageCounts = {
  members: number;
  boards: number;
  items: number;
};

/**
 * Current usage against the resources a Plan can cap. Boards/Items are
 * counted regardless of archived state — archiving is a visibility
 * change, not a deletion (see prisma/schema.prisma), so it must never be
 * usable as a loophole to cycle unlimited resources on a capped plan.
 * Computed live, never denormalized onto Organization — same
 * never-drifts rationale as vote counts (see the Phase 3 note in
 * prisma/schema.prisma).
 */
export async function getUsageForOrganization(
  organizationId: string,
): Promise<UsageCounts> {
  const [members, boards, items] = await Promise.all([
    db.membership.count({ where: { organizationId } }),
    db.board.count({ where: { organizationId } }),
    db.item.count({ where: { organizationId, deletedAt: null } }),
  ]);
  return { members, boards, items };
}

export type LimitCheck = {
  allowed: boolean;
  limit: number | null;
  used: number;
};

async function checkLimit(
  organizationId: string,
  resource: keyof UsageCounts,
  limitField: "maxMembers" | "maxBoards" | "maxItems",
): Promise<LimitCheck> {
  const [plan, usage] = await Promise.all([
    getPlanForOrganization(organizationId),
    getUsageForOrganization(organizationId),
  ]);
  const limit = plan[limitField];
  const used = usage[resource];
  return { allowed: limit === null || used < limit, limit, used };
}

export function canAddMember(organizationId: string): Promise<LimitCheck> {
  return checkLimit(organizationId, "members", "maxMembers");
}

export function canCreateBoard(organizationId: string): Promise<LimitCheck> {
  return checkLimit(organizationId, "boards", "maxBoards");
}

export function canCreateItem(organizationId: string): Promise<LimitCheck> {
  return checkLimit(organizationId, "items", "maxItems");
}

/**
 * "Maximum organisations" is evaluated per OWNING user, at the moment
 * they try to create a new one — not per-organisation, since the limit
 * doesn't exist yet for an org that hasn't been created. A newly created
 * organisation always starts on FREE (features/organizations/actions.ts),
 * so the relevant cap is always FREE's `maxOrganizations`, regardless of
 * what plan the user's existing organisations are on — there is no flow
 * to pre-select a paid plan before creation. See the assumption noted in
 * the root README.
 */
export async function canCreateOrganizationForUser(
  userId: string,
): Promise<LimitCheck> {
  const [freePlan, owned] = await Promise.all([
    db.plan.findUnique({ where: { key: "FREE" } }),
    db.membership.count({ where: { userId, role: "OWNER" } }),
  ]);
  if (!freePlan) {
    throw new Error("FREE plan is not seeded — run the Phase 5 migration/seed");
  }
  const limit = freePlan.maxOrganizations;
  return { allowed: limit === null || owned < limit, limit, used: owned };
}
