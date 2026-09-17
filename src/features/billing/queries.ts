import "server-only";
import { db } from "@/server/db";
import type { Plan, Subscription } from "@/generated/prisma/client";

export type SubscriptionWithPlan = Subscription & { plan: Plan };

export async function listPlans(): Promise<Plan[]> {
  return db.plan.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getPlanByKey(
  key: "FREE" | "PRO" | "BUSINESS",
): Promise<Plan | null> {
  return db.plan.findUnique({ where: { key } });
}

export async function getSubscriptionForOrganization(
  organizationId: string,
): Promise<SubscriptionWithPlan | null> {
  return db.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
}
