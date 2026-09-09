import { SectionHeading } from "@/components/marketing/section-heading";
import { SignalsPreview } from "@/components/marketing/product-preview/signals-preview";

export function DifferentiationSection() {
  return (
    <section className="bg-secondary border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="Not just a voting board"
            title="Votes are a signal, not a decision."
            description="A popularity contest doesn't tell you what to build. Doxa is designed to bring votes and comments together with the other things that actually go into a decision."
          />
          <div className="flex justify-center lg:justify-end">
            <SignalsPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
