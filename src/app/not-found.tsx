import type { Metadata } from "next";
import { LinkButton } from "@/components/link-button";
import { NotFoundPath } from "@/components/not-found-path";

export const metadata: Metadata = { title: "Page not found" };

const DIGIT =
  "text-[6rem] leading-none font-bold tracking-tighter select-none sm:text-[8rem]";

/**
 * The page for any address that doesn't exist. The 0 is Doxa's own mark: the
 * page nobody answered. A wash of the warm ground sits behind it, so the page
 * is grounded without adding a colour.
 */
export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,var(--surface)_0%,var(--background)_70%)]"
      />
      <div className="relative flex max-w-md flex-col items-center text-center">
        <span className="bg-primary-soft text-primary-text mb-7 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase">
          <span
            aria-hidden="true"
            className="bg-primary-text size-1.5 rounded-full"
          />
          Error 404
        </span>

        <div
          className="mb-5 flex items-center justify-center gap-1"
          aria-hidden="true"
        >
          <span className={DIGIT}>4</span>
          <span className="border-border-strong relative mx-[-0.25rem] flex size-20 items-center justify-center rounded-full border-[1.5px] border-dashed sm:size-28">
            {/* eslint-disable-next-line @next/next/no-img-element -- the static brand mark, as everywhere else */}
            <img
              src="/doxa-logo.svg"
              alt=""
              className="size-11 -rotate-6 drop-shadow-lg sm:size-14"
            />
          </span>
          <span className={DIGIT}>4</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">
          This page didn&apos;t get a reply.
        </h1>
        <p className="text-muted-foreground mt-2 mb-8 max-w-sm text-[15px] leading-relaxed">
          It may have moved, or it never existed. Doxa can&apos;t answer what
          isn&apos;t there.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <LinkButton href="/">Back to home</LinkButton>
          <LinkButton href="/app" variant="outline">
            Open the app
          </LinkButton>
        </div>

        <NotFoundPath />
      </div>
    </main>
  );
}
