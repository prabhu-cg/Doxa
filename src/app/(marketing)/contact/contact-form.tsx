"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/features/contact/schema";
import { submitContactForm } from "@/features/contact/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const [rootError, setRootError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema) });

  async function onSubmit(values: ContactFormValues) {
    setRootError(null);
    const result = await submitContactForm(values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    trackEvent(ANALYTICS_EVENTS.contactSubmitted);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border-border bg-card rounded-xl border p-8 text-center">
        <p className="font-medium">Message sent</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>
      <FormField
        label="Organisation (optional)"
        htmlFor="organization"
        error={errors.organization?.message}
      >
        <Input id="organization" {...register("organization")} />
      </FormField>
      <FormField
        label="Message"
        htmlFor="message"
        error={errors.message?.message}
      >
        <Textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
