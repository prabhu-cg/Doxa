"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/features/organizations/schema";
import { completeOnboarding } from "@/features/organizations/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { displayName: string; organizationName: string };

export function OnboardingForm() {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(onboardingSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await completeOnboarding(values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    router.push(`/org/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Your name"
        htmlFor="displayName"
        error={errors.displayName?.message}
      >
        <Input
          id="displayName"
          autoComplete="name"
          aria-invalid={!!errors.displayName}
          {...register("displayName")}
        />
      </FormField>
      <FormField
        label="Organisation name"
        htmlFor="organizationName"
        error={errors.organizationName?.message}
      >
        <Input
          id="organizationName"
          placeholder="Acme Inc."
          aria-invalid={!!errors.organizationName}
          {...register("organizationName")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Setting up…" : "Continue"}
      </Button>
    </form>
  );
}
