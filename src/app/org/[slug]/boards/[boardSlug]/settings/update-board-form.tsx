"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBoardSchema } from "@/features/boards/schema";
import { updateBoard } from "@/features/boards/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type FormValues = {
  name: string;
  description?: string;
  visibility: "PUBLIC" | "PRIVATE";
  requireApproval: boolean;
};

const VISIBILITY_OPTIONS: {
  value: "PRIVATE" | "PUBLIC";
  label: string;
  description: string;
}[] = [
  {
    value: "PRIVATE",
    label: "Private",
    description:
      "Only members of this organisation can see this board and its Items.",
  },
  {
    value: "PUBLIC",
    label: "Public",
    description:
      "Anyone with the link can browse this board. Signed-in visitors can also vote, comment, follow and submit — team members and customers alike.",
  },
];

export function UpdateBoardForm({
  orgSlug,
  boardSlug,
  initialName,
  initialDescription,
  initialVisibility,
  initialRequireApproval,
}: {
  orgSlug: string;
  boardSlug: string;
  initialName: string;
  initialDescription: string;
  initialVisibility: "PUBLIC" | "PRIVATE";
  initialRequireApproval: boolean;
}) {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
      visibility: initialVisibility,
      requireApproval: initialRequireApproval,
    },
  });
  const isPublic = useWatch({ control, name: "visibility" }) === "PUBLIC";

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateBoard(orgSlug, boardSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
    // Visibility may have changed, which shows or hides the public link.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField
        label="Description"
        htmlFor="description"
        hint="Explain what belongs here so contributors know where to submit."
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="What's this board for?"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
      </FormField>
      <FormField
        label="Visibility"
        htmlFor="visibility"
        error={errors.visibility?.message}
      >
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="gap-2"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`edit-visibility-${option.value}`}
                  className="hover:bg-accent/40 has-data-checked:border-primary has-data-checked:bg-accent/60 flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                >
                  <RadioGroupItem
                    id={`edit-visibility-${option.value}`}
                    value={option.value}
                    className="mt-0.5"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      </FormField>
      {isPublic ? (
        <Label
          htmlFor="requireApproval"
          className="hover:bg-accent/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3"
        >
          <input
            id="requireApproval"
            type="checkbox"
            className="mt-0.5 size-4"
            {...register("requireApproval")}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              Review new submissions first
            </span>
            <span className="text-muted-foreground text-xs">
              Items submitted by people outside your team stay hidden until an
              owner or admin approves them. Your team&apos;s own items are never
              held back.
            </span>
          </span>
        </Label>
      ) : null}
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
