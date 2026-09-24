"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import {
  itemDescriptionFieldSchema,
  itemTitleSchema,
} from "@/features/items/schema";
import { submitItem } from "@/features/participation/actions";
import { Drawer } from "@/components/drawer";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: itemTitleSchema,
  description: itemDescriptionFieldSchema,
  itemTypeId: z.string().min(1, "Choose a type"),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * The public board's "submit" button and its right-hand drawer. Whoever can't
 * submit yet (signed out, unconfirmed email, blocked) sees `blockedNotice`
 * in the drawer instead of the form.
 */
export function SubmitDrawer({
  orgSlug,
  boardSlug,
  itemTypes,
  singular,
  requiresReview,
  triggerVariant = "default",
  blockedNotice,
}: {
  orgSlug: string;
  boardSlug: string;
  itemTypes: { id: string; name: string }[];
  /** What this organisation calls an item, e.g. "Idea". */
  singular: string;
  /** Whether a submission waits for the team's approval. */
  requiresReview: boolean;
  /** The masthead's is the page's primary action; a second one (the empty
   * board) is outline, so there is never more than one filled button. */
  triggerVariant?: "default" | "outline";
  /** Set when the visitor can't submit; explains why and how to fix it. */
  blockedNotice?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { itemTypeId: itemTypes[0]?.id ?? "" },
  });

  async function onSubmit(values: FormValues) {
    setRootError(null);
    const result = await submitItem(orgSlug, boardSlug, values);
    if (!result.success) {
      setRootError(result.error);
      return;
    }
    if (result.awaitingReview) {
      setPendingSlug(result.slug);
      reset({ itemTypeId: itemTypes[0]?.id ?? "" });
      return;
    }
    setOpen(false);
    router.push(`/b/${orgSlug}/${boardSlug}/${result.slug}`);
  }

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        onClick={() => setOpen(true)}
      >
        <Plus />
        Submit {singular.toLowerCase()}
      </Button>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setPendingSlug(null);
        }}
        title={`Submit ${singular.toLowerCase()}`}
        description={
          requiresReview
            ? "The team reviews new submissions before they appear on the board."
            : undefined
        }
      >
        {blockedNotice ? (
          <p className="text-muted-foreground text-sm">{blockedNotice}</p>
        ) : pendingSlug ? (
          <div className="space-y-3">
            <p className="font-medium">Thanks — we&apos;ve got it.</p>
            <p className="text-muted-foreground text-sm">
              The team will review it, and it appears on the board once they
              approve it. Until then only you can see it.
            </p>
            <Link
              href={`/b/${orgSlug}/${boardSlug}/${pendingSlug}`}
              className="text-sm underline underline-offset-4"
            >
              View your submission
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              label="Title"
              htmlFor="submit-title"
              error={errors.title?.message}
            >
              <Input
                id="submit-title"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
            </FormField>
            <FormField
              label="Details"
              htmlFor="submit-description"
              hint="What would you like, and why does it matter to you?"
              error={errors.description?.message}
            >
              <Textarea
                id="submit-description"
                rows={6}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
            </FormField>
            {itemTypes.length > 1 ? (
              <FormField
                label="Type"
                htmlFor="submit-type"
                error={errors.itemTypeId?.message}
              >
                <Controller
                  control={control}
                  name="itemTypeId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={Object.fromEntries(
                        itemTypes.map((t) => [t.id, t.name]),
                      )}
                    >
                      <SelectTrigger id="submit-type" className="w-full">
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
            ) : null}
            {rootError ? (
              <p role="alert" className="text-destructive text-sm">
                {rootError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting…"
                : `Submit ${singular.toLowerCase()}`}
            </Button>
          </form>
        )}
      </Drawer>
    </>
  );
}
