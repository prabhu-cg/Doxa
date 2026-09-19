"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { statusSchema } from "@/features/statuses/schema";
import {
  archiveStatus,
  createStatus,
  restoreStatus,
  setDefaultStatus,
  updateStatus,
} from "@/features/statuses/actions";
import type { Status } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfigEditRow, ConfigList, ConfigRow } from "@/components/config-list";

type FormValues = { name: string; color?: string };

export function StatusManager({
  orgSlug,
  statuses,
  canManage,
}: {
  orgSlug: string;
  statuses: Status[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function toggleArchive(id: string, archived: boolean) {
    await (archived ? restoreStatus : archiveStatus)(orgSlug, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      <ConfigList>
        {statuses.map((status) =>
          editingId === status.id ? (
            <ConfigEditRow key={status.id}>
              <EditForm
                orgSlug={orgSlug}
                status={status}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            </ConfigEditRow>
          ) : (
            <ConfigRow
              key={status.id}
              name={status.name}
              leading={
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: status.color ?? "#94a3b8" }}
                  aria-hidden
                />
              }
              badges={
                <>
                  {status.isDefault ? <Badge>Default</Badge> : null}
                  {status.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </>
              }
              actions={
                canManage ? (
                  <>
                    {!status.isDefault && !status.archivedAt ? (
                      <DropdownMenuItem
                        onClick={async () => {
                          await setDefaultStatus(orgSlug, status.id);
                          router.refresh();
                        }}
                      >
                        Set default
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => setEditingId(status.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant={status.archivedAt ? "default" : "destructive"}
                      onClick={() =>
                        toggleArchive(status.id, !!status.archivedAt)
                      }
                    >
                      {status.archivedAt ? "Restore" : "Archive"}
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
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(statusSchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createStatus(orgSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    reset({ name: "", color: "" });
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
          <Input id="name" placeholder="In Review" {...register("name")} />
        </FormField>
      </div>
      <div className="w-32">
        <FormField label="Color" htmlFor="color" error={errors.color?.message}>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker
                id="color"
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={!!errors.color}
              />
            )}
          />
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
  status,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  status: Status;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: { name: status.name, color: status.color ?? "" },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await updateStatus(orgSlug, status.id, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-40 flex-1">
          <FormField
            label="Name"
            htmlFor="edit-name"
            error={errors.name?.message}
          >
            <Input id="edit-name" {...register("name")} />
          </FormField>
        </div>
        <div className="w-32">
          <FormField
            label="Color"
            htmlFor="edit-color"
            error={errors.color?.message}
          >
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker
                  id="edit-color"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={!!errors.color}
                />
              )}
            />
          </FormField>
        </div>
      </div>
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
