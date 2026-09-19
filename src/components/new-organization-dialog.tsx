"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateOrganizationForm } from "@/components/create-organization-form";

/** Creating another organisation, as a modal over whatever page you're on.
 * (A first organisation is made during onboarding, which is its own page.) */
export function NewOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an organisation</DialogTitle>
          <DialogDescription>You&apos;ll be its owner.</DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm
          onCreated={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
