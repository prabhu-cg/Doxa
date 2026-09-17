import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";

/**
 * Returns a Stripe client, or `null` if Stripe isn't configured for this
 * environment. Every caller must handle the `null` case — Stripe is
 * never required for local development (see docs/environment.md); a
 * production deployment sets `STRIPE_SECRET_KEY` and this stops being
 * null there.
 */
export function getStripeClient(): Stripe | null {
  if (!serverEnv.STRIPE_SECRET_KEY) return null;
  return new Stripe(serverEnv.STRIPE_SECRET_KEY);
}

export function isStripeConfigured(): boolean {
  return !!serverEnv.STRIPE_SECRET_KEY;
}
