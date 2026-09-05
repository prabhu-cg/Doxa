import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { clientEnv } from "@/lib/env/client";
import { ProblemSection } from "./_sections/problem-section";
import { LoopSection } from "./_sections/loop-section";
import { DifferentiationSection } from "./_sections/differentiation-section";
import { FeatureHighlightsSection } from "./_sections/feature-highlights-section";
import { GenericByDesignSection } from "./_sections/generic-by-design-section";
import { SimpleByDefaultSection } from "./_sections/simple-by-default-section";
import { DecisionsSection } from "./_sections/decisions-section";
import { UseCasesSection } from "./_sections/use-cases-section";
import { HowItWorksSection } from "./_sections/how-it-works-section";
import { PricingPreviewSection } from "./_sections/pricing-preview-section";

const DESCRIPTION =
  "Doxa helps organisations collect feedback, understand what matters, prioritise with confidence, and communicate better decisions.";

export const metadata: Metadata = {
  // absolute: this exact string, bypassing the "%s · Doxa" template every
  // other page uses — the homepage title already includes "Doxa".
  title: { absolute: "Doxa — Turn community input into better decisions" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Doxa — Turn community input into better decisions",
    description: DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Doxa",
          url: clientEnv.NEXT_PUBLIC_APP_URL,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Doxa",
          url: clientEnv.NEXT_PUBLIC_APP_URL,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Doxa",
          applicationCategory: "BusinessApplication",
          description: DESCRIPTION,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
      <Hero />
      <ProblemSection />
      <LoopSection />
      <DifferentiationSection />
      <FeatureHighlightsSection />
      <GenericByDesignSection />
      <SimpleByDefaultSection />
      <DecisionsSection />
      <UseCasesSection />
      <HowItWorksSection />
      <PricingPreviewSection />
      <div className="border-t py-16 sm:py-20">
        <CTASection
          title="Give every voice a clearer path to action."
          description="Start collecting input today — add prioritisation and decisions when you're ready."
          ctaLabel="Start Free"
          ctaHref="/signup"
        />
      </div>
    </div>
  );
}
