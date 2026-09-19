import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { Organization } from "@/generated/prisma/client";

/** The organisation behind a public URL, or null. Cached for the request, so the
 * layout, the page and the metadata don't each go to the database for it. */
export const getPublicOrganization = cache(
  async (slug: string): Promise<Organization | null> =>
    db.organization.findUnique({ where: { slug } }),
);

const PUBLIC_PATH = /^\/(?:b|r)\/([a-z0-9-]+)(?:\/|$|\?)/;

/** When a sign-in is on its way back to an organisation's public page, that
 * organisation — so the sign-in can be theirs and not just Doxa's. */
export async function getOrganizationFromNext(
  next: string | null | undefined,
): Promise<Organization | null> {
  const slug = next ? PUBLIC_PATH.exec(next)?.[1] : undefined;
  return slug ? getPublicOrganization(slug) : null;
}
