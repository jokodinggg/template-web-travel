import {
  DM_Sans,
  DM_Serif_Display,
  Inter,
  Manrope,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
} from "next/font/google";
import type { FontKey } from "@/config/font-keys";

// next/font butuh pemanggilan statis di level modul, jadi semua font yang didukung dideklarasikan di sini.
// `preload: false` agar hanya font yang dipakai config yang diunduh browser.
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], display: "swap", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false });
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

export const FONTS: Record<FontKey, { style: { fontFamily: string } }> = {
  inter,
  "plus-jakarta-sans": plusJakartaSans,
  "dm-sans": dmSans,
  manrope,
  outfit,
  poppins,
  "playfair-display": playfairDisplay,
  "dm-serif-display": dmSerifDisplay,
};
