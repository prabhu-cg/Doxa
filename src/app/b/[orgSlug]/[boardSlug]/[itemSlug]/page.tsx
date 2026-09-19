import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicItemDetail } from "@/components/public/public-item-detail";
import { loadPublicItem } from "@/features/items/public";
import { publicBoardPath } from "@/lib/public-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string; itemSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug, boardSlug, itemSlug } = await params;
  const { item, board } = await loadPublicItem(orgSlug, boardSlug, itemSlug);
  return {
    title: `${item.title} · ${board.name}`,
    description: item.description ?? undefined,
  };
}

/** An item at its own address — what a shared link, a refresh or a search result
 * lands on. From the board's grid the same content opens in a drawer instead. */
export default async function PublicItemPage({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string; itemSlug: string }>;
}) {
  const { orgSlug, boardSlug, itemSlug } = await params;
  const { board } = await loadPublicItem(orgSlug, boardSlug, itemSlug);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={publicBoardPath(orgSlug, boardSlug)}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {board.name}
      </Link>
      <PublicItemDetail
        orgSlug={orgSlug}
        boardSlug={boardSlug}
        itemSlug={itemSlug}
        variant="page"
      />
    </div>
  );
}
