/**
 * Card grids lead with whatever was touched last, whatever its status: the
 * later of the card's own edit and its newest item, which is the same value
 * the card prints as "Updated …", so the order never contradicts the label.
 * A tie goes to the newer card, then to the larger id, so the order is stable.
 */
export function byRecentActivity<
  T extends { lastActivityAt: Date; createdAt: Date; id: string },
>(a: T, b: T): number {
  return (
    b.lastActivityAt.getTime() - a.lastActivityAt.getTime() ||
    b.createdAt.getTime() - a.createdAt.getTime() ||
    (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)
  );
}
