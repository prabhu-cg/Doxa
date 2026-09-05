"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateOrganizationSchema } from "@/features/organizations/schema";
import { updateOrganization } from "@/features/organizations/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = { name: string };

export function UpdateOrganizationForm({
  slug,
  initialName,
}: {
  slug: string;
  initialName: string;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: { name: initialName },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateOrganization(slug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm space-y-4"
      noValidate
    >
      <FormField
        label="Organisation name"
        htmlFor="name"
        error={errors.name?.message}
      >
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
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
