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

type FormValues = {
  name: string;
  description?: string;
  spaceId: string;
  visibility: "PUBLIC" | "PRIVATE";
};

const VISIBILITY_ITEMS = {
  PRIVATE: "Private — members of this organisation only",
  PUBLIC: "Public — anyone with the link, no account required",
};

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
        error={errors.description?.message}
      >
        <Textarea
          id="description"
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={VISIBILITY_ITEMS}
            >
              <SelectTrigger id="visibility" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">
                  {VISIBILITY_ITEMS.PRIVATE}
                </SelectItem>
                <SelectItem value="PUBLIC">
                  {VISIBILITY_ITEMS.PUBLIC}
                </SelectItem>
              </SelectContent>
            </Select>
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
