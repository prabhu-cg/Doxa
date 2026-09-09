import { LinkButton } from "@/components/link-button";
import { BoardPreview } from "@/components/marketing/product-preview/board-preview";

export function Hero() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Turn community input into better decisions.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-lg text-balance lg:mx-0">
            Doxa brings feedback, discussion, prioritisation and decisions
            together — so nothing gets lost, and everyone knows what happened
            to what they asked for.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <LinkButton size="lg" href="/signup">
              Start Free
            </LinkButton>
            <LinkButton size="lg" variant="outline" href="/why-doxa">
              See How It Works
            </LinkButton>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <BoardPreview />
        </div>
      </div>
    </section>
  );
}
