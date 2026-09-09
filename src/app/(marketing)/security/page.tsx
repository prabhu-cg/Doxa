import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "Security",
  description: "How Doxa approaches security.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <LegalPageShell title="Security" lastUpdated="9 September 2026">
      <h2>Our approach</h2>
      <p>
        Doxa is built with tenant isolation and server-side authorization as
        core requirements, not an afterthought. Every request that touches an
        organisation&apos;s data re-verifies who&apos;s asking and whether they
        belong to that organisation — never trusting an ID supplied by the
        browser alone.
      </p>

      <h2>Authentication</h2>
      <p>
        Accounts are authenticated through Supabase Auth. Passwords are never
        stored or handled by Doxa directly.
      </p>

      <h2>Infrastructure</h2>
      <p>
        Doxa runs on Vercel and Supabase (PostgreSQL). Data in transit is
        encrypted via HTTPS.
      </p>

      <h2>Certifications</h2>
      <p>
        Doxa does not currently hold SOC 2, ISO 27001, or other formal security
        certifications, and does not claim HIPAA compliance. If that changes, it
        will be reflected here — not implied elsewhere on this site.
      </p>

      <h2>Reporting a concern</h2>
      <p>
        If you believe you&apos;ve found a security issue, please reach out
        through the <a href="/contact">contact page</a> rather than disclosing
        it publicly.
      </p>
    </LegalPageShell>
  );
}
