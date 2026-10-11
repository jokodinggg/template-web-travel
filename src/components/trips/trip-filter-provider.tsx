"use client";

import { createContext, use, useMemo, useState } from "react";
import { EMPTY_FILTER, type TripFilter } from "@/lib/trip-filter";

type TripFilterContextValue = {
  filter: TripFilter;
  setFilter: (filter: TripFilter) => void;
};

const TripFilterContext = createContext<TripFilterContextValue | null>(null);

export function TripFilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<TripFilter>(EMPTY_FILTER);
  const value = useMemo(() => ({ filter, setFilter }), [filter]);
  return <TripFilterContext value={value}>{children}</TripFilterContext>;
}

export function useTripFilter(): TripFilterContextValue {
  const context = use(TripFilterContext);
  if (!context) throw new Error("useTripFilter harus dipakai di dalam <TripFilterProvider>");
  return context;
}
