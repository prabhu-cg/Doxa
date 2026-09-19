import { cn } from "@/lib/utils";

/**
 * The Doxa mark, shared between the marketing site and the authenticated
 * app shell so the product presents one consistent identity everywhere —
 * not just on the public pages. `showWordmark` is off by default for
 * tight spaces (e.g. a collapsed sidebar rail).
 */
export function DoxaLogo({
  className,
  markClassName,
  showWordmark = true,
  tagline = false,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  tagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG asset, next/image adds no benefit here */}
      <img
        src="/doxa-logo.svg"
        alt=""
        className={cn("size-7 shrink-0", markClassName)}
      />
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-base font-bold tracking-tight">Doxa</span>
          {tagline ? (
            <span className="text-muted-foreground mt-1 truncate text-[11px] font-medium">
              Listen. Understand. Decide.
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
