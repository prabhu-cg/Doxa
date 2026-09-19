"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  itemDescriptionFieldSchema,
  itemTitleSchema,
} from "@/features/items/schema";
import { updateItem } from "@/features/items/actions";
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
  statusId: z.string().min(1, "Choose a status"),
  priorityId: z.string().min(1, "Choose a priority"),
  categoryId: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;
type Option = { id: string; name: string };

export function UpdateItemForm({
  orgSlug,
  boardSlug,
  itemSlug,
  initialTitle,
  initialDescription,
  initialItemTypeId,
  initialStatusId,
  initialPriorityId,
  initialCategoryId,
  initialTags,
  itemTypes,
  statuses,
  priorities,
  categories,
  onSaved,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  initialTitle: string;
  initialDescription: string;
  initialItemTypeId: string;
  initialStatusId: string;
  initialPriorityId: string;
  initialCategoryId: string;
  initialTags: string[];
  itemTypes: Option[];
  statuses: Option[];
  priorities: Option[];
  categories: Option[];
  /** Called after a successful save, e.g. to close the drawer it's in. */
  onSaved?: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      itemTypeId: initialItemTypeId,
      statusId: initialStatusId,
      priorityId: initialPriorityId,
      categoryId: initialCategoryId || NO_CATEGORY,
      tags: initialTags,
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    setSaved(false);
    const result = await updateItem(orgSlug, boardSlug, itemSlug, {
      title: values.title,
      description: values.description,
      itemTypeId: values.itemTypeId,
      statusId: values.statusId,
      priorityId: values.priorityId,
      categoryId:
        values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
      tagNames: values.tags,
    });
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    setSaved(true);
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
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
                <SelectValue />
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

      <FormField
        label="Status"
        htmlFor="statusId"
        error={errors.statusId?.message}
      >
        <Controller
          control={control}
          name="statusId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={Object.fromEntries(statuses.map((s) => [s.id, s.name]))}
            >
              <SelectTrigger id="statusId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        label="Priority"
        htmlFor="priorityId"
        error={errors.priorityId?.message}
      >
        <Controller
          control={control}
          name="priorityId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={Object.fromEntries(priorities.map((p) => [p.id, p.name]))}
            >
              <SelectTrigger id="priorityId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    {priority.name}
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
      {saved ? <p className="text-muted-foreground text-sm">Saved.</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
