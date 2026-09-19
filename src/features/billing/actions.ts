"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { clientEnv } from "@/lib/env/client";
import { requireOrganizationMembership } from "@/features/organizations/queries";
import { logAuditEvent } from "@/features/audit-log/log";
import { getStripeClient } from "./stripe";
import { planChangeBlockedReason } from "./checkout";
import { changePlanSchema } from "./schema";
import { canManageBilling } from "./permissions";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Changes an organisation's plan. When Stripe is configured and the
 * target plan is a paid one, this creates a Stripe Checkout Session and
 * returns its URL for the caller to redirect to — the actual plan change
 * is applied later, by the webhook handling `checkout.session.completed`
 * (src/app/api/webhooks/stripe/route.ts), once payment is confirmed.
 *
 * Without Stripe there is no way to take payment, so a paid plan is
 * refused (see planChangeBlockedReason) rather than granted for free. Only a
 * FREE downgrade, which never needs payment, is written directly to the
 * Subscription row.
 */
export async function changePlan(
  orgSlug: string,
  input: { planKey: string; billingPeriod?: string },
): Promise<ActionResult & { checkoutUrl?: string }> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageBilling(membership.role)) {
    return { success: false, error: "Only the owner can change the plan" };
  }

  const parsed = changePlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const organizationId = membership.organization.id;
  const [targetPlan, subscription] = await Promise.all([
    db.plan.findUnique({ where: { key: parsed.data.planKey } }),
    db.subscription.findUnique({
      where: { organizationId },
      include: { customer: true, plan: true },
    }),
  ]);
  if (!targetPlan) return { success: false, error: "Unknown plan" };
  if (!subscription) {
    return { success: false, error: "This organisation has no billing record" };
  }

  const stripe = getStripeClient();
  const blockedReason = planChangeBlockedReason(
    targetPlan.key,
    stripe !== null,
  );
  if (blockedReason) return { success: false, error: blockedReason };

  const needsCheckout = targetPlan.key !== "FREE" && stripe !== null;

  if (needsCheckout) {
    const priceId =
      parsed.data.billingPeriod === "YEARLY"
        ? targetPlan.stripePriceIdYearly
        : targetPlan.stripePriceIdMonthly;
    if (!priceId) {
      return {
        success: false,
        error: "This plan isn't available for checkout yet",
      };
    }

    let stripeCustomerId = subscription.customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: membership.organization.name,
        metadata: { organizationId },
      });
      stripeCustomerId = customer.id;
      await db.customer.update({
        where: { id: subscription.customer.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/org/${orgSlug}/settings/billing?checkout=success`,
      cancel_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/org/${orgSlug}/settings/billing?checkout=cancelled`,
      metadata: { organizationId },
      subscription_data: { metadata: { organizationId } },
    });
    if (!session.url) {
      return { success: false, error: "Could not start checkout" };
    }
    return { success: true, checkoutUrl: session.url };
  }

  const fromPlanKey = subscription.plan.key;

  await db.$transaction([
    db.subscription.update({
      where: { organizationId },
      data: {
        planId: targetPlan.id,
        billingPeriod: parsed.data.billingPeriod ?? "MONTHLY",
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    }),
    logAuditEvent(db, {
      organizationId,
      actorId: profile.id,
      action: "PLAN_CHANGED",
      data: { fromPlan: fromPlanKey, toPlan: targetPlan.key },
    }),
  ]);

  revalidatePath(`/org/${orgSlug}/settings/billing`);
  return { success: true };
}

/**
 * Cancels at the end of the current billing period — never immediately,
 * matching Stripe's own `cancel_at_period_end` semantics (see the
 * Subscription model's doc comment in prisma/schema.prisma). The local
 * row is updated regardless of whether Stripe is configured, so the UI
 * reflects the cancellation right away; when a real Stripe subscription
 * exists, it's also told to cancel, and the webhook will reconcile the
 * final state once Stripe actually ends it.
 */
export async function cancelSubscription(
  orgSlug: string,
): Promise<ActionResult> {
  const { profile, membership } = await requireOrganizationMembership(orgSlug);
  if (!canManageBilling(membership.role)) {
    return { success: false, error: "Only the owner can cancel the plan" };
  }

  const organizationId = membership.organization.id;
  const subscription = await db.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
  if (!subscription) {
    return { success: false, error: "This organisation has no billing record" };
  }
  if (subscription.plan.key === "FREE") {
    return { success: false, error: "The Free plan has nothing to cancel" };
  }

  const stripe = getStripeClient();
  if (stripe && subscription.stripeSubscriptionId) {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  await db.$transaction([
    db.subscription.update({
      where: { organizationId },
      data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
    }),
    logAuditEvent(db, {
      organizationId,
      actorId: profile.id,
      action: "PLAN_CHANGED",
      data: { cancellation: true, plan: subscription.plan.key },
    }),
  ]);

  revalidatePath(`/org/${orgSlug}/settings/billing`);
  return { success: true };
}
