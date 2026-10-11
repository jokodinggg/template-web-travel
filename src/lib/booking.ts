import type { Departure, Trip } from "@/config/schema";

/** Tanggal hari ini (`YYYY-MM-DD`) di zona waktu tertentu, terlepas dari zona waktu server. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function estimateTotal(pricePerPax: number, pax: number): number {
  return pricePerPax * pax;
}

// Tanpa 0/O, 1/I/L agar kode mudah dibacakan lewat telepon.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateBookingCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const suffix = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  return `TR-${suffix}`;
}

export function formatPrice(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Memformat `YYYY-MM-DD` tanpa terpengaruh zona waktu runtime. */
export function formatDate(date: string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Memformat bulan `YYYY-MM`, mis. "Nov 2026". */
export function formatMonth(month: string, locale: string): string {
  return formatDate(`${month}-01`, locale, { day: undefined, month: "short", year: "numeric" });
}

/**
 * Jadwal open trip yang masih bisa dipesan: slot > 0 dan belum lewat, urut dari terdekat.
 * Jika `today` tidak diketahui (mis. saat render di server), tanggal tidak disaring.
 */
export function upcomingDepartures(trip: Trip, today?: string | null): Departure[] {
  if (trip.type !== "open") return [];
  return trip.departures
    .filter((d) => d.slotsLeft > 0 && (!today || d.date >= today))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}
