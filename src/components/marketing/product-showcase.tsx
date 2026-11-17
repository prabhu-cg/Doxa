import { SectionHeading } from "@/components/marketing/section-heading";

const NOTES = [
  {
    title: "Vote in one click",
    body: "The vote is the first thing in every row. Someone who isn't signed in signs in and comes straight back to where they were.",
  },
  {
    title: "The team's answer, in the row",
    body: "Planned, in progress, declined: each decision sits next to the status, with the reason one click away.",
  },
  {
    title: "Responsiveness you can see",
    body: "The board shows how many ideas the team has answered, so people know their feedback isn't disappearing.",
  },
] as const;

/**
 * What the laptop above is showing, in three plain notes on the white band.
 */
export function ProductShowcase() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="See it in action"
          title="One board. Every voice, and your answer."
          description="This is what your community sees: what people asked for, how much they want it, and what you decided."
        />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {NOTES.map((note, index) => (
            <li key={note.title} className="bg-card rounded-card border p-5">
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{note.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{note.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
