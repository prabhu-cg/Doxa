import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Doxa collects, uses and protects information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <h2>What this policy will cover</h2>
      <p>
        This page will describe what information Doxa collects, why, how long
        it&apos;s kept, and the choices available to users and organisations.
        The sections below outline the intended structure; the specific
        commitments have not been finalised yet.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account information you provide (name, email).</li>
        <li>
          Content submitted to organisations you belong to (items, comments,
          votes).
        </li>
        <li>Basic technical information needed to operate the service.</li>
      </ul>

      <h2>How information is used</h2>
      <p>
        To provide the core product — collecting, discussing and deciding on
        input within your organisation — and to keep the service secure and
        reliable.
      </p>

      <h2>Data sharing</h2>
      <p>
        Doxa does not sell personal information. Any third-party processors used
        to run the service (hosting, authentication, email delivery) will be
        listed here once finalised.
      </p>

      <h2>Your choices</h2>
      <p>
        Details on accessing, exporting or deleting your data will be added here
        as those capabilities are built.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent through the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPageShell>
  );
}
