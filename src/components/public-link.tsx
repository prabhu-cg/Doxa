"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const subscribe = () => () => {};

/** The origin of the page you're on. Empty while rendering on the server, so
 * server and first client render agree; the real value follows. */
function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}

/**
 * Copies `${origin}${path}` and flashes a check for two seconds. The link uses
 * the address you're on, so it is correct on any domain without a setting.
 */
function useCopyLink(path: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // No clipboard access (an insecure page, or the browser said no): show
      // the link so it can still be selected by hand.
      toast.error("Couldn't copy the link automatically", { description: url });
      return;
    }
    toast.success("Public link copied");
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return { copied, copy };
}

/** One click copies the public page's link. */
export function CopyLinkButton({
  path,
  label = "Copy public link",
  variant = "outline",
}: {
  path: string;
  label?: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
}) {
  const { copied, copy } = useCopyLink(path);
  return (
    <Button type="button" variant={variant} onClick={copy}>
      {copied ? <Check /> : <Link2 />}
      {label}
    </Button>
  );
}

/** The link itself, selectable, with a copy button beside it. */
export function PublicLinkField({ path }: { path: string }) {
  const origin = useOrigin();
  const { copied, copy } = useCopyLink(path);
  return (
    <div className="flex gap-2">
      <Input
        readOnly
        aria-label="Public link"
        value={`${origin}${path}`}
        onFocus={(event) => event.currentTarget.select()}
      />
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <Check /> : <Link2 />}
        Copy
      </Button>
    </div>
  );
}
