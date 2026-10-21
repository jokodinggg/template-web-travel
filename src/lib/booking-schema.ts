import { z } from "zod";
import type { ResolvedSiteConfig } from "@/config/schema";
import { fill } from "./text";

/**
 * Menormalkan nomor WhatsApp Indonesia ke format `62…`.
 * Menerima `0812…`, `812…`, `62812…`, `+62 812-…`. Mengembalikan `null` jika tidak valid.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.trim().replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return /^628\d{7,11}$/.test(digits) ? digits : null;
}

export const BOOKING_FIELDS = ["name", "email", "phone", "tripId", "departureDate", "pax", "notes"] as const;
export type BookingField = (typeof BOOKING_FIELDS)[number];

/** Schema form booking. `today` adalah `YYYY-MM-DD` di zona waktu `config.booking.timeZone`. */
export function buildBookingSchema(config: ResolvedSiteConfig, today: string) {
  const errors = config.copy.errors;
  const maxPax = config.booking.maxPaxPerRequest;

  return z
    .object({
      name: z.string({ error: errors.name }).trim().min(2, { error: errors.name }).max(100, { error: errors.name }),
      email: z
        .string({ error: errors.email })
        .trim()
        .toLowerCase()
        .pipe(z.email({ error: errors.email }).max(254, { error: errors.email })),
      phone: z.string({ error: errors.phone }).transform((value, ctx) => {
        const phone = normalizePhone(value);
        if (!phone) {
          ctx.addIssue({ code: "custom", message: errors.phone });
          return z.NEVER;
        }
        return phone;
      }),
      tripId: z.string({ error: errors.unknownTrip }).min(1, { error: errors.unknownTrip }),
      departureDate: z.iso.date({ error: errors.date }),
      pax: z.coerce
        .number({ error: fill(errors.paxMax, { max: maxPax }) })
        .int({ error: fill(errors.paxMax, { max: maxPax }) })
        .min(1, { error: fill(errors.paxMax, { max: maxPax }) })
        .max(maxPax, { error: fill(errors.paxMax, { max: maxPax }) }),
      notes: z
        .string()
        .trim()
        .max(1000, { error: errors.notes })
        .optional()
        .transform((v) => v || undefined),
    })
    .superRefine((data, ctx) => {
      const trip = config.trips.find((t) => t.id === data.tripId);
      if (!trip) {
        ctx.addIssue({ code: "custom", path: ["tripId"], message: errors.unknownTrip });
        return;
      }

      if (data.departureDate < today) {
        ctx.addIssue({ code: "custom", path: ["departureDate"], message: errors.pastDate });
        return;
      }

      if (trip.type === "open") {
        const departure = trip.departures.find((d) => d.date === data.departureDate);
        if (!departure) {
          ctx.addIssue({ code: "custom", path: ["departureDate"], message: errors.notADeparture });
        } else if (departure.slotsLeft === 0) {
          ctx.addIssue({ code: "custom", path: ["departureDate"], message: errors.departureFull });
        } else if (data.pax > departure.slotsLeft) {
          ctx.addIssue({
            code: "custom",
            path: ["pax"],
            message: fill(errors.notEnoughSlots, { n: departure.slotsLeft }),
          });
        }
      } else if (data.pax < trip.minPax || data.pax > trip.maxPax) {
        ctx.addIssue({
          code: "custom",
          path: ["pax"],
          message: fill(errors.paxRange, { min: trip.minPax, max: trip.maxPax }),
        });
      }
    });
}

export type BookingInput = z.output<ReturnType<typeof buildBookingSchema>>;
export type BookingFieldErrors = Partial<Record<BookingField, string>>;

/** Mengambil pesan error pertama per field dari hasil `safeParse`. */
export function toFieldErrors(error: z.ZodError): BookingFieldErrors {
  const fieldErrors: BookingFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && (BOOKING_FIELDS as readonly string[]).includes(field)) {
      fieldErrors[field as BookingField] ??= issue.message;
    }
  }
  return fieldErrors;
}
