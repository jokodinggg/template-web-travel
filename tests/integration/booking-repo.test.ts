import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createBookingRepo, type Database, isUniqueViolation } from "@/db/booking-repo";
import { bookingRequests, type NewBookingRequest } from "@/db/schema";
import { createTestDb } from "./db";

let db: Database;
let client: PGlite;

beforeEach(async () => {
  ({ db, client } = await createTestDb());
});

afterEach(async () => {
  await client.close();
});

let counter = 0;
const row = (overrides: Partial<NewBookingRequest> = {}): NewBookingRequest => ({
  code: `TR-${String(++counter).padStart(5, "0")}`,
  tripId: "bromo",
  tripType: "open",
  departureDate: "2026-11-14",
  guestName: "Rani",
  guestEmail: "rani@example.com",
  guestPhone: "6281234567890",
  pax: 2,
  estTotal: 1_900_000,
  ipHash: "ip-a",
  ...overrides,
});

describe("createBookingRepo", () => {
  it("inserts a pending booking request", async () => {
    const repo = createBookingRepo(db);
    await repo.insert(row({ code: "TR-ABCDE", notes: "Jemput di stasiun" }));

    const [saved] = await db.select().from(bookingRequests);
    expect(saved).toMatchObject({
      code: "TR-ABCDE",
      status: "pending",
      departureDate: "2026-11-14",
      notes: "Jemput di stasiun",
    });
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it("rejects a duplicate code with a unique violation", async () => {
    const repo = createBookingRepo(db);
    await repo.insert(row({ code: "TR-SAME1" }));
    const error = await repo.insert(row({ code: "TR-SAME1" })).catch((e: unknown) => e);
    expect(isUniqueViolation(error)).toBe(true);
    expect(isUniqueViolation(new Error("lain"))).toBe(false);
  });

  it("counts recent requests per email and per ip hash since a cutoff", async () => {
    const repo = createBookingRepo(db);
    const now = new Date("2026-10-12T10:00:00Z");
    const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

    await repo.insert(row({ createdAt: minutesAgo(10) }));
    await repo.insert(row({ createdAt: minutesAgo(20), ipHash: "ip-b" }));
    await repo.insert(row({ createdAt: minutesAgo(30), guestEmail: "lain@example.com" }));
    await repo.insert(row({ createdAt: minutesAgo(90) }));
    await repo.insert(row({ createdAt: minutesAgo(5), guestEmail: "x@example.com", ipHash: "ip-x" }));

    await expect(
      repo.countRecent({ email: "rani@example.com", ipHash: "ip-a", since: minutesAgo(60) }),
    ).resolves.toEqual({ byEmail: 2, byIp: 2 });
    await expect(
      repo.countRecent({ email: "baru@example.com", ipHash: "ip-baru", since: minutesAgo(60) }),
    ).resolves.toEqual({ byEmail: 0, byIp: 0 });
  });
});
