/** Seeded into every new organisation (see features/organizations/actions.ts)
 * so Boards have something to submit against immediately. Purely initial
 * data — organisations can rename, reorder, or archive these afterwards
 * via the item-types admin UI. Never referenced by name anywhere else in
 * the app; see "Item Types" in docs/architecture.md.
 */
export const DEFAULT_ITEM_TYPES: { name: string; slug: string }[] = [
  { name: "Feature", slug: "feature" },
  { name: "Idea", slug: "idea" },
  { name: "Bug", slug: "bug" },
  { name: "Improvement", slug: "improvement" },
  { name: "Suggestion", slug: "suggestion" },
  { name: "Requirement", slug: "requirement" },
];
