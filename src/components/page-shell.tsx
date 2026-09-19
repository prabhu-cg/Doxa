import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one page width for the org's list pages (Spaces, Boards, Roadmap,
 * Prioritisation and the pages nested under them): centred with a capped
 * width so it never stretches edge to edge on a big monitor, and the same
 * gutters everywhere so switching between them doesn't shift the content.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Title, description and the page's primary action(s). Actions always sit
 * top right (below the text only on phones) regardless of how long the
 * description is, so the CTA is in the same place on every page.
 */
export function PageHeader({
  title,
  badges,
  description,
  actions,
}: {
  title: string;
  /** Shown inline after the title, e.g. visibility or "Archived". */
  badges?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badges}
        </div>
        {description ? (
          <div className="text-muted-foreground mt-1 max-w-2xl text-sm">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
