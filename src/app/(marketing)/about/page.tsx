import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Doxa exists: organisations receive more input than ever, but collecting it is only the beginning.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading eyebrow="About" title="Why Doxa exists" />
        <div className="[&_p]:text-muted-foreground mx-auto mt-10 max-w-2xl text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:leading-relaxed [&_p+p]:mt-4">
          <h2 className="text-foreground">What Doxa is</h2>
          <p>
            Organisations receive more input than ever — from customers,
            employees, and the communities they serve. Collecting that input is
            only the beginning. The difficult part is turning it into useful
            decisions.
          </p>
          <p>
            Most tools stop at collection: a list of requests, a vote count, a
            status that changes without explanation. Doxa is built around the
            rest of the loop — understanding what matters, prioritising with
            real signals, deciding explicitly, and telling people what happened.
          </p>
          <p>
            Doxa is intentionally generic. The core object is an Item, not a
            &quot;feature request&quot; — because a product team, a customer
            community, an internal team, and a public organisation all have
            input worth collecting, in their own words.
          </p>

          <h2 className="text-foreground">How it&apos;s built</h2>
          <p>
            Doxa runs on Next.js, with Supabase (PostgreSQL and Auth) for
            storage and identity, and is hosted on Vercel. It&apos;s
            multi-tenant from the ground up — organisations, membership and
            roles are core primitives, not bolted on afterwards. Every request
            that touches an organisation&apos;s data re-verifies who&apos;s
            asking and whether they belong to that organisation, rather than
            trusting an ID supplied by the browser.
          </p>

          <h2 className="text-foreground">What&apos;s coming</h2>
          <p>
            Organisation setup is live today. The rest of the loop is what Doxa
            is being built to support next: voting and discussion on items,
            prioritisation against impact and effort, roadmaps, and decisions
            recorded with their rationale rather than just a status change.
          </p>

          <h2 className="text-foreground">Who&apos;s building it</h2>
          <p>
            Doxa is an independently built product, still early. If you want to
            see where it&apos;s headed, or have a say in what gets built next,
            the <a href="/contact">contact page</a> reaches the team directly.
          </p>
        </div>
      </div>
      <CTASection variant="banner" title="Start collecting input today." />
    </>
  );
}
