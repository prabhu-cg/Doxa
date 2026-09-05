import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of Doxa.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <h2>What these terms will cover</h2>
      <p>
        This page will set out the terms for using Doxa — account
        responsibilities, acceptable use, ownership of content submitted to an
        organisation, and how a subscription can be changed or cancelled. Final
        legal language has not been drafted yet.
      </p>

      <h2>Accounts</h2>
      <p>
        You&apos;re responsible for the security of your account and for
        activity that happens under it.
      </p>

      <h2>Content</h2>
      <p>
        Items, comments and other content submitted to an organisation belong to
        that organisation and the people who created it, subject to the final
        terms.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Doxa is for legitimate feedback and decision-making. Abuse of the
        service, including attempts to compromise other organisations&apos;
        data, is not permitted.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated as the product develops. Material changes
        will be communicated before they take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPageShell>
  );
}
