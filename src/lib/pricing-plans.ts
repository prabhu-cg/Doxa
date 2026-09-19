import type { PricingPlan } from "@/components/marketing/pricing-card";
import { DEFAULT_PLANS } from "@/features/billing/defaults";

/**
 * The marketing site's view of the plans, built from `DEFAULT_PLANS` — the
 * same data the database is seeded from — so what visitors read can't drift
 * from what the app enforces. Only capabilities that exist and are enforced
 * are listed: `analytics`, `apiAccess` and `integrations` are modelled on the
 * plans but not built yet, so they are deliberately not advertised.
 */

/** Flip to true once Stripe checkout is live (a Stripe key set and price ids
 * on the paid plans). Until then paid plans show their price but say checkout
 * is coming, and every call to action starts on Free. */
export const CHECKOUT_LIVE = false;

export type PlanKey = (typeof DEFAULT_PLANS)[number]["key"];

export function planByKey(key: PlanKey) {
  const plan = DEFAULT_PLANS.find((p) => p.key === key);
  if (!plan) throw new Error(`Unknown plan ${key}`);
  return plan;
}

/** "Unlimited" for no cap, otherwise the number with thousands separators. */
export function formatLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : limit.toLocaleString("en-US");
}

const dollars = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

function limitFeatures(plan: ReturnType<typeof planByKey>): string[] {
  const noun = (n: number | null, one: string, many: string) =>
    n === null
      ? `Unlimited ${many}`
      : `Up to ${formatLimit(n)} ${n === 1 ? one : many}`;
  return [
    noun(plan.maxOrganizations, "organisation", "organisations"),
    noun(plan.maxMembers, "team member", "team members"),
    noun(plan.maxBoards, "board", "boards"),
    plan.maxItems === null
      ? "Unlimited items created by your team"
      : `Up to ${formatLimit(plan.maxItems)} items created by your team`,
  ];
}

const free = planByKey("FREE");
const pro = planByKey("PRO");
const business = planByKey("BUSINESS");

const paidNote = (plan: typeof pro) =>
  CHECKOUT_LIVE
    ? `per month, or ${dollars(plan.priceYearlyCents)} billed yearly`
    : "per month · paid checkout opens soon";

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: free.name,
    priceLabel: dollars(free.priceMonthlyCents),
    billingNote: "Start free, no credit card",
    description: free.description,
    features: [
      ...limitFeatures(free),
      "Feedback, voting & discussion",
      "Decision records, with public reasons",
      "Public boards & public roadmap",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/signup",
  },
  {
    name: pro.name,
    priceLabel: dollars(pro.priceMonthlyCents),
    billingNote: paidNote(pro),
    description: pro.description,
    features: [
      "Everything in Free",
      ...limitFeatures(pro),
      ...(pro.advancedPrioritisation ? ["Cross-board prioritisation"] : []),
      ...(pro.branding ? ["Your logo & accent colour on public pages"] : []),
    ],
    ctaLabel: CHECKOUT_LIVE ? "Choose Pro" : "Start Free",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: business.name,
    priceLabel: dollars(business.priceMonthlyCents),
    billingNote: paidNote(business),
    description: business.description,
    features: [
      "Everything in Pro",
      "No limits on organisations, team members, boards or items",
    ],
    ctaLabel: "Contact Us",
    ctaHref: "/contact",
  },
];
