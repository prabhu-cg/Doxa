"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  removeOrganizationLogo,
  updateOrganizationAccentColor,
  uploadOrganizationLogo,
} from "@/features/organizations/actions";
import { LOGO_MAX_BYTES, logoFileError } from "@/features/organizations/schema";
import { brandTokens, monogram } from "@/lib/brand-color";
import { ColorPicker } from "@/components/color-picker";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";

export function BrandingForm({
  slug,
  organizationName,
  initialLogoUrl,
  initialAccentColor,
}: {
  slug: string;
  organizationName: string;
  initialLogoUrl: string;
  initialAccentColor: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPending, startLogo] = useTransition();

  const [accent, setAccent] = useState(initialAccentColor);
  const [savedAccent, setSavedAccent] = useState(initialAccentColor);
  const [accentError, setAccentError] = useState<string | null>(null);
  const [accentSaved, setAccentSaved] = useState(false);
  const [accentPending, startAccent] = useTransition();

  function onFileChosen(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    const problem = logoFileError(file);
    if (problem) {
      setLogoError(problem);
      return;
    }
    const body = new FormData();
    body.set("logo", file);
    startLogo(async () => {
      const result = await uploadOrganizationLogo(slug, body);
      if (!result.success) {
        setLogoError(result.error);
        return;
      }
      setLogoUrl(result.logoUrl ?? "");
    });
  }

  function onRemoveLogo() {
    setLogoError(null);
    startLogo(async () => {
      const result = await removeOrganizationLogo(slug);
      if (!result.success) {
        setLogoError(result.error);
        return;
      }
      setLogoUrl("");
    });
  }

  function onSaveAccent() {
    setAccentError(null);
    setAccentSaved(false);
    startAccent(async () => {
      const result = await updateOrganizationAccentColor(slug, {
        accentColor: accent,
      });
      if (!result.success) {
        setAccentError(result.error);
        return;
      }
      setSavedAccent(accent);
      setAccentSaved(true);
    });
  }

  return (
    <div className="space-y-6">
      <FormField
        label="Logo"
        htmlFor="logo"
        hint={`PNG, JPG, WebP or SVG, up to ${LOGO_MAX_BYTES / 1024} KB. A wide wordmark is shown without the organisation's name beside it.`}
        error={logoError ?? undefined}
      >
        <div className="flex items-center gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a just-uploaded file from storage; next/image adds nothing here.
            <img
              src={logoUrl}
              alt={`${organizationName} logo`}
              className="bg-muted/50 h-14 w-auto max-w-40 shrink-0 rounded-lg border object-contain p-1.5"
            />
          ) : (
            <span
              role="img"
              aria-label="No logo yet: the organisation's initials are shown"
              style={{
                backgroundColor: brandTokens(accent)?.primary,
              }}
              className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold tracking-tight"
            >
              {monogram(organizationName)}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(event) => {
                onFileChosen(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={logoPending}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus />
              {logoPending
                ? "Working…"
                : logoUrl
                  ? "Replace logo"
                  : "Upload logo"}
            </Button>
            {logoUrl ? (
              <Button
                type="button"
                variant="ghost"
                disabled={logoPending}
                onClick={onRemoveLogo}
              >
                <Trash2 />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </FormField>

      <FormField
        label="Accent colour"
        htmlFor="accentColor"
        hint="Used for buttons, votes and links on your public pages. If it's too light for white text, it's darkened automatically so everything stays readable."
        error={accentError ?? undefined}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <ColorPicker
              id="accentColor"
              value={accent}
              onChange={(value) => {
                setAccent(value);
                setAccentSaved(false);
              }}
            />
          </div>
          <Button
            type="button"
            disabled={accentPending || accent === savedAccent}
            onClick={onSaveAccent}
          >
            {accentPending ? "Saving…" : "Save colour"}
          </Button>
          {accentSaved ? (
            <span className="text-muted-foreground text-sm">Saved.</span>
          ) : null}
        </div>
      </FormField>
    </div>
  );
}
