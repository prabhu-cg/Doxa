"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      <div className="space-y-3">
        {statuses.map((status) =>
          editingId === status.id ? (
            <Card key={status.id}>
              <CardContent>
                <EditForm
                  orgSlug={orgSlug}
                  status={status}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card key={status.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: status.color ?? "#94a3b8" }}
                  />
                  <span className="font-medium">{status.name}</span>
                  {status.isDefault ? <Badge>Default</Badge> : null}
                  {status.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </div>
                {canManage ? (
                  <div className="flex shrink-0 gap-2">
                    {!status.isDefault && !status.archivedAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await setDefaultStatus(orgSlug, status.id);
                          router.refresh();
                        }}
                      >
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(status.id)}
                    >
                      Edit
                    </Button>
                    <ArchiveButton
                      orgSlug={orgSlug}
                      statusId={status.id}
                      archived={!!status.archivedAt}
                      onDone={() => router.refresh()}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ),
        )}
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
      <div className="w-28">
        <FormField label="Color" htmlFor="color" error={errors.color?.message}>
          <Input id="color" placeholder="#64748b" {...register("color")} />
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
      <FormField label="Name" htmlFor="edit-name" error={errors.name?.message}>
        <Input id="edit-name" {...register("name")} />
      </FormField>
      <FormField
        label="Color"
        htmlFor="edit-color"
        error={errors.color?.message}
      >
        <Input id="edit-color" {...register("color")} />
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

function ArchiveButton({
  orgSlug,
  statusId,
  archived,
  onDone,
}: {
  orgSlug: string;
  statusId: string;
  archived: boolean;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    if (archived) {
      await restoreStatus(orgSlug, statusId);
    } else {
      await archiveStatus(orgSlug, statusId);
    }
    setPending(false);
    onDone();
  }

  return (
    <Button
      size="sm"
      variant={archived ? "outline" : "destructive"}
      onClick={onClick}
      disabled={pending}
    >
      {archived ? "Restore" : "Archive"}
    </Button>
  );
}
