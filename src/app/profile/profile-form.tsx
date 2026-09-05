"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/features/profile/schema";
import { updateProfile } from "@/features/profile/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type FormValues = z.infer<typeof updateProfileSchema>;

export function ProfileForm({
  initialDisplayName,
  initialUsername,
}: {
  initialDisplayName: string;
  initialUsername: string;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: initialDisplayName,
      username: initialUsername,
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateProfile(values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Display name"
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
        label="Username (optional)"
        htmlFor="username"
        error={errors.username?.message}
      >
        <Input
          id="username"
          aria-invalid={!!errors.username}
          {...register("username")}
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
