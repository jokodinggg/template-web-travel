import { siteConfigSchema, type ResolvedSiteConfig, type Trip } from "@/config/schema";
import { siteConfig } from "@/config/site.config";

const inclusions = { accommodation: "Hotel", transport: "Mobil", meals: "3x makan" };

export const fixtureTrips: Trip[] = [
  {
    id: "bali-open",
    name: "Uluwatu",
    region: "Badung, Bali",
    categoryId: "pantai",
    type: "open",
    pricePerPax: 900_000,
    duration: "2H1M",
    image: "/images/trips/uluwatu.jpg",
    summary: "Pantai Bali",
    departures: [
      { date: "2026-10-12", slotsLeft: 5 },
      { date: "2026-11-07", slotsLeft: 2 },
      { date: "2026-11-21", slotsLeft: 0 },
      { date: "2026-12-12", slotsLeft: 8 },
    ],
    inclusions,
  },
  {
    id: "bali-mahal",
    name: "Nusa Penida",
    region: "Klungkung, Bali",
    categoryId: "pantai",
    type: "open",
    pricePerPax: 2_500_000,
    duration: "3H2M",
    image: "/images/trips/labuan-bajo.jpg",
    summary: "Pulau di Bali",
    departures: [{ date: "2026-12-05", slotsLeft: 3 }],
    inclusions,
  },
  {
    id: "bromo",
    name: "Bromo Sunrise",
    region: "Probolinggo, Jawa Timur",
    categoryId: "gunung",
    type: "open",
    pricePerPax: 750_000,
    duration: "2H1M",
    image: "/images/trips/bromo.jpg",
    summary: "Gunung",
    departures: [{ date: "2026-11-14", slotsLeft: 6 }],
    inclusions,
  },
  {
    id: "jogja",
    name: "Jogja Heritage",
    region: "D.I. Yogyakarta",
    categoryId: "budaya",
    type: "private",
    pricePerPax: 1_250_000,
    duration: "3H2M",
    image: "/images/trips/jogja.jpg",
    summary: "Budaya",
    minPax: 2,
    maxPax: 15,
    inclusions,
  },
];

export const TODAY = "2026-10-12";

export function makeConfig(overrides: Partial<ResolvedSiteConfig> = {}): ResolvedSiteConfig {
  return { ...siteConfigSchema.parse(siteConfig), trips: fixtureTrips, ...overrides };
}
