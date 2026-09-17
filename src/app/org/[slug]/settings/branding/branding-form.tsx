"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateOrganizationBranding } from "@/features/organizations/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  logoUrl: z.string().trim(),
  accentColor: z.string().trim(),
});

type FormValues = z.infer<typeof formSchema>;

export function BrandingForm({
  slug,
  initialLogoUrl,
  initialAccentColor,
}: {
  slug: string;
  initialLogoUrl: string;
  initialAccentColor: string;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { logoUrl: initialLogoUrl, accentColor: initialAccentColor },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateOrganizationBranding(slug, {
      logoUrl: values.logoUrl,
      accentColor: values.accentColor,
    });
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Logo URL"
        htmlFor="logoUrl"
        error={errors.logoUrl?.message}
      >
        <Input
          id="logoUrl"
          placeholder="https://example.com/logo.png"
          {...register("logoUrl")}
        />
      </FormField>
      <FormField
        label="Accent colour"
        htmlFor="accentColor"
        error={errors.accentColor?.message}
      >
        <Input
          id="accentColor"
          placeholder="#f97316"
          {...register("accentColor")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      {saved ? <p className="text-muted-foreground text-sm">Saved.</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save branding"}
      </Button>
    </form>
  );
}
