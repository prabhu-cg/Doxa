import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Doxa collects, uses and protects information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="9 September 2026">
      <h2>The short version</h2>
      <p>
        Doxa collects the information needed to run an account and an
        organisation&apos;s feedback loop — nothing more. We don&apos;t sell
        personal information, and we don&apos;t run ad trackers on this site
        or in the product.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account information you provide (name, email address).</li>
        <li>
          Content submitted to organisations you belong to — items, comments,
          votes and decisions.
        </li>
        <li>
          Organisation and membership details (who belongs to which
          organisation, and their role in it).
        </li>
        <li>
          Basic technical information — IP address, user agent and
          timestamps — needed to operate and secure the service.
        </li>
      </ul>

      <h2>How it&apos;s used</h2>
      <p>
        To provide the core product — collecting, discussing, prioritising
        and deciding on input within your organisation — and to keep the
        service secure, reliable and free of abuse. We do not use your
        content to train models or to advertise to you.
      </p>

      <h2>Where your data lives</h2>
      <p>
        Doxa runs on Vercel and stores data in Supabase (PostgreSQL). Data in
        transit is encrypted via HTTPS. Every request that touches an
        organisation&apos;s data is re-checked against who&apos;s asking and
        whether they belong to that organisation — an account never sees
        another organisation&apos;s data.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        Doxa uses a small number of strictly necessary cookies to keep you
        signed in, issued by Supabase Auth. We don&apos;t run advertising
        pixels, third-party trackers, or session-recording scripts on this
        site or in the product.
      </p>

      <h2>Data sharing and subprocessors</h2>
      <p>
        Doxa does not sell personal information. Content is shared only with
        the organisation it belongs to and the people in it, per that
        organisation&apos;s membership and roles. The infrastructure
        providers that process data on our behalf — currently Vercel
        (hosting) and Supabase (database and authentication) — are bound by
        their own data processing terms.
      </p>

      <h2>Data retention and your rights</h2>
      <p>
        Content persists for as long as your account or organisation is
        active. You can request export, correction or deletion of your
        personal data and account through the contact page — we&apos;ll
        respond directly rather than making you dig through settings that
        don&apos;t exist yet.
      </p>

      <h2>Children</h2>
      <p>
        Doxa is a business tool and isn&apos;t directed at children. We
        don&apos;t knowingly collect information from anyone under 16.
      </p>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, the date at the top of this page will be
        updated. Questions about this policy can be sent through the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPageShell>
  );
}
