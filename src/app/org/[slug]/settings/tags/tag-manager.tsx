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
import { Badge } from "@/components/ui/badge";

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

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) =>
          editingId === tag.id ? (
            <EditForm
              key={tag.id}
              orgSlug={orgSlug}
              tag={tag}
              onDone={() => {
                setEditingId(null);
                router.refresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Badge key={tag.id} variant="outline" className="h-7 gap-2 px-2.5">
              {tag.name}
              {canManage ? (
                <span className="flex gap-1">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setEditingId(tag.id)}
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    className="text-destructive hover:underline"
                    onClick={async () => {
                      await deleteTag(orgSlug, tag.id);
                      router.refresh();
                    }}
                  >
                    delete
                  </button>
                </span>
              ) : null}
            </Badge>
          ),
        )}
        {tags.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tags yet.</p>
        ) : null}
      </div>
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
      <Button type="submit" disabled={isSubmitting} className="mt-6">
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
      className="border-input flex h-7 items-center gap-1 rounded-full border px-1"
      noValidate
    >
      <Input
        {...register("name")}
        className="h-5 w-24 border-none px-1 shadow-none focus-visible:ring-0"
        autoFocus
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="text-xs hover:underline"
      >
        save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs hover:underline"
      >
        cancel
      </button>
    </form>
  );
}
