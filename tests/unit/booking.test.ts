import { describe, expect, it } from "vitest";
import type { Trip } from "@/config/schema";
import {
  estimateTotal,
  formatDate,
  formatMonth,
  formatPrice,
  generateBookingCode,
  todayInTimeZone,
  upcomingDepartures,
} from "@/lib/booking";
import { fill, whatsappLink } from "@/lib/text";

const baseTrip = {
  id: "t",
  name: "T",
  region: "R",
  categoryId: "c",
  pricePerPax: 100,
  duration: "1H",
  image: "/images/t.jpg",
  summary: "s",
  inclusions: { accommodation: "a", transport: "b", meals: "c" },
};

describe("todayInTimeZone", () => {
  it("uses the given zone, not UTC", () => {
    // 23:30 WIB on 12 Oct is still 16:30 UTC on 12 Oct; 00:30 WIB on 13 Oct is 17:30 UTC on 12 Oct.
    expect(todayInTimeZone("Asia/Jakarta", new Date("2026-10-12T16:30:00Z"))).toBe("2026-10-12");
    expect(todayInTimeZone("Asia/Jakarta", new Date("2026-10-12T17:30:00Z"))).toBe("2026-10-13");
    expect(todayInTimeZone("UTC", new Date("2026-10-12T17:30:00Z"))).toBe("2026-10-12");
  });
});

describe("estimateTotal", () => {
  it("multiplies price by pax", () => {
    expect(estimateTotal(1_850_000, 3)).toBe(5_550_000);
  });
});

describe("generateBookingCode", () => {
  it("returns TR- followed by 5 unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateBookingCode()).toMatch(/^TR-[A-HJKMNP-Z2-9]{5}$/);
    }
  });
});

describe("formatting", () => {
  it("formats rupiah without decimals", () => {
    expect(formatPrice(1_850_000, "id-ID", "IDR").replace(/\s/g, " ")).toBe("Rp 1.850.000");
  });

  it("formats a date-only string regardless of runtime zone", () => {
    expect(formatDate("2026-11-07", "id-ID")).toBe("7 Nov 2026");
    expect(formatMonth("2026-11", "id-ID")).toBe("Nov 2026");
  });
});

describe("upcomingDepartures", () => {
  const open: Trip = {
    ...baseTrip,
    type: "open",
    departures: [
      { date: "2026-12-01", slotsLeft: 3 },
      { date: "2026-10-01", slotsLeft: 5 },
      { date: "2026-11-01", slotsLeft: 0 },
      { date: "2026-10-12", slotsLeft: 1 },
    ],
  };

  it("keeps future dates with slots, sorted ascending", () => {
    expect(upcomingDepartures(open, "2026-10-12").map((d) => d.date)).toEqual(["2026-10-12", "2026-12-01"]);
  });

  it("does not filter by date when today is unknown", () => {
    expect(upcomingDepartures(open, null).map((d) => d.date)).toEqual(["2026-10-01", "2026-10-12", "2026-12-01"]);
  });

  it("returns nothing for private trips", () => {
    expect(upcomingDepartures({ ...baseTrip, type: "private", minPax: 1, maxPax: 4 }, "2026-10-12")).toEqual([]);
  });
});

describe("text helpers", () => {
  it("fills known placeholders and keeps unknown ones", () => {
    expect(fill("Sisa {n} dari {total}", { n: 2 })).toBe("Sisa 2 dari {total}");
  });

  it("builds a wa.me link with an encoded message", () => {
    expect(whatsappLink("6281", "Halo kak")).toBe("https://wa.me/6281?text=Halo%20kak");
  });
});
