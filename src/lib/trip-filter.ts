import type { Budget, Trip } from "@/config/schema";
import { upcomingDepartures } from "./booking";

export type TripFilter = {
  /** Teks bebas, dicocokkan ke nama, region, dan kategori trip. */
  query: string;
  categoryId: string;
  budgetId: string;
  /** `YYYY-MM` atau kosong. */
  month: string;
};

export const EMPTY_FILTER: TripFilter = { query: "", categoryId: "", budgetId: "", month: "" };

export function isFilterEmpty(filter: TripFilter): boolean {
  return Object.values(filter).every((v) => v.trim() === "");
}

type FilterContext = { budgets: Budget[]; today?: string | null };

export function filterTrips(trips: Trip[], filter: TripFilter, { budgets, today }: FilterContext): Trip[] {
  const query = filter.query.trim().toLowerCase();
  const budget = budgets.find((b) => b.id === filter.budgetId);

  return trips.filter((trip) => {
    if (query) {
      const haystack = `${trip.name} ${trip.region} ${trip.categoryId}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filter.categoryId && trip.categoryId !== filter.categoryId) return false;
    if (budget) {
      if (trip.pricePerPax < budget.min) return false;
      if (budget.max !== undefined && trip.pricePerPax > budget.max) return false;
    }
    if (filter.month && trip.type === "open") {
      const departsInMonth = upcomingDepartures(trip, today).some((d) => d.date.startsWith(`${filter.month}-`));
      if (!departsInMonth) return false;
    }
    return true;
  });
}

/** Bulan (`YYYY-MM`) yang punya keberangkatan open trip tersedia, urut naik. */
export function departureMonths(trips: Trip[], today?: string | null): string[] {
  const months = trips.flatMap((trip) => upcomingDepartures(trip, today).map((d) => d.date.slice(0, 7)));
  return [...new Set(months)].sort();
}
