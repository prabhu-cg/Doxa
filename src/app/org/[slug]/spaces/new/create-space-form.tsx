"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSpaceSchema } from "@/features/spaces/schema";
import { createSpace } from "@/features/spaces/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = { name: string; description?: string };

export function CreateSpaceForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createSpaceSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createSpace(orgSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    router.push(`/org/${orgSlug}/spaces/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Product"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>
      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="What lives in this space?"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create space"}
      </Button>
    </form>
  );
}
