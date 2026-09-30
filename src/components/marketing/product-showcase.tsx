import Image from "next/image";
import { SectionHeading } from "@/components/marketing/section-heading";

/** Where each numbered marker sits on the screenshot, as a share of its width
 * and height, so it stays on the same spot at every size. */
const NOTES = [
  {
    title: "Vote in one click",
    body: "The vote is the first thing in every row. Someone who isn't signed in signs in and comes straight back to where they were.",
    at: { left: "3.6%", top: "49.6%" },
  },
  {
    title: "The team's answer, in the row",
    body: "Planned, in progress, declined: each decision sits next to the status, with the reason one click away.",
    at: { left: "56.2%", top: "41.9%" },
  },
  {
    title: "Responsiveness you can see",
    body: "The board shows how many ideas the team has answered, so people know their feedback isn't disappearing.",
    at: { left: "30%", top: "24%" },
  },
] as const;

const ALT =
  "A sample Doxa public board: ideas ranked by votes, each with its status and the team's decision.";

/**
 * The product itself, large, under the hero: a real screenshot of a public
 * board (sample data) in a browser-style frame. A soft glow of the accent sits
 * behind it, the lower edge fades to suggest the list goes on, and numbered
 * markers tie three details on the screen to the captions below. The light and
 * dark screenshots swap with the theme, in CSS alone.
 */
export function ProductShowcase() {
  return (
    <section className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="See it in action"
          title="One board. Every voice, and your answer."
          description="This is what your community sees: what people asked for, how much they want it, and what you decided."
        />

        <div className="relative mx-auto mt-12 max-w-5xl">
          <div
            aria-hidden="true"
            className="bg-primary/25 dark:bg-primary/20 pointer-events-none absolute inset-x-[8%] -top-6 -bottom-10 -z-10 rounded-[50%] blur-3xl"
          />
          <div className="bg-card ring-foreground/5 overflow-hidden rounded-xl border shadow-2xl ring-1">
            <div className="bg-muted/60 flex items-center gap-3 border-b px-4 py-2.5">
              <div aria-hidden="true" className="flex gap-1.5">
                <span className="bg-border-strong size-2.5 rounded-full" />
                <span className="bg-border-strong size-2.5 rounded-full" />
                <span className="bg-border-strong size-2.5 rounded-full" />
              </div>
              <div className="bg-background text-muted-foreground mx-auto flex h-6 w-full max-w-xs items-center justify-center rounded-md border px-3 text-xs">
                Northwind · Feature requests
              </div>
              <div aria-hidden="true" className="hidden w-12 sm:block" />
            </div>

            <div
              className="relative"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 76%, transparent 100%)",
              }}
            >
              <Image
                src="/marketing/board-light.jpg"
                alt={ALT}
                width={1400}
                height={830}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="block h-auto w-full dark:hidden"
              />
              <Image
                src="/marketing/board-dark.jpg"
                alt={ALT}
                width={1400}
                height={830}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="hidden h-auto w-full dark:block"
              />
              {NOTES.map((note, index) => (
                <span
                  key={note.title}
                  aria-hidden="true"
                  style={note.at}
                  className="bg-primary text-primary-foreground ring-background absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold shadow-md ring-2 sm:size-6 sm:text-xs"
                >
                  {index + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ol className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          {NOTES.map((note, index) => (
            <li key={note.title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {note.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground mt-8 text-center text-xs">
          A sample board with example data.
        </p>
      </div>
    </section>
  );
}
