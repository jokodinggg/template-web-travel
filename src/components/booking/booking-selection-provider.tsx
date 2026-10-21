"use client";

import { createContext, use, useMemo, useState } from "react";

type BookingSelectionContextValue = {
  selectedTripId: string;
  selectTrip: (tripId: string) => void;
};

const BookingSelectionContext = createContext<BookingSelectionContextValue | null>(null);

export function BookingSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedTripId, selectTrip] = useState("");
  const value = useMemo(() => ({ selectedTripId, selectTrip }), [selectedTripId]);
  return <BookingSelectionContext value={value}>{children}</BookingSelectionContext>;
}

export function useBookingSelection(): BookingSelectionContextValue {
  const context = use(BookingSelectionContext);
  if (!context) throw new Error("useBookingSelection harus dipakai di dalam <BookingSelectionProvider>");
  return context;
}
