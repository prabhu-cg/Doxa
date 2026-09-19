"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Drawer } from "@/components/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UpdateItemForm } from "./update-item-form";
import { ArchiveItemControl } from "./archive-item-control";

type Option = { id: string; name: string };

/**
 * Everything that changes an item — its fields, and archiving it — lives
 * here, behind one "Edit" button, so the item page itself stays a read-and-
 * decide view.
 */
export function EditItemDrawer({
  orgSlug,
  boardSlug,
  itemSlug,
  title,
  archived,
  canArchive,
  initial,
  itemTypes,
  statuses,
  priorities,
  categories,
}: {
  orgSlug: string;
  boardSlug: string;
  itemSlug: string;
  title: string;
  archived: boolean;
  canArchive: boolean;
  initial: {
    title: string;
    description: string;
    itemTypeId: string;
    statusId: string;
    priorityId: string;
    categoryId: string;
    tags: string[];
  };
  itemTypes: Option[];
  statuses: Option[];
  priorities: Option[];
  categories: Option[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil />
        Edit
      </Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Edit item"
        description={title}
      >
        <div className="space-y-8">
          <UpdateItemForm
            orgSlug={orgSlug}
            boardSlug={boardSlug}
            itemSlug={itemSlug}
            initialTitle={initial.title}
            initialDescription={initial.description}
            initialItemTypeId={initial.itemTypeId}
            initialStatusId={initial.statusId}
            initialPriorityId={initial.priorityId}
            initialCategoryId={initial.categoryId}
            initialTags={initial.tags}
            itemTypes={itemTypes}
            statuses={statuses}
            priorities={priorities}
            categories={categories}
            onSaved={() => setOpen(false)}
          />

          {canArchive ? (
            <>
              <Separator />

              <section className="space-y-3">
                <h2 className="text-sm font-semibold">
                  {archived ? "Restore item" : "Archive item"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {archived
                    ? "This item is archived. Restoring it shows it on the public page again."
                    : "Archiving hides this item from the public page. Members still see it, marked Archived."}
                </p>
                <ArchiveItemControl
                  orgSlug={orgSlug}
                  boardSlug={boardSlug}
                  itemSlug={itemSlug}
                  archived={archived}
                  onDone={() => setOpen(false)}
                />
              </section>
            </>
          ) : null}
        </div>
      </Drawer>
    </>
  );
}
