"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/features/categories/schema";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/categories/actions";
import type { Category } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfigEditRow, ConfigList, ConfigRow } from "@/components/config-list";

type FormValues = { name: string };

export function CategoryManager({
  orgSlug,
  categories,
  canManage,
}: {
  orgSlug: string;
  categories: Category[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      <ConfigList>
        {categories.map((category) =>
          editingId === category.id ? (
            <ConfigEditRow key={category.id}>
              <EditForm
                orgSlug={orgSlug}
                category={category}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            </ConfigEditRow>
          ) : (
            <ConfigRow
              key={category.id}
              name={category.name}
              actions={
                canManage ? (
                  <>
                    <DropdownMenuItem onClick={() => setEditingId(category.id)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={async () => {
                        await deleteCategory(orgSlug, category.id);
                        router.refresh();
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null
              }
            />
          ),
        )}
      </ConfigList>
    </div>
  );
}

function CreateForm({
  orgSlug,
  onCreated,
}: {
  orgSlug: string;
  onCreated: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(categorySchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createCategory(orgSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    reset({ name: "" });
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-start gap-2"
      noValidate
    >
      <div className="flex-1">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Mobile app" {...register("name")} />
        </FormField>
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-5">
        {isSubmitting ? "Adding…" : "Add"}
      </Button>
      {rootError ? (
        <p className="text-destructive w-full text-sm">{rootError}</p>
      ) : null}
    </form>
  );
}

function EditForm({
  orgSlug,
  category,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  category: Category;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category.name },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await updateCategory(orgSlug, category.id, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-start gap-2"
      noValidate
    >
      <div className="flex-1">
        <FormField
          label="Name"
          htmlFor="edit-name"
          error={errors.name?.message}
        >
          <Input id="edit-name" {...register("name")} />
        </FormField>
      </div>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <div className="mt-5.5 flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
