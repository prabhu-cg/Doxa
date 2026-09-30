"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Light, dark or the system's choice. The theme is the `dark` class on <html>,
 * which is what the `.dark` tokens in globals.css key off; "system" is the
 * default so a first visit follows the visitor's OS.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
