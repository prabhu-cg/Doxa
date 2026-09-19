"use client";

import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/link-button";
import { authPath } from "@/lib/safe-next";

/** Sign in / create account, bringing the visitor back to whichever public page
 * (or open drawer) they were on. The top bar lives in a layout, which can't know
 * the current page on the server, so this reads it from the URL. */
export function SignInLinks() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1.5">
      <LinkButton href={authPath("login", pathname)} variant="ghost" size="sm">
        Sign in
      </LinkButton>
      <LinkButton
        href={authPath("signup", pathname)}
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
      >
        Create account
      </LinkButton>
    </div>
  );
}
