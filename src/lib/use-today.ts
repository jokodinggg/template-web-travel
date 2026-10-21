"use client";

import { useSyncExternalStore } from "react";
import { todayInTimeZone } from "./booking";

const subscribe = () => () => {};

/**
 * Tanggal hari ini di zona waktu config. `null` saat render di server dan saat hidrasi,
 * sehingga halaman tetap bisa di-prerender tanpa membaca jam.
 */
export function useToday(timeZone: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => todayInTimeZone(timeZone),
    () => null,
  );
}
