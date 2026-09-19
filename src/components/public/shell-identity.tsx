"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { OrgIdentity } from "./org-identity";

/** A board's or the roadmap's masthead carries the organisation's mark large, so
 * the top bar keeps only the name there; on every other page (an item's own page)
 * the top bar is where the mark is. */
const MASTHEAD_PAGES = /^\/(?:b\/[^/]+\/[^/]+|r\/[^/]+)\/?$/;

export function ShellIdentity(props: ComponentProps<typeof OrgIdentity>) {
  const hideMark = MASTHEAD_PAGES.test(usePathname());
  return <OrgIdentity {...props} hideMark={hideMark} />;
}
