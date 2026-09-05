"use client";

/**
 * Analytics event names used across the marketing site. Centralized here
 * so a future integration (PostHog or otherwise) has one place to wire
 * up, and call sites don't hand-type event name strings.
 */
export const ANALYTICS_EVENTS = {
  marketingCtaClicked: "marketing_cta_clicked",
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  pricingViewed: "pricing_viewed",
  contactSubmitted: "contact_submitted",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * No analytics provider is configured yet — this is a clean seam for one
 * (e.g. PostHog) to be dropped in later without touching call sites.
 * Logs in development only; a no-op in production. Never collects more
 * than the caller explicitly passes in `properties`.
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${event}`, properties ?? {});
  }
}
