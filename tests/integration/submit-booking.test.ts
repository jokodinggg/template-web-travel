import type { PGlite } from "@electric-sql/pglite";
import { render } from "@react-email/components";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type BookingRepo, createBookingRepo, type Database } from "@/db/booking-repo";
import { bookingRequests } from "@/db/schema";
import { type EmailMessage, submitBookingCore, type SubmitBookingDeps } from "@/lib/submit-booking";
import { makeConfig } from "../fixtures";
import { createTestDb } from "./db";

const config = makeConfig();
// 12 Okt 2026 pukul 23:30 WIB; server berjalan di UTC (16:30).
const NOW = new Date("2026-10-12T16:30:00Z");

const validInput = {
  name: "Rani Putri",
  email: "rani@example.com",
  phone: "0812 3456 7890",
  tripId: "bali-open",
  departureDate: "2026-11-07",
  pax: "2",
  notes: "Vegetarian",
  website: "",
};

let db: Database;
let client: PGlite;
let repo: BookingRepo;
let sendEmail: ReturnType<typeof vi.fn<(message: EmailMessage) => Promise<void>>>;
let logError: ReturnType<typeof vi.fn<(message: string, error: unknown) => void>>;

beforeEach(async () => {
  ({ db, client } = await createTestDb());
  repo = createBookingRepo(db);
  sendEmail = vi.fn(async () => {});
  logError = vi.fn();
});

afterEach(async () => {
  await client.close();
});

function submit(input: Record<string, unknown>, overrides: Partial<SubmitBookingDeps> = {}) {
  return submitBookingCore(input, { config, repo, sendEmail, now: NOW, ipHash: "ip-a", logError, ...overrides });
}

const savedRows = () => db.select().from(bookingRequests);

describe("submitBookingCore", () => {
  it("saves a pending request, emails owner and guest, and returns the code", async () => {
    const result = await submit(validInput);

    expect(result).toEqual({ ok: true, bookingCode: expect.stringMatching(/^TR-[A-Z2-9]{5}$/) });
    const [row] = await savedRows();
    expect(row).toMatchObject({
      code: result.ok ? result.bookingCode : "",
      tripId: "bali-open",
      tripType: "open",
      departureDate: "2026-11-07",
      guestEmail: "rani@example.com",
      guestPhone: "6281234567890",
      pax: 2,
      notes: "Vegetarian",
      estTotal: 1_800_000,
      status: "pending",
      ipHash: "ip-a",
      createdAt: NOW,
    });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const [owner, guest] = sendEmail.mock.calls.map(([message]) => message);
    expect(owner).toMatchObject({ to: config.contact.ownerEmail, replyTo: "rani@example.com" });
    expect(owner.subject).toContain(row.code);
    expect(guest).toMatchObject({ to: "rani@example.com", replyTo: config.contact.ownerEmail });
    expect(guest.subject).toContain(row.code);
  });

  it("rejects more pax than slots left without saving or emailing", async () => {
    const result = await submit({ ...validInput, pax: "3" });

    expect(result).toEqual({ ok: false, fieldErrors: { pax: "Sisa slot hanya 2" } });
    expect(await savedRows()).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("accepts a departure today at 23:30 WIB while the server clock is UTC", async () => {
    const result = await submit({ ...validInput, departureDate: "2026-10-12" });
    expect(result.ok).toBe(true);
  });

  it("rejects today's departure once it is past midnight WIB", async () => {
    const result = await submit(
      { ...validInput, departureDate: "2026-10-12" },
      { now: new Date("2026-10-12T17:30:00Z") },
    );
    expect(result).toEqual({ ok: false, fieldErrors: { departureDate: config.copy.errors.pastDate } });
  });

  it("fakes success for bots that fill the honeypot", async () => {
    const result = await submit({ ...validInput, website: "https://spam.example" });

    expect(result.ok).toBe(true);
    expect(await savedRows()).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("allows 5 requests per email per hour and rejects the 6th", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await submit(validInput, { ipHash: `ip-${i}` })).ok).toBe(true);
    }
    expect(await submit(validInput, { ipHash: "ip-baru" })).toEqual({
      ok: false,
      message: config.copy.errors.rateLimited,
    });
  });

  it("rejects the 6th request from the same ip hash with different emails", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await submit({ ...validInput, email: `tamu${i}@example.com` })).ok).toBe(true);
    }
    expect((await submit({ ...validInput, email: "lain@example.com" })).ok).toBe(false);
  });

  it("ignores requests older than one hour for the rate limit", async () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
    for (let i = 0; i < 5; i++) await submit(validInput, { now: twoHoursAgo });

    expect((await submit(validInput)).ok).toBe(true);
  });

  it("still returns the code when Resend fails after the insert", async () => {
    sendEmail.mockRejectedValue(new Error("Resend: rate_limit_exceeded"));

    const result = await submit(validInput);

    expect(result.ok).toBe(true);
    expect(await savedRows()).toHaveLength(1);
    expect(logError).toHaveBeenCalledTimes(2);
  });

  it("returns a generic error and sends no email when the insert fails", async () => {
    const failingRepo: BookingRepo = {
      countRecent: async () => ({ byEmail: 0, byIp: 0 }),
      insert: async () => {
        throw new Error("connection refused");
      },
    };

    const result = await submit(validInput, { repo: failingRepo });

    expect(result).toEqual({ ok: false, message: config.copy.errors.generic });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith("[booking] insert failed", expect.any(Error));
  });

  it("retries with a new code when the generated code already exists", async () => {
    await submit(validInput, { generateCode: () => "TR-AAAAA" });
    const codes = ["TR-AAAAA", "TR-BBBBB"];

    const result = await submit(validInput, { generateCode: () => codes.shift()! });

    expect(result).toEqual({ ok: true, bookingCode: "TR-BBBBB" });
  });
});

describe("email templates", () => {
  it("renders the owner notification with booking details and a WhatsApp link", async () => {
    await submit(validInput, { generateCode: () => "TR-K7M2P" });
    const html = await render(sendEmail.mock.calls[0][0].react);

    expect(html).toContain("TR-K7M2P");
    expect(html).toContain("Uluwatu");
    expect(html).toContain("Vegetarian");
    expect(html).toContain("https://wa.me/6281234567890");
  });

  it("renders the guest confirmation with the code and estimate", async () => {
    await submit(validInput, { generateCode: () => "TR-K7M2P" });
    const text = await render(sendEmail.mock.calls[1][0].react, { plainText: true });

    expect(text).toContain("TR-K7M2P");
    expect(text).toContain("Halo Rani Putri,");
    expect(text.replace(/\s/g, " ")).toContain("Rp 1.800.000");
  });
});
