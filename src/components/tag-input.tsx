"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A chip-based tag input — type a name and press Enter or "," to add it
 * as a removable pill, Backspace on an empty field removes the last one.
 * Controlled: `value` is the array of tag names the parent form field
 * actually holds (e.g. react-hook-form's `field.value`); this component
 * never owns the list itself, only the in-progress draft text.
 */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  maxTags,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  "aria-invalid"?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const candidate = draft.trim();
    setDraft("");
    if (!candidate) return;
    if (value.some((tag) => tag.toLowerCase() === candidate.toLowerCase())) {
      return;
    }
    if (maxTags && value.length >= maxTags) return;
    onChange([...value, candidate]);
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      event.preventDefault();
      removeTag(value.length - 1);
    }
  }

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2.5 py-1.5 transition-colors focus-within:ring-3",
        ariaInvalid &&
          "border-destructive ring-destructive/20 focus-within:ring-3",
      )}
    >
      {value.map((tag, index) => (
        <span
          key={tag}
          className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            aria-label={`Remove ${tag}`}
            className="hover:text-destructive rounded-sm outline-none"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : undefined}
        aria-invalid={ariaInvalid}
        className="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}
