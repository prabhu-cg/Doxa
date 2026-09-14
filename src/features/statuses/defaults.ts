/** Seeded into every new organisation (see features/organizations/actions.ts).
 * "Open" is marked `isDefault` — the status a newly-created Item starts
 * in. See "Statuses" in the Phase 2 brief and docs/architecture.md.
 */
export const DEFAULT_STATUSES: {
  name: string;
  slug: string;
  color: string;
  isDefault?: boolean;
}[] = [
  { name: "Open", slug: "open", color: "#64748b", isDefault: true },
  { name: "Under Review", slug: "under-review", color: "#a855f7" },
  { name: "Planned", slug: "planned", color: "#3b82f6" },
  { name: "In Progress", slug: "in-progress", color: "#f59e0b" },
  { name: "Completed", slug: "completed", color: "#22c55e" },
  { name: "Declined", slug: "declined", color: "#ef4444" },
];
