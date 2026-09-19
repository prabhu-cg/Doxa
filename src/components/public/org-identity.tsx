"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { monogram } from "@/lib/brand-color";

/**
 * The organisation's mark and name. Uses its logo when it has one and the logo
 * loads; otherwise a monogram tile in the accent colour, so a page with no
 * branding at all still has a deliberate identity. A wide logo is usually a
 * wordmark that already says the name, so the name is dropped beside one.
 */
export function OrgIdentity({
  name,
  logoUrl,
  size = 32,
  className,
  nameClassName,
  markOnly = false,
  hideMark = false,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
  nameClassName?: string;
  /** The logo or monogram alone, for where the name is already the heading beside it. */
  markOnly?: boolean;
  /** The name alone: the page below already carries the mark, large. */
  hideMark?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [wide, setWide] = useState(false);
  const showLogo = !!logoUrl && !failed;

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {hideMark ? null : showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- external, org-supplied URL; next/image can't optimise an arbitrary host.
        <img
          src={logoUrl}
          alt={wide || markOnly ? `${name} logo` : ""}
          onError={() => setFailed(true)}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalHeight > 0 && naturalWidth / naturalHeight > 2.2) {
              setWide(true);
            }
          }}
          style={{ height: size }}
          className="w-auto max-w-[9rem] shrink-0 rounded-sm object-contain"
        />
      ) : (
        <span
          role="img"
          aria-label={`${name} logo`}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
          className="bg-primary text-primary-foreground flex shrink-0 items-center justify-center rounded-lg font-bold tracking-tight"
        >
          {monogram(name)}
        </span>
      )}
      {markOnly || (wide && showLogo) ? null : (
        <span
          className={cn(
            "truncate text-[15px] font-bold tracking-tight",
            nameClassName,
          )}
        >
          {name}
        </span>
      )}
    </span>
  );
}
