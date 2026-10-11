import { describe, expect, it } from "vitest";
import { departureMonths, EMPTY_FILTER, filterTrips, isFilterEmpty } from "@/lib/trip-filter";
import { fixtureTrips, makeConfig, TODAY } from "../fixtures";

const { budgets } = makeConfig();
const ids = (filter: Partial<typeof EMPTY_FILTER>, today: string | null = TODAY) =>
  filterTrips(fixtureTrips, { ...EMPTY_FILTER, ...filter }, { budgets, today }).map((t) => t.id);

describe("filterTrips", () => {
  it("returns every trip for an empty filter", () => {
    expect(ids({})).toEqual(["bali-open", "bali-mahal", "bromo", "jogja"]);
  });

  it("matches the query against name, region and category, case-insensitively", () => {
    expect(ids({ query: "BALI" })).toEqual(["bali-open", "bali-mahal"]);
    expect(ids({ query: "bromo" })).toEqual(["bromo"]);
    expect(ids({ query: "gunung" })).toEqual(["bromo"]);
  });

  it("filters by category", () => {
    expect(ids({ categoryId: "budaya" })).toEqual(["jogja"]);
  });

  it("filters by budget range, inclusive", () => {
    expect(ids({ budgetId: "hemat" })).toEqual(["bali-open", "bromo"]);
    expect(ids({ budgetId: "premium" })).toEqual([]);
    expect(ids({ budgetId: "menengah" })).toEqual(["bali-mahal", "jogja"]);
  });

  it("combines location and budget like the hero search", () => {
    expect(ids({ query: "bali", budgetId: "hemat" })).toEqual(["bali-open"]);
  });

  it("keeps open trips with a bookable departure in the month, and every private trip", () => {
    expect(ids({ month: "2026-11" })).toEqual(["bali-open", "bromo", "jogja"]);
    expect(ids({ month: "2026-12" })).toEqual(["bali-open", "bali-mahal", "jogja"]);
  });

  it("ignores sold-out and past departures for the month filter", () => {
    expect(ids({ month: "2026-10", query: "uluwatu" }, "2026-10-13")).toEqual([]);
    expect(ids({ month: "2026-10", query: "uluwatu" })).toEqual(["bali-open"]);
  });
});

describe("departureMonths", () => {
  it("lists unique upcoming months in order", () => {
    expect(departureMonths(fixtureTrips, TODAY)).toEqual(["2026-10", "2026-11", "2026-12"]);
    expect(departureMonths(fixtureTrips, "2026-10-13")).toEqual(["2026-11", "2026-12"]);
  });
});

describe("isFilterEmpty", () => {
  it("treats whitespace as empty", () => {
    expect(isFilterEmpty({ ...EMPTY_FILTER, query: "  " })).toBe(true);
    expect(isFilterEmpty({ ...EMPTY_FILTER, budgetId: "hemat" })).toBe(false);
  });
});
