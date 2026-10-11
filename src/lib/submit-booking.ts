import { createElement, type ReactElement } from "react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { type BookingRepo, isUniqueViolation } from "@/db/booking-repo";
import { GuestConfirmation } from "@/emails/GuestConfirmation";
import { OwnerNotification } from "@/emails/OwnerNotification";
import type { BookingSummary, EmailTheme } from "@/emails/shared";
import { estimateTotal, formatDate, formatPrice, generateBookingCode, todayInTimeZone } from "./booking";
import { type BookingFieldErrors, buildBookingSchema, toFieldErrors } from "./booking-schema";
import { fill } from "./text";
import { readableOn } from "./theme";

export type BookingResult =
  | { ok: true; bookingCode: string }
  | { ok: false; fieldErrors?: BookingFieldErrors; message?: string };

export type EmailMessage = {
  to: string;
  subject: string;
  replyTo?: string;
  react: ReactElement;
};

export type SubmitBookingDeps = {
  config: ResolvedSiteConfig;
  repo: BookingRepo;
  sendEmail: (message: EmailMessage) => Promise<void>;
  now: Date;
  ipHash: string;
  generateCode?: () => string;
  logError?: (message: string, error: unknown) => void;
};

export const HONEYPOT_FIELD = "website";
export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const MAX_CODE_ATTEMPTS = 3;

export async function submitBookingCore(
  input: Record<string, unknown>,
  {
    config,
    repo,
    sendEmail,
    now,
    ipHash,
    generateCode = generateBookingCode,
    logError = (message, error) => console.error(message, error),
  }: SubmitBookingDeps,
): Promise<BookingResult> {
  const { errors } = config.copy;

  // Bot mengisi field tersembunyi: balas sukses palsu tanpa menyimpan apa pun.
  const honeypot = input[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true, bookingCode: generateCode() };
  }

  const today = todayInTimeZone(config.booking.timeZone, now);
  const parsed = buildBookingSchema(config, today).safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const trip = config.trips.find((t) => t.id === data.tripId)!;

  try {
    const recent = await repo.countRecent({
      email: data.email,
      ipHash,
      since: new Date(now.getTime() - RATE_LIMIT.windowMs),
    });
    if (recent.byEmail >= RATE_LIMIT.max || recent.byIp >= RATE_LIMIT.max) {
      return { ok: false, message: errors.rateLimited };
    }
  } catch (error) {
    logError("[booking] rate limit check failed", error);
    return { ok: false, message: errors.generic };
  }

  const estTotal = estimateTotal(trip.pricePerPax, data.pax);
  let bookingCode = "";
  for (let attempt = 1; ; attempt++) {
    bookingCode = generateCode();
    try {
      await repo.insert({
        code: bookingCode,
        tripId: trip.id,
        tripType: trip.type,
        departureDate: data.departureDate,
        guestName: data.name,
        guestEmail: data.email,
        guestPhone: data.phone,
        pax: data.pax,
        notes: data.notes ?? null,
        estTotal,
        ipHash,
        // Jam yang sama dengan pengecekan rate limit, bukan now() database.
        createdAt: now,
      });
      break;
    } catch (error) {
      if (isUniqueViolation(error) && attempt < MAX_CODE_ATTEMPTS) continue;
      logError("[booking] insert failed", error);
      return { ok: false, message: errors.generic };
    }
  }

  const summary: BookingSummary = {
    code: bookingCode,
    tripName: trip.name,
    departure: formatDate(data.departureDate, config.locale, { month: "long", weekday: "long" }),
    pax: data.pax,
    estimate: formatPrice(estTotal, config.locale, config.currency),
    guestName: data.name,
    guestEmail: data.email,
    guestPhone: data.phone,
    notes: data.notes,
  };
  const theme: EmailTheme = {
    primary: config.theme.primary,
    primaryForeground: readableOn(config.theme.primary),
    accent: config.theme.accent,
    muted: config.theme.muted,
  };
  const emailCopy = config.copy.email;

  // Booking sudah tersimpan; kegagalan email hanya di-log agar peserta tetap menerima kodenya.
  const results = await Promise.allSettled([
    sendEmail({
      to: config.contact.ownerEmail,
      replyTo: data.email,
      subject: fill(emailCopy.ownerSubject, { code: bookingCode, trip: trip.name }),
      react: createElement(OwnerNotification, { brandName: config.brand.name, booking: summary, copy: emailCopy, theme }),
    }),
    sendEmail({
      to: data.email,
      replyTo: config.contact.ownerEmail,
      subject: fill(emailCopy.guestSubject, { code: bookingCode }),
      react: createElement(GuestConfirmation, {
        brandName: config.brand.name,
        booking: summary,
        copy: emailCopy,
        estimateNote: config.copy.booking.estimateNote,
        ownerWhatsapp: config.contact.whatsapp,
        theme,
      }),
    }),
  ]);
  for (const result of results) {
    if (result.status === "rejected") logError(`[booking] email failed for ${bookingCode}`, result.reason);
  }

  return { ok: true, bookingCode };
}
