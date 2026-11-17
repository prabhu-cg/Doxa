import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Doxa exists, how it is built, and who is building it: a community feedback and decision platform.",
  alternates: { canonical: "/about" },
};

const STACK = [
  ["Framework", "Next.js (App Router), React 19, TypeScript (strict)"],
  ["Styling", "Tailwind CSS v4, shadcn-style components on Base UI primitives"],
  ["Icons & Type", "Lucide, Newsreader and DM Sans"],
  ["Forms & Validation", "React Hook Form with Zod schemas"],
  ["Data", "PostgreSQL on Supabase, accessed through Prisma"],
  [
    "Identity",
    "Supabase Auth, with membership and roles checked on every request",
  ],
  ["Billing", "Stripe, with plans enforced on the server"],
  ["Hosting", "Vercel"],
] as const;

export default function AboutPage() {
  return (
    <LegalPageShell
      eyebrow="V1"
      title="About Doxa"
      subtitle="Listen. Understand. Decide."
    >
      <section>
        <h2>What it is</h2>
        <p>
          Doxa is a community feedback, prioritisation and decision platform.
          Organisations receive more input than ever, from customers, employees
          and the communities they serve. Collecting it is only the beginning;
          the difficult part is turning it into decisions people can see.
        </p>
        <p>
          Most tools stop at a list of requests, a vote count and a status that
          changes without explanation. Doxa is built around the whole loop:
          collect, discuss, understand, prioritise, decide and communicate.
          Every item can end in a public decision and the reason behind it.
        </p>
        <p>
          It is intentionally generic. The core object is an item, not a
          &quot;feature request&quot;, so a product team, a customer community
          and an internal team can each use their own words. Pricing is per
          team, so the number of people giving feedback never raises
          anyone&apos;s bill.
        </p>
      </section>

      <section>
        <h2>How it is built</h2>
        <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {STACK.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {term}
              </dt>
              <dd className="text-foreground mt-1">{detail}</dd>
            </div>
          ))}
        </dl>
        <p>
          Doxa is multi-tenant from the ground up: organisations, membership and
          roles are core primitives, and every request that touches an
          organisation&apos;s data re-verifies who is asking and whether they
          belong, rather than trusting an ID supplied by the browser.
        </p>
      </section>

      <section>
        <h2>What is live, and what is next</h2>
        <p>
          Live today: organisations, spaces and boards; feedback with voting and
          discussion; prioritisation against impact and effort; decisions
          recorded with their rationale and shared publicly; team and public
          roadmaps; and in-app notifications. Customers can sign in to vote,
          comment and submit on public boards, with new submissions held for
          your review.
        </p>
        <p>
          Next: email notifications for the people who took part, integrations
          and an API.
        </p>
      </section>

      <section>
        <h2>Who built Doxa, and why</h2>
        <p>
          Doxa was built by me, Prabhu Raja, a senior designer with 15+ years of
          experience across enterprise and B2B software. I work on enterprise
          products, design systems and digital experiences, with a simple aim:
          designing clarity from complexity.
        </p>
        <p>
          I built it because most feedback tools stop at collecting. People
          vote, a status changes, and nobody learns what was decided or why.
          Doxa puts the team&apos;s answer on the same page as the question,
          with a decision, a reason and a roadmap anyone can read.
        </p>
        <p>
          It is an independent project. I scoped, designed and built it myself,
          with AI in the loop, as part of how I now take products from idea to
          shipped. You can see more of my work at{" "}
          <a
            href="https://prabhuraja.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            prabhuraja.vercel.app
          </a>
          .
        </p>
        <p>
          Feedback, feature requests, or just want to say hello:{" "}
          <a href="mailto:prabhu_cg@proton.me">prabhu_cg@proton.me</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
