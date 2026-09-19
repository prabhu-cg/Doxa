"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scoreCriterionFieldSchema } from "@/features/scoring/schema";
import {
  archiveScoreCriterion,
  createScoreCriterion,
  restoreScoreCriterion,
  updateScoreCriterion,
} from "@/features/scoring/actions";
import type { ScoreCriterion } from "@/generated/prisma/client";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfigEditRow, ConfigList, ConfigRow } from "@/components/config-list";

type FormValues = { name: string; description?: string; weight: string };

export function ScoreCriteriaManager({
  orgSlug,
  criteria,
  canManage,
}: {
  orgSlug: string;
  criteria: ScoreCriterion[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function toggleArchive(id: string, archived: boolean) {
    const result = await (
      archived ? restoreScoreCriterion : archiveScoreCriterion
    )(orgSlug, id);
    if (!result.success) toast.error(result.error);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <CreateForm orgSlug={orgSlug} onCreated={() => router.refresh()} />
      ) : null}

      <ConfigList>
        {criteria.map((criterion) =>
          editingId === criterion.id ? (
            <ConfigEditRow key={criterion.id}>
              <EditForm
                orgSlug={orgSlug}
                criterion={criterion}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            </ConfigEditRow>
          ) : (
            <ConfigRow
              key={criterion.id}
              name={criterion.name}
              badges={
                <>
                  <Badge variant="outline">weight {criterion.weight}</Badge>
                  {criterion.archivedAt ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </>
              }
              description={criterion.description}
              actions={
                canManage ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => setEditingId(criterion.id)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant={criterion.archivedAt ? "default" : "destructive"}
                      onClick={() =>
                        toggleArchive(criterion.id, !!criterion.archivedAt)
                      }
                    >
                      {criterion.archivedAt ? "Restore" : "Archive"}
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
  } = useForm<FormValues>({
    resolver: zodResolver(scoreCriterionFieldSchema),
    defaultValues: { weight: "1" },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await createScoreCriterion(orgSlug, {
      ...values,
      weight: Number(values.weight),
    });
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    reset({ name: "", description: "", weight: "1" });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-40 flex-1">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Customer impact"
              {...register("name")}
            />
          </FormField>
        </div>
        <div className="w-24">
          <FormField
            label="Weight"
            htmlFor="weight"
            error={errors.weight?.message}
          >
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              {...register("weight")}
            />
          </FormField>
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-5">
          {isSubmitting ? "Adding…" : "Add"}
        </Button>
      </div>
      <FormField
        label="Description (optional)"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Input
          id="description"
          placeholder="How much this affects customers who asked for it"
          {...register("description")}
        />
      </FormField>
      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}
    </form>
  );
}

function EditForm({
  orgSlug,
  criterion,
  onDone,
  onCancel,
}: {
  orgSlug: string;
  criterion: ScoreCriterion;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rootError, setRootError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(scoreCriterionFieldSchema),
    defaultValues: {
      name: criterion.name,
      description: criterion.description ?? "",
      weight: String(criterion.weight),
    },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await updateScoreCriterion(orgSlug, criterion.id, {
      ...values,
      weight: Number(values.weight),
    });
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
        label="Weight"
        htmlFor="edit-weight"
        error={errors.weight?.message}
      >
        <Input
          id="edit-weight"
          type="number"
          step="0.1"
          min="0.1"
          max="10"
          {...register("weight")}
        />
      </FormField>
      <FormField
        label="Description"
        htmlFor="edit-description"
        error={errors.description?.message}
      >
        <Input id="edit-description" {...register("description")} />
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
