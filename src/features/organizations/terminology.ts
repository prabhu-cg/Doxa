import type { Organization } from "@/generated/prisma/client";

/** What this organisation calls an Item, defaulting to "Item"/"Items" —
 * see the Organization model's doc comment in prisma/schema.prisma.
 * Applied in the highest-traffic item-related copy only (the "New Item"
 * flow), not swept across every string in the app. */
export function getItemTerminology(
  organization: Pick<
    Organization,
    "itemTerminologySingular" | "itemTerminologyPlural"
  >,
): { singular: string; plural: string } {
  return {
    singular: organization.itemTerminologySingular,
    plural: organization.itemTerminologyPlural,
  };
}
