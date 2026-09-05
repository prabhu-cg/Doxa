import type { PricingPlan } from "@/components/marketing/pricing-card";

/**
 * Conceptual plans only — no final pricing has been set. `priceLabel` and
 * `billingNote` are placeholder language by design, so a later phase can
 * connect real Stripe prices here without restructuring the pricing UI.
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    priceLabel: "$0",
    billingNote: "Start free, no credit card",
    description: "For getting started with a single organisation.",
    features: [
      "One organisation",
      "Unlimited members",
      "Core feedback loop",
      "Community support",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    priceLabel: "Coming soon",
    billingNote: "Upgrade when you need more",
    description: "For teams that need more structure and control.",
    features: [
      "Everything in Free",
      "Prioritisation & roadmaps",
      "Decision records",
      "Priority support",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: "Business",
    priceLabel: "Coming soon",
    billingNote: "For larger organisations",
    description: "For organisations with advanced governance needs.",
    features: [
      "Everything in Pro",
      "Advanced permissions",
      "Branding controls",
      "Dedicated support",
    ],
    ctaLabel: "Contact Us",
    ctaHref: "/contact",
  },
];
