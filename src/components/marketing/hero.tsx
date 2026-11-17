import { LinkButton } from "@/components/link-button";
import { MacbookMockup } from "@/components/marketing/macbook-mockup";

/**
 * The first screen: desk ground, one Newsreader headline with a single ochre
 * phrase, one primary action, and the product itself on a MacBook that
 * straddles the desk and the white band beneath it.
 */
export function Hero() {
  return (
    <section>
      <div className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="bg-primary-soft text-primary-text mx-auto inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            Listen. Understand. Decide.
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl leading-none text-balance sm:text-7xl">
            Turn community input into{" "}
            <span className="text-primary-text">better decisions.</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg text-balance">
            Doxa brings feedback, discussion, prioritisation and decisions
            together, so nothing gets lost and everyone knows what happened to
            what they asked for.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton size="lg" href="/signup">
              Start free
            </LinkButton>
            <LinkButton size="lg" variant="outline" href="/why-doxa">
              See how it works
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Hard split, not a gradient: desk above, white below, the laptop across both. */}
      <div className="relative px-4 pt-12 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 bottom-0 -z-0 bg-[linear-gradient(to_bottom,var(--surface)_0,var(--surface)_30%,var(--background)_30%)]"
        />
        <div className="relative">
          <MacbookMockup
            priority
            lightSrc="/marketing/app-light.png"
            darkSrc="/marketing/app-dark.png"
            alt="A sample Doxa public board on a laptop: ideas ranked by votes, each with its status and the team's decision."
          />
          <p className="text-muted-foreground mt-6 mb-0 text-center text-xs">
            Sample board with example data.
          </p>
        </div>
      </div>
    </section>
  );
}
