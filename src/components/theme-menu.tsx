"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

/**
 * The pill sun/moon toggle: light or dark, nothing else. Both icons render and
 * swap with the `dark` class in CSS alone, so server and browser render the
 * same markup whatever the stored choice is.
 */
export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Toggle light and dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  );
}
