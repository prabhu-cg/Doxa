import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PricingCard } from "@/components/marketing/pricing-card";
import { PRICING_PLANS } from "@/lib/pricing-plans";

export function PricingPreviewSection() {
  return (
    <section className="border-t py-16 sm:py-20">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Upgrade when you need more."
      />
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
      <p className="mt-8 text-center text-sm">
        <Link
          href="/pricing"
          className="text-primary underline underline-offset-4"
        >
          See full plan comparison
        </Link>
      </p>
    </section>
  );
}
