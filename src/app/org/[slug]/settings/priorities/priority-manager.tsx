"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prioritySchema } from "@/features/priorities/schema";
import {
  archivePriority,
  createPriority,
  restorePriority,
  setDefaultPriority,
  updatePriority,
} from "@/features/priorities/actions";
import type { Priority } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type FormValues = { name: string; color?: string };

export function PriorityManager({
  orgSlug,
  priorities,
  canManage,
}: {
  orgSlug: string;
  priorities: Priority[];
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
        {priorities.map((priority) =>
          editingId === priority.id ? (
            <Card key={priority.id}>
              <CardContent>
                <EditForm
                  orgSlug={orgSlug}
                  priority={priority}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card key={priority.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: priority.color ?? "#94a3b8" }}
                  />
                  <span className="font-medium">{priority.name}</span>
                  {priority.isDefault ? <Badge>Default</Badge> : null}
                  {priority.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </div>
                {canManage ? (
                  <div className="flex shrink-0 gap-2">
                    {!priority.isDefault && !priority.archivedAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await setDefaultPriority(orgSlug, priority.id);
                          router.refresh();
                        }}
                      >
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(priority.id)}
                    >
                      Edit
                    </Button>
                    <ArchiveButton
                      orgSlug={orgSlug}
                      priorityId={priority.id}
                      archived={!!priority.archivedAt}
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
  } = useForm<FormValues>({ resolver: zodResolver(prioritySchema) });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createPriority(orgSlug, values);
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
          <Input id="name" placeholder="Urgent" {...register("name")} />
        </FormField>
      </div>
      <div className="w-28">
        <FormField label="Color" htmlFor="color" error={errors.color?.message}>
          <Input id="color" placeholder="#ef4444" {...register("color")} />
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
  priority,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  priority: Priority;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(prioritySchema),
    defaultValues: { name: priority.name, color: priority.color ?? "" },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await updatePriority(orgSlug, priority.id, values);
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
  priorityId,
  archived,
  onDone,
}: {
  orgSlug: string;
  priorityId: string;
  archived: boolean;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    if (archived) {
      await restorePriority(orgSlug, priorityId);
    } else {
      await archivePriority(orgSlug, priorityId);
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
