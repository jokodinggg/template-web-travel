"use client";

import type { ResolvedSiteConfig } from "@/config/schema";
import { EMPTY_FILTER, filterKey, filterTrips } from "@/lib/trip-filter";
import { useToday } from "@/lib/use-today";
import { Button } from "../ui/button";
import { FilterBar } from "./filter-bar";
import { TripCard } from "./trip-card";
import { useTripFilter } from "./trip-filter-provider";

type TripsExplorerProps = Pick<ResolvedSiteConfig, "trips" | "categories" | "budgets" | "locale" | "currency"> & {
  timeZone: string;
  copy: ResolvedSiteConfig["copy"]["trips"];
};

export function TripsExplorer({ trips, categories, budgets, locale, currency, timeZone, copy }: TripsExplorerProps) {
  const { filter, setFilter } = useTripFilter();
  const today = useToday(timeZone);
  const visible = filterTrips(trips, filter, { budgets, today });

  return (
    <div>
      <FilterBar
        key={filterKey(filter)}
        trips={trips}
        categories={categories}
        budgets={budgets}
        locale={locale}
        timeZone={timeZone}
        copy={copy}
        initial={filter}
        onApply={setFilter}
      />

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((trip) => (
            <li key={trip.id}>
              <TripCard trip={trip} today={today} locale={locale} currency={currency} copy={copy} />
            </li>
          ))}
        </ul>
      ) : (
        <div
          role="status"
          className="mt-8 flex flex-col items-center gap-4 rounded-[var(--radius-brand)] border border-dashed border-line px-6 py-16 text-center"
        >
          <p className="text-muted">{copy.empty}</p>
          <Button variant="outline" onClick={() => setFilter(EMPTY_FILTER)}>
            {copy.reset}
          </Button>
        </div>
      )}
    </div>
  );
}
