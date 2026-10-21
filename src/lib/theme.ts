import type { ResolvedSiteConfig } from "@/config/schema";

type Theme = ResolvedSiteConfig["theme"];

const DARK_TEXT = "#141414";
const LIGHT_TEXT = "#ffffff";

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Warna teks (gelap atau putih) yang paling kontras di atas `background`. */
export function readableOn(background: string): string {
  return contrast(background, LIGHT_TEXT) >= contrast(background, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT;
}

/** CSS variables `--brand-*` yang dibaca Tailwind lewat `@theme inline` di `globals.css`. */
export function themeToCssVars(theme: Theme): Record<`--brand-${string}`, string> {
  return {
    "--brand-primary": theme.primary,
    "--brand-primary-foreground": readableOn(theme.primary),
    "--brand-accent": theme.accent,
    "--brand-accent-foreground": readableOn(theme.accent),
    "--brand-background": theme.background,
    "--brand-foreground": theme.foreground,
    "--brand-muted": theme.muted,
    "--brand-radius": theme.radius,
  };
}
