import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Trip tidak disimpan di database karena trip adalah konten di site.config.ts.
export const bookingRequests = pgTable(
  "booking_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    tripId: text("trip_id").notNull(),
    tripType: text("trip_type", { enum: ["open", "private"] }).notNull(),
    departureDate: date("departure_date", { mode: "string" }).notNull(),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    guestPhone: text("guest_phone").notNull(),
    pax: integer("pax").notNull(),
    notes: text("notes"),
    estTotal: integer("est_total").notNull(),
    status: text("status").notNull().default("pending"),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("booking_requests_email_created_idx").on(t.guestEmail, t.createdAt),
    index("booking_requests_ip_created_idx").on(t.ipHash, t.createdAt),
  ],
);

export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;
