import { brandTokens } from "@/lib/brand-color";

/**
 * Re-points the accent tokens at the organisation's colour for everything on the
 * page, including the drawers, which render in a portal outside the page's own
 * element. Renders nothing when there is no valid colour, so an unbranded page
 * keeps Doxa's terracotta. The value is re-validated as a hex colour here, so it
 * can't carry anything but a colour into the stylesheet.
 */
export function BrandStyle({ accentColor }: { accentColor?: string | null }) {
  const tokens = brandTokens(accentColor);
  if (!tokens) return null;
  return (
    <style>{`:root{--primary:${tokens.primary};--primary-hover:${tokens.primaryHover};--primary-soft:${tokens.primarySoft};--primary-text:${tokens.primaryText};--ring:${tokens.primary};--accent:${tokens.primarySoft};--accent-foreground:${tokens.primaryText};--sidebar-primary:${tokens.primary};--sidebar-ring:${tokens.primary}}`}</style>
  );
}
