"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateOrganizationTerminologySchema } from "@/features/organizations/schema";
import { updateOrganizationTerminology } from "@/features/organizations/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = {
  itemTerminologySingular: string;
  itemTerminologyPlural: string;
};

export function TerminologyForm({
  slug,
  initialSingular,
  initialPlural,
}: {
  slug: string;
  initialSingular: string;
  initialPlural: string;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateOrganizationTerminologySchema),
    defaultValues: {
      itemTerminologySingular: initialSingular,
      itemTerminologyPlural: initialPlural,
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateOrganizationTerminology(slug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap gap-2"
      noValidate
    >
      <div className="min-w-32 flex-1">
        <FormField
          label="Singular"
          htmlFor="itemTerminologySingular"
          error={errors.itemTerminologySingular?.message}
        >
          <Input
            id="itemTerminologySingular"
            placeholder="Item"
            {...register("itemTerminologySingular")}
          />
        </FormField>
      </div>
      <div className="min-w-32 flex-1">
        <FormField
          label="Plural"
          htmlFor="itemTerminologyPlural"
          error={errors.itemTerminologyPlural?.message}
        >
          <Input
            id="itemTerminologyPlural"
            placeholder="Items"
            {...register("itemTerminologyPlural")}
          />
        </FormField>
      </div>
      <div className="w-full space-y-2">
        {rootError ? (
          <p className="text-destructive text-sm">{rootError}</p>
        ) : null}
        {saved ? <p className="text-muted-foreground text-sm">Saved.</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save terminology"}
        </Button>
      </div>
    </form>
  );
}
