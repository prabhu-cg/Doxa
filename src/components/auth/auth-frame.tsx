"use client";

import { useSearchParams } from "next/navigation";

/** The two-column sign-in frame: `aside` (Doxa's own marketing panel) beside the
 * form column, with `logo` above the form. Nothing but layout. */
export function AuthFrameView({
  branded,
  aside,
  logo,
  children,
}: {
  branded: boolean;
  aside: React.ReactNode;
  logo: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      {branded ? null : aside}
      <div className="bg-muted flex flex-1 flex-col items-center justify-center px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          {branded ? null : logo}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The sign-in page's frame. When the visitor is signing in on their way back to
 * an organisation's public page (`next` points into `/b/…` or `/r/…`), Doxa's own
 * marketing panel and logo step aside so the page can be the organisation's — see
 * `AuthBrand`. Otherwise it is Doxa's, as it always was. Reads the URL, so it
 * must sit inside a Suspense boundary (the layout provides one).
 */
export function AuthFrame(
  props: Omit<Parameters<typeof AuthFrameView>[0], "branded">,
) {
  const next = useSearchParams().get("next") ?? "";
  return <AuthFrameView branded={/^\/(?:b|r)\//.test(next)} {...props} />;
}
