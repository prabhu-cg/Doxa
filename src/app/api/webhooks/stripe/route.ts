import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { db } from "@/server/db";
import { serverEnv } from "@/lib/env/server";
import { getStripeClient } from "@/features/billing/stripe";
import { logAuditEvent } from "@/features/audit-log/log";

/** Maps a Stripe subscription status to our own enum. Stripe has more
 * statuses than we model (`unpaid`, `paused`, ...) — anything we don't
 * explicitly recognize falls back to INCOMPLETE rather than throwing, so
 * an unfamiliar Stripe status never crashes the webhook. */
function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

async function syncSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
) {
  const organizationId = stripeSubscription.metadata.organizationId;
  if (!organizationId) return;

  const item = stripeSubscription.items.data[0];
  const priceId = item?.price.id;
  const plan = priceId
    ? await db.plan.findFirst({
        where: {
          OR: [
            { stripePriceIdMonthly: priceId },
            { stripePriceIdYearly: priceId },
          ],
        },
      })
    : null;

  await db.subscription.update({
    where: { organizationId },
    data: {
      ...(plan ? { planId: plan.id } : {}),
      stripeSubscriptionId: stripeSubscription.id,
      status: mapStripeStatus(stripeSubscription.status),
      billingPeriod:
        item?.price.recurring?.interval === "year" ? "YEARLY" : "MONTHLY",
      currentPeriodStart: item?.current_period_start
        ? new Date(item.current_period_start * 1000)
        : null,
      currentPeriodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    },
  });

  await logAuditEvent(db, {
    organizationId,
    actorId: null,
    action: "PLAN_CHANGED",
    data: { source: "stripe_webhook", status: stripeSubscription.status },
  });
}

/**
 * Stripe webhook receiver — a Route Handler because it's an external
 * caller with its own HTTP semantics (signature header, non-Doxa
 * client), never a Server Action (see the decision order in
 * docs/coding-conventions.md). Returns 501 when Stripe isn't configured
 * for this environment, so this route existing at all never implies
 * Stripe is required to run Doxa locally.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe || !serverEnv.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Billing is not configured for this environment" },
      { status: 501 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (typeof session.subscription === "string") {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription,
          );
          await syncSubscriptionFromStripe(stripeSubscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscriptionFromStripe(event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe webhook] failed to process event:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
