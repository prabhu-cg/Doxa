/** Seeded into every new organisation (see features/organizations/actions.ts)
 * and backfilled onto every pre-existing one
 * (prisma/migrations/20260915193907_phase4_*). "None" is marked
 * `isDefault` — the priority a newly-created Item starts at, since an
 * Item shouldn't read as prioritised just because it exists. See
 * "Priority" in docs/architecture.md.
 */
export const DEFAULT_PRIORITIES: {
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
  isDefault?: boolean;
}[] = [
  {
    name: "None",
    slug: "none",
    color: "#94a3b8",
    sortOrder: 0,
    isDefault: true,
  },
  { name: "Low", slug: "low", color: "#60a5fa", sortOrder: 1 },
  { name: "Medium", slug: "medium", color: "#f59e0b", sortOrder: 2 },
  { name: "High", slug: "high", color: "#f97316", sortOrder: 3 },
  { name: "Critical", slug: "critical", color: "#ef4444", sortOrder: 4 },
];
