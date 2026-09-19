/**
 * Why a plan can't be switched to right now, or null if it can. Paid plans
 * need Stripe: without it there is no way to take payment, so switching would
 * hand out a paid plan for free. FREE never needs payment, so downgrading is
 * always allowed.
 */
export function planChangeBlockedReason(
  planKey: string,
  stripeConfigured: boolean,
): string | null {
  if (planKey === "FREE" || stripeConfigured) return null;
  return "Paid plans aren't available yet";
}
