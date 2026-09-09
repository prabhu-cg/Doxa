import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Doxa team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about Doxa? Send us a message."
      />
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
