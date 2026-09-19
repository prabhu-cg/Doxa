/**
 * A date the same on the server and in the browser, and the same in every
 * locale ("17 Sep 2026" — never "17/09" against "09/17"). Fixed to UTC so a
 * server in one zone and a reader in another can't disagree about the day.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
