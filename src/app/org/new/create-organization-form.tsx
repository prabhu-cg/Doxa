"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganizationSchema } from "@/features/organizations/schema";
import { createOrganization } from "@/features/organizations/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { name: string };

export function CreateOrganizationForm() {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createOrganizationSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createOrganization(values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    router.push(`/org/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Organisation name"
        htmlFor="name"
        error={errors.name?.message}
      >
        <Input
          id="name"
          placeholder="Acme Inc."
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create organisation"}
      </Button>
    </form>
  );
}
