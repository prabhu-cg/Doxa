/**
 * Turns an organisation's accent colour into the colour tokens the public pages
 * use, keeping text legible whatever they picked: white text on the accent
 * (buttons, the voted chip) and the accent as text on white and on its own tint
 * both reach 4.5:1, darkening the accent only as far as that takes.
 */

export type BrandTokens = {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryText: string;
};

type Rgb = [number, number, number];

const HEX = /^#?([0-9a-f]{6})$/i;

function parseHex(hex: string): Rgb | null {
  const match = HEX.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** WCAG contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const rgbA = parseHex(a);
  const rgbB = parseHex(b);
  if (!rgbA || !rgbB) return 1;
  const [light, dark] = [luminance(rgbA), luminance(rgbB)].sort(
    (x, y) => y - x,
  );
  return (light + 0.05) / (dark + 0.05);
}

/** `amount` of `toward` mixed into `from`. */
function mix(from: Rgb, toward: Rgb, amount: number): Rgb {
  return [
    from[0] + (toward[0] - from[0]) * amount,
    from[1] + (toward[1] - from[1]) * amount,
    from[2] + (toward[2] - from[2]) * amount,
  ];
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const MIN_CONTRAST = 4.5;

/** Null when the value isn't a six-digit hex colour, so callers keep Doxa's own accent. */
export function brandTokens(
  accent: string | null | undefined,
): BrandTokens | null {
  const parsed = accent ? parseHex(accent) : null;
  if (!parsed) return null;

  // Darken until white text on it, and it as text on white, both pass.
  let primary = parsed;
  for (
    let step = 0;
    step < 40 && contrastRatio(toHex(primary), "#ffffff") < MIN_CONTRAST;
    step++
  ) {
    primary = mix(primary, BLACK, 0.06);
  }

  const soft = mix(WHITE, primary, 0.1);
  // The accent as text on its own tint is a little lower than on white.
  let text = primary;
  for (
    let step = 0;
    step < 40 && contrastRatio(toHex(text), toHex(soft)) < MIN_CONTRAST;
    step++
  ) {
    text = mix(text, BLACK, 0.06);
  }

  return {
    primary: toHex(primary),
    primaryHover: toHex(mix(primary, BLACK, 0.16)),
    primarySoft: toHex(soft),
    primaryText: toHex(text),
  };
}

/** Up to two initials, for the monogram shown when there is no logo. */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters =
    words.length === 1
      ? Array.from(words[0]).slice(0, 2)
      : [Array.from(words[0])[0], Array.from(words[1])[0]];
  return letters.join("").toUpperCase();
}

/**
 * Colours for a small tinted badge from any colour an organisation picked (a
 * status, say): the colour at 13% as the ground, and the colour darkened just
 * until it reads on that ground. A raw colour on its own tint fails for the
 * light ones (amber, yellow, grey).
 */
export function badgeColors(
  color: string | null | undefined,
): { background: string; color: string } | undefined {
  const parsed = color ? parseHex(color) : null;
  if (!parsed) return undefined;
  const ground = mix(WHITE, parsed, 0.13);
  let text = parsed;
  for (
    let step = 0;
    step < 40 && contrastRatio(toHex(text), toHex(ground)) < MIN_CONTRAST;
    step++
  ) {
    text = mix(text, BLACK, 0.06);
  }
  return { background: toHex(ground), color: toHex(text) };
}
