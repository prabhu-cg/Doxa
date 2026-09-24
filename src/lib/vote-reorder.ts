/**
 * A vote on a "Most voted" board can move rows. The vote chip marks the moment
 * it asks for fresh numbers; grid rows that move soon after glide to their new
 * place, while rows that move for any other reason (a filter, "Show more")
 * just appear there.
 */
const WINDOW_MS = 3000;

let votedAt = 0;

export function expectReorder() {
  votedAt = Date.now();
}

export function reorderExpected() {
  return (
    Date.now() - votedAt < WINDOW_MS &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
