import type { Metadata } from "next";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of Doxa.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="9 September 2026">
      <h2>1. Acceptance</h2>
      <p>
        By using Doxa you agree to these terms. If you do not agree with
        them, please don&apos;t use the service.
      </p>

      <h2>2. The service</h2>
      <p>
        Doxa is a hosted, multi-tenant application for collecting feedback,
        discussing it, prioritising it and recording decisions within an
        organisation. It requires an account, and content you submit is
        stored on our servers rather than on your device.
      </p>

      <h2>3. Accounts and organisations</h2>
      <p>
        You&apos;re responsible for the security of your account and for
        activity that happens under it. Items, comments and other content
        submitted to an organisation belong to that organisation and the
        people in it, subject to the roles and permissions its members have
        set.
      </p>

      <h2>4. Availability and data</h2>
      <p>
        We take reasonable steps to keep the service available and your
        data backed up, but Doxa is provided without a guarantee of
        uninterrupted access. If you need a copy of your organisation&apos;s
        data, ask through the contact page.
      </p>

      <h2>5. Provided as is</h2>
      <p>
        Doxa is provided &quot;as is&quot; and &quot;as available&quot;,
        without warranty of any kind, express or implied, including fitness
        for a particular purpose. We don&apos;t warrant that the service
        will be uninterrupted or error-free, or that a decision recorded in
        Doxa is a substitute for your organisation&apos;s own judgement.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to use Doxa to:</p>
      <ul>
        <li>Break any applicable law or regulation.</li>
        <li>
          Access, or attempt to access, another organisation&apos;s data
          without authorisation.
        </li>
        <li>Store content you don&apos;t have the right to hold or share.</li>
        <li>Disrupt or attempt to compromise the infrastructure that runs the service.</li>
      </ul>

      <h2>7. Changes</h2>
      <p>
        These terms may be updated as the product develops. Material changes
        will be communicated before they take effect, and continued use of
        Doxa after a change constitutes acceptance of it.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any
        indirect, incidental or consequential loss, or for any loss of data,
        profit, revenue or business, arising from your use of or inability
        to use Doxa. Nothing in these terms excludes liability that
        can&apos;t lawfully be excluded.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of the jurisdiction in which
        the operator of Doxa is established. Any dispute is subject to the
        exclusive jurisdiction of its courts.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms can be sent through the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPageShell>
  );
}
