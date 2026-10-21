import { describe, expect, it } from "vitest";
import { buildBookingSchema, normalizePhone, toFieldErrors } from "@/lib/booking-schema";
import { makeConfig, TODAY } from "../fixtures";

const config = makeConfig();
const schema = buildBookingSchema(config, TODAY);

const valid = {
  name: "Rani Putri",
  email: "Rani@Example.com ",
  phone: "0812-3456-7890",
  tripId: "bali-open",
  departureDate: "2026-11-07",
  pax: "2",
  notes: "",
};

function errorsFor(input: Record<string, unknown>) {
  const result = schema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? {} : toFieldErrors(result.error);
}

describe("normalizePhone", () => {
  it.each([
    ["0812 3456 7890", "6281234567890"],
    ["+62 812-3456-7890", "6281234567890"],
    ["6281234567890", "6281234567890"],
    ["81234567890", "6281234567890"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "0212345678", "0812abc", "08123"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("buildBookingSchema", () => {
  it("accepts a valid open-trip booking and normalizes fields", () => {
    expect(schema.parse(valid)).toEqual({
      name: "Rani Putri",
      email: "rani@example.com",
      phone: "6281234567890",
      tripId: "bali-open",
      departureDate: "2026-11-07",
      pax: 2,
      notes: undefined,
    });
  });

  it("rejects more pax than slots left on the chosen departure", () => {
    expect(errorsFor({ ...valid, pax: "3" })).toEqual({ pax: "Sisa slot hanya 2" });
  });

  it("rejects a date that is not one of the trip's departures", () => {
    expect(errorsFor({ ...valid, departureDate: "2026-11-08" })).toEqual({
      departureDate: config.copy.errors.notADeparture,
    });
  });

  it("rejects a sold-out departure", () => {
    expect(errorsFor({ ...valid, departureDate: "2026-11-21" })).toEqual({
      departureDate: config.copy.errors.departureFull,
    });
  });

  it("rejects a past date", () => {
    expect(errorsFor({ ...valid, departureDate: "2026-10-11" })).toEqual({
      departureDate: config.copy.errors.pastDate,
    });
  });

  it("accepts a departure today", () => {
    expect(schema.safeParse({ ...valid, departureDate: TODAY }).success).toBe(true);
  });

  it("enforces minPax and maxPax on private trips", () => {
    const privateTrip = { ...valid, tripId: "jogja", departureDate: "2026-10-20" };
    expect(errorsFor({ ...privateTrip, pax: "1" })).toEqual({ pax: "Jumlah peserta harus 2–15 orang" });
    expect(schema.safeParse({ ...privateTrip, pax: "2" }).success).toBe(true);
  });

  it("accepts any future date on private trips", () => {
    expect(schema.safeParse({ ...valid, tripId: "jogja", departureDate: "2027-03-01" }).success).toBe(true);
  });

  it("rejects an unknown trip", () => {
    expect(errorsFor({ ...valid, tripId: "atlantis" })).toEqual({ tripId: config.copy.errors.unknownTrip });
  });

  it("rejects pax above maxPaxPerRequest", () => {
    expect(errorsFor({ ...valid, tripId: "jogja", pax: "16" }).pax).toBe("Jumlah peserta maksimal 15 per permintaan");
  });

  it("reports base field errors per field", () => {
    expect(errorsFor({ ...valid, name: "A", email: "bukan-email", phone: "123", pax: "0" })).toEqual({
      name: config.copy.errors.name,
      email: config.copy.errors.email,
      phone: config.copy.errors.phone,
      pax: "Jumlah peserta maksimal 15 per permintaan",
    });
  });

  it("reports missing fields instead of throwing", () => {
    const errors = errorsFor({});
    expect(Object.keys(errors).sort()).toEqual(["departureDate", "email", "name", "pax", "phone", "tripId"]);
  });
});
