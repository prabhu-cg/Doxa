"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemTypeSchema } from "@/features/item-types/schema";
import {
  archiveItemType,
  createItemType,
  restoreItemType,
  updateItemType,
} from "@/features/item-types/actions";
import type { ItemType } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfigEditRow, ConfigList, ConfigRow } from "@/components/config-list";

type FormValues = { name: string; description?: string };

export function ItemTypeManager({
  orgSlug,
  itemTypes,
  canManage,
}: {
  orgSlug: string;
  itemTypes: ItemType[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function toggleArchive(id: string, archived: boolean) {
    const result = await (archived ? restoreItemType : archiveItemType)(
      orgSlug,
      id,
    );
    if (!result.success) toast.error(result.error);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      <ConfigList>
        {itemTypes.map((itemType) =>
          editingId === itemType.id ? (
            <ConfigEditRow key={itemType.id}>
              <EditForm
                orgSlug={orgSlug}
                itemType={itemType}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            </ConfigEditRow>
          ) : (
            <ConfigRow
              key={itemType.id}
              name={itemType.name}
              badges={
                <>
                  {itemType.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </>
              }
              description={itemType.description}
              actions={
                canManage ? (
                  <>
                    <DropdownMenuItem onClick={() => setEditingId(itemType.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant={itemType.archivedAt ? "default" : "destructive"}
                      onClick={() =>
                        toggleArchive(itemType.id, !!itemType.archivedAt)
                      }
                    >
                      {itemType.archivedAt ? "Restore" : "Archive"}
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
  } = useForm<FormValues>({ resolver: zodResolver(itemTypeSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createItemType(orgSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    reset({ name: "", description: "" });
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-start gap-2"
      noValidate
    >
      <div className="min-w-40 flex-1">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Feature" {...register("name")} />
        </FormField>
      </div>
      <div className="min-w-40 flex-1">
        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Input id="description" {...register("description")} />
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
  itemType,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  itemType: ItemType;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(itemTypeSchema),
    defaultValues: {
      name: itemType.name,
      description: itemType.description ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await updateItemType(orgSlug, itemType.id, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <FormField label="Name" htmlFor="edit-name" error={errors.name?.message}>
        <Input id="edit-name" {...register("name")} />
      </FormField>
      <FormField
        label="Description"
        htmlFor="edit-description"
        error={errors.description?.message}
      >
        <Textarea id="edit-description" {...register("description")} />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
      <div className="flex gap-2">
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
