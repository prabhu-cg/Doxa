"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagSchema } from "@/features/tags/schema";
import { createTag, deleteTag, updateTag } from "@/features/tags/actions";
import type { Tag } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfigEditRow, ConfigList, ConfigRow } from "@/components/config-list";

type FormValues = { name: string };

export function TagManager({
  orgSlug,
  tags,
  canManage,
}: {
  orgSlug: string;
  tags: Tag[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      {tags.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tags yet.</p>
      ) : (
        <ConfigList>
          {tags.map((tag) =>
            editingId === tag.id ? (
              <ConfigEditRow key={tag.id}>
                <EditForm
                  orgSlug={orgSlug}
                  tag={tag}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </ConfigEditRow>
            ) : (
              <ConfigRow
                key={tag.id}
                name={tag.name}
                actions={
                  canManage ? (
                    <>
                      <DropdownMenuItem onClick={() => setEditingId(tag.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={async () => {
                          await deleteTag(orgSlug, tag.id);
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
      )}
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
  } = useForm<FormValues>({ resolver: zodResolver(tagSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createTag(orgSlug, values);
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
      <div className="w-48">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="performance" {...register("name")} />
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
  tag,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  tag: Tag;
  onDone: () => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: tag.name },
  });

  async function onSubmit(values: FormValues) {
    const result = await updateTag(orgSlug, tag.id, values);
    if (result.success) onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2"
      noValidate
    >
      <Input
        {...register("name")}
        aria-label="Tag name"
        className="flex-1"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}
