/** Seeded once via `pnpm db:seed-plans` (features/billing/seed.ts) and by
 * the Phase 5 migration's one-time backfill
 * (prisma/migrations/20260916084203_phase5_*) — the single source of
 * truth for what each commercial tier includes. Changing a limit means
 * editing a `Plan` row (directly, or by re-running the seed), never an
 * application code change — see "Plans" in docs/architecture.md.
 *
 * `null` on any `max*` field means unlimited.
 */
export const DEFAULT_PLANS: {
  key: "FREE" | "PRO" | "BUSINESS";
  name: string;
  description: string;
  maxOrganizations: number | null;
  maxMembers: number | null;
  maxBoards: number | null;
  maxItems: number | null;
  maxStorageMb: number | null;
  advancedPrioritisation: boolean;
  analytics: boolean;
  branding: boolean;
  apiAccess: boolean;
  integrations: boolean;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  sortOrder: number;
}[] = [
  {
    key: "FREE",
    name: "Free",
    description: "For small teams trying Doxa out.",
    maxOrganizations: 1,
    maxMembers: 5,
    maxBoards: 3,
    maxItems: 100,
    maxStorageMb: 100,
    advancedPrioritisation: false,
    analytics: false,
    branding: false,
    apiAccess: false,
    integrations: false,
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    sortOrder: 0,
  },
  {
    key: "PRO",
    name: "Pro",
    description: "For growing teams that need real prioritisation.",
    maxOrganizations: 5,
    maxMembers: 25,
    maxBoards: 20,
    maxItems: 2000,
    maxStorageMb: 5000,
    advancedPrioritisation: true,
    analytics: true,
    branding: true,
    apiAccess: false,
    integrations: true,
    priceMonthlyCents: 1900,
    priceYearlyCents: 19000,
    sortOrder: 1,
  },
  {
    key: "BUSINESS",
    name: "Business",
    description: "For organisations running Doxa at scale.",
    maxOrganizations: null,
    maxMembers: null,
    maxBoards: null,
    maxItems: null,
    maxStorageMb: 50000,
    advancedPrioritisation: true,
    analytics: true,
    branding: true,
    apiAccess: true,
    integrations: true,
    priceMonthlyCents: 9900,
    priceYearlyCents: 99000,
    sortOrder: 2,
  },
];
