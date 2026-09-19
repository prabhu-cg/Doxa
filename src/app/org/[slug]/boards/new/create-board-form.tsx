"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBoardSchema } from "@/features/boards/schema";
import { createBoard } from "@/features/boards/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type FormValues = {
  name: string;
  description?: string;
  spaceId: string;
  visibility: "PUBLIC" | "PRIVATE";
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
      "Anyone with the link can browse this board, no account required. Submitting and voting still require membership.",
  },
];

export function CreateBoardForm({
  orgSlug,
  spaces,
  initialSpaceId,
}: {
  orgSlug: string;
  spaces: { id: string; name: string }[];
  initialSpaceId?: string;
}) {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      spaceId: initialSpaceId ?? spaces[0]?.id,
      visibility: "PRIVATE",
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createBoard(orgSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    router.push(`/org/${orgSlug}/boards/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Feature Requests"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        hint="Explain what belongs here so contributors know where to submit — e.g. 'Bug reports for the mobile app' or 'Ideas for the Q3 roadmap'."
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
        label="Space"
        htmlFor="spaceId"
        error={errors.spaceId?.message}
      >
        <Controller
          control={control}
          name="spaceId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={Object.fromEntries(spaces.map((s) => [s.id, s.name]))}
            >
              <SelectTrigger id="spaceId" className="w-full">
                <SelectValue placeholder="Choose a space" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                  htmlFor={`visibility-${option.value}`}
                  className="hover:bg-accent/40 has-data-checked:border-primary has-data-checked:bg-accent/60 flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                >
                  <RadioGroupItem
                    id={`visibility-${option.value}`}
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

      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create board"}
      </Button>
    </form>
  );
}
