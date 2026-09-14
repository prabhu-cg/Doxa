"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSpaceSchema } from "@/features/spaces/schema";
import { updateSpace } from "@/features/spaces/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = { name: string; description?: string };

export function UpdateSpaceForm({
  orgSlug,
  spaceSlug,
  initialName,
  initialDescription,
}: {
  orgSlug: string;
  spaceSlug: string;
  initialName: string;
  initialDescription: string;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateSpaceSchema),
    defaultValues: { name: initialName, description: initialDescription },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateSpace(orgSlug, spaceSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      {saved ? <p className="text-muted-foreground text-sm">Saved.</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
