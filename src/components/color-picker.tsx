"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Mid-tone hues that stay readable as text on their own 13% tint, which is how
// statuses and priorities render their colour.
const PRESETS: { name: string; hex: string }[] = [
  { name: "Slate", hex: "#94a3b8" },
  { name: "Charcoal", hex: "#475569" },
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Green", hex: "#22c55e" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
];

/**
 * Pick a colour instead of typing a hex code: a palette for the common case,
 * the browser's own picker for anything else. `value` is `#rrggbb` or "" for
 * no colour, matching what the status and priority schemas accept.
 */
export function ColorPicker({
  id,
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = value.toLowerCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        aria-invalid={ariaInvalid}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 bg-background flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm outline-none focus-visible:ring-3"
      >
        <span
          aria-hidden
          className={cn(
            "border-foreground/15 size-4 shrink-0 rounded-full border",
            !value && "border-dashed",
          )}
          style={value ? { backgroundColor: value } : undefined}
        />
        <span
          className={cn(
            "truncate tabular-nums",
            !value && "text-muted-foreground",
          )}
        >
          {value || "Pick color"}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div
          role="group"
          aria-label="Color palette"
          className="grid grid-cols-6 gap-2"
        >
          {PRESETS.map((preset) => {
            const selected = current === preset.hex;
            return (
              <button
                key={preset.hex}
                type="button"
                aria-label={preset.name}
                aria-pressed={selected}
                onClick={() => {
                  onChange(preset.hex);
                  setOpen(false);
                }}
                className={cn(
                  "focus-visible:ring-ring/50 flex size-7 items-center justify-center rounded-full text-white outline-none focus-visible:ring-3",
                  selected &&
                    "ring-foreground/50 ring-offset-popover ring-2 ring-offset-2",
                )}
                style={{ backgroundColor: preset.hex }}
              >
                {selected ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input
              type="color"
              aria-label="Custom color"
              value={/^#[0-9a-f]{6}$/.test(current) ? current : "#94a3b8"}
              onChange={(event) => onChange(event.target.value)}
              className="size-7 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
            />
            Custom
          </label>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              No color
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
