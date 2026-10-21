"use client";

import { useState } from "react";
import type { Trip } from "@/config/schema";
import { formatMonth } from "@/lib/booking";
import { departureMonths, type TripFilter } from "@/lib/trip-filter";
import { useToday } from "@/lib/use-today";

/** State draft sebuah bar filter. Filter baru dipakai saat tombol Explore / Discover ditekan. */
export function useFilterDraft(initial: TripFilter) {
  const [draft, setDraft] = useState(initial);
  const update = <K extends keyof TripFilter>(key: K, value: TripFilter[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  return { draft, update };
}

/** Pilihan bulan keberangkatan untuk select "Tanggal". */
export function useMonthOptions(trips: Trip[], locale: string, timeZone: string) {
  const today = useToday(timeZone);
  return departureMonths(trips, today).map((month) => ({ value: month, label: formatMonth(month, locale) }));
}
