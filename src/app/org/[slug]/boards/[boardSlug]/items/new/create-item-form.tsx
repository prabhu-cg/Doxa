"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  itemDescriptionFieldSchema,
  itemTitleSchema,
} from "@/features/items/schema";
import { createItem } from "@/features/items/actions";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NO_CATEGORY = "__none__";

const formSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionFieldSchema,
  itemTypeId: z.string().min(1, "Choose an item type"),
  categoryId: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateItemForm({
  orgSlug,
  boardSlug,
  itemTypes,
  categories,
}: {
  orgSlug: string;
  boardSlug: string;
  itemTypes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemTypeId: itemTypes[0]?.id ?? "",
      categoryId: NO_CATEGORY,
      tags: [],
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createItem(orgSlug, boardSlug, {
      title: values.title,
      description: values.description,
      itemTypeId: values.itemTypeId,
      categoryId:
        values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
      tagNames: values.tags,
    });
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    router.push(`/org/${orgSlug}/boards/${boardSlug}/items/${result.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="Add dark mode"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={5}
          aria-invalid={!!errors.description}
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Item type"
        htmlFor="itemTypeId"
        error={errors.itemTypeId?.message}
      >
        <Controller
          control={control}
          name="itemTypeId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={Object.fromEntries(itemTypes.map((t) => [t.id, t.name]))}
            >
              <SelectTrigger id="itemTypeId" className="w-full">
                <SelectValue placeholder="Choose a type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {categories.length > 0 ? (
        <FormField
          label="Category"
          htmlFor="categoryId"
          error={errors.categoryId?.message}
        >
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={{
                  [NO_CATEGORY]: "No category",
                  ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
                }}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      ) : null}

      <FormField label="Tags" htmlFor="tags" error={errors.tags?.message}>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagInput
              id="tags"
              value={field.value}
              onChange={field.onChange}
              placeholder="mobile, performance…"
              aria-invalid={!!errors.tags}
            />
          )}
        />
      </FormField>

      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit item"}
      </Button>
    </form>
  );
}
