"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemTypeManager } from "@/app/org/[slug]/settings/item-types/item-type-manager";
import { StatusManager } from "@/app/org/[slug]/settings/statuses/status-manager";
import { PriorityManager } from "@/app/org/[slug]/settings/priorities/priority-manager";
import { ScoreCriteriaManager } from "@/app/org/[slug]/settings/scoring/score-criteria-manager";
import { CategoryManager } from "@/app/org/[slug]/settings/categories/category-manager";
import { TagManager } from "@/app/org/[slug]/settings/tags/tag-manager";
import type {
  Category,
  ItemType,
  Priority,
  ScoreCriterion,
  Status,
  Tag,
} from "@/generated/prisma/client";

/**
 * The "Content configuration" nested drawer — opened from within the
 * Organisation Settings drawer (org-settings-modal-content.tsx), stacked
 * on top of it as a second Sheet. This is a client-only overlay, not a
 * further intercepted route: all six lists below are fetched once by the
 * outer `@modal/(.)settings/page.tsx` and handed down as props, so
 * opening this drawer never triggers its own navigation or fetch — it's
 * "nested" visually (a panel over a panel), not a separately addressable
 * URL, which keeps six near-identical management screens from needing
 * six more intercepted-route files.
 */
export function ContentConfigDrawer({
  orgSlug,
  canManage,
  itemTypes,
  statuses,
  priorities,
  scoreCriteria,
  categories,
  tags,
}: {
  orgSlug: string;
  canManage: {
    itemTypes: boolean;
    statuses: boolean;
    priorities: boolean;
    scoreCriteria: boolean;
    categories: boolean;
    tags: boolean;
  };
  itemTypes: ItemType[];
  statuses: Status[];
  priorities: Priority[];
  scoreCriteria: ScoreCriterion[];
  categories: Category[];
  tags: Tag[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        className="justify-start"
        onClick={() => setOpen(true)}
      >
        <Settings2 className="size-4" />
        Content configuration
      </Button>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Content configuration</SheetTitle>
          <SheetDescription>
            Item types, statuses, priorities, scoring criteria, categories, and
            tags are per-organisation data, not fixed choices.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Tabs defaultValue="item-types">
            <TabsList className="mb-4 h-auto flex-wrap gap-1 py-1">
              <TabsTrigger value="item-types">Item types</TabsTrigger>
              <TabsTrigger value="statuses">Statuses</TabsTrigger>
              <TabsTrigger value="priorities">Priorities</TabsTrigger>
              <TabsTrigger value="scoring">Scoring</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value="item-types">
              <ItemTypeManager
                orgSlug={orgSlug}
                itemTypes={itemTypes}
                canManage={canManage.itemTypes}
              />
            </TabsContent>
            <TabsContent value="statuses">
              <StatusManager
                orgSlug={orgSlug}
                statuses={statuses}
                canManage={canManage.statuses}
              />
            </TabsContent>
            <TabsContent value="priorities">
              <PriorityManager
                orgSlug={orgSlug}
                priorities={priorities}
                canManage={canManage.priorities}
              />
            </TabsContent>
            <TabsContent value="scoring">
              <ScoreCriteriaManager
                orgSlug={orgSlug}
                criteria={scoreCriteria}
                canManage={canManage.scoreCriteria}
              />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryManager
                orgSlug={orgSlug}
                categories={categories}
                canManage={canManage.categories}
              />
            </TabsContent>
            <TabsContent value="tags">
              <TagManager
                orgSlug={orgSlug}
                tags={tags}
                canManage={canManage.tags}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
