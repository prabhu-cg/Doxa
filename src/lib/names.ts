/**
 * The "no two active things share a name" rule, in one place: how a name is
 * compared (ignoring case) and how the refusal is worded, so spaces, boards
 * and every configuration list check and say it the same way. Names arrive
 * already trimmed from their schemas.
 */

/** Prisma filter for "has this name, ignoring case". */
export function sameName(name: string) {
  return { equals: name, mode: "insensitive" as const };
}

/** Prisma filter for "any row but this one", so a rename or a restore doesn't
 * collide with the row it is acting on. */
export function otherThan(id?: string) {
  return id ? { id: { not: id } } : {};
}

/** `scope` narrows where the name is unique, e.g. "in this space". */
export function nameTakenMessage(
  kind: string,
  name: string,
  scope?: string,
): string {
  const label = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `${label} "${name}" already exists${scope ? ` ${scope}` : ""}`;
}

export function restoreBlockedMessage(kind: string, name: string): string {
  return `Can't restore: another ${kind} named "${name}" already exists. Rename one of them first.`;
}

/** When two creates race past the name check and the database's slug
 * constraint catches the second. Trying again gets the normal message. */
export const NAME_RACE_MESSAGE =
  "Something with that name was just created. Please try again.";
