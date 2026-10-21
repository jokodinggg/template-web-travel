export const FONT_KEYS = [
  "inter",
  "plus-jakarta-sans",
  "dm-sans",
  "manrope",
  "outfit",
  "poppins",
  "playfair-display",
  "dm-serif-display",
] as const;

export type FontKey = (typeof FONT_KEYS)[number];
