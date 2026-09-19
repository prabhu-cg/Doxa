/**
 * "How responsive is this team?" — worked out from when each item arrived and
 * when it first got a decision, so an audience can see whether feedback is
 * actually being answered. Pure, so the arithmetic is easy to test.
 */
export type ResponseRow = { createdAt: Date; firstDecisionAt: Date | null };

export type ResponseSummary = {
  total: number;
  answered: number;
  /** Median days from arriving to a first decision; null when nothing is decided. */
  medianDays: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function summariseResponsiveness(rows: ResponseRow[]): ResponseSummary {
  const waits = rows
    .filter((row) => row.firstDecisionAt !== null)
    .map((row) =>
      Math.max(
        0,
        (row.firstDecisionAt!.getTime() - row.createdAt.getTime()) / DAY_MS,
      ),
    )
    .sort((a, b) => a - b);

  let medianDays: number | null = null;
  if (waits.length > 0) {
    const mid = Math.floor(waits.length / 2);
    medianDays =
      waits.length % 2 ? waits[mid] : (waits[mid - 1] + waits[mid]) / 2;
  }
  return { total: rows.length, answered: waits.length, medianDays };
}

/** One plain-language line for a public board, or null when there is nothing
 * to say yet. `noun` is what the organisation calls an item. */
export function describeResponsiveness(
  summary: ResponseSummary,
  noun: { singular: string; plural: string },
): string | null {
  if (summary.total === 0) return null;
  const label = (
    summary.total === 1 ? noun.singular : noun.plural
  ).toLowerCase();

  if (summary.answered === 0) {
    return `The team hasn't decided on any ${noun.plural.toLowerCase()} yet.`;
  }
  const days = Math.max(1, Math.ceil(summary.medianDays ?? 0));
  return `The team has decided on ${summary.answered} of ${summary.total} ${label}, usually within ${days} ${days === 1 ? "day" : "days"}.`;
}
