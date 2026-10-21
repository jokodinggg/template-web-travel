import path from "node:path";
import { describe, expect, it } from "vitest";
import { siteConfigSchema } from "@/config/schema";
import { siteConfig } from "@/config/site.config";
import { findMissingImages, validateSiteConfig } from "@/config/validate";

const clone = () => structuredClone(siteConfig) as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function issueMessages(input: unknown) {
  const result = siteConfigSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
}

describe("siteConfigSchema", () => {
  it("accepts the example config", () => {
    expect(siteConfigSchema.safeParse(siteConfig).success).toBe(true);
  });

  it("defaults booking.timeZone to Asia/Jakarta", () => {
    const input = clone();
    delete input.booking.timeZone;
    expect(siteConfigSchema.parse(input).booking.timeZone).toBe("Asia/Jakarta");
  });

  it("rejects duplicate trip ids", () => {
    const input = clone();
    input.trips[1].id = input.trips[0].id;
    expect(issueMessages(input).join("\n")).toMatch(/ID trip duplikat: uluwatu/);
  });

  it("rejects an unknown categoryId", () => {
    const input = clone();
    input.trips[0].categoryId = "kuliner";
    expect(issueMessages(input)).toContain("trips.0.categoryId: Kategori tidak dikenal: kuliner");
  });

  it("rejects an open trip without departures", () => {
    const input = clone();
    delete input.trips[0].departures;
    expect(issueMessages(input).some((m) => m.startsWith("trips.0.departures"))).toBe(true);

    input.trips[0].departures = [];
    expect(issueMessages(input).some((m) => m.startsWith("trips.0.departures"))).toBe(true);
  });

  it("rejects a private trip with minPax > maxPax", () => {
    const input = clone();
    const i = input.trips.findIndex((t: { type: string }) => t.type === "private");
    input.trips[i].minPax = 10;
    input.trips[i].maxPax = 5;
    expect(issueMessages(input)).toContain(`trips.${i}.minPax: minPax tidak boleh lebih besar dari maxPax`);
  });

  it("rejects a WhatsApp number that does not start with 62", () => {
    const input = clone();
    input.contact.whatsapp = "081234567890";
    expect(issueMessages(input).some((m) => m.startsWith("contact.whatsapp"))).toBe(true);
  });

  it("rejects an unknown highlight icon", () => {
    const input = clone();
    input.highlights[0].icon = "Rocket";
    expect(issueMessages(input).some((m) => m.startsWith("highlights.0.icon"))).toBe(true);
  });

  it("rejects an unknown section", () => {
    const input = clone();
    input.sections.push("pricing");
    expect(issueMessages(input).some((m) => m.startsWith("sections."))).toBe(true);
  });

  it("rejects an invalid time zone", () => {
    const input = clone();
    input.booking.timeZone = "Asia/Atlantis";
    expect(issueMessages(input).some((m) => m.startsWith("booking.timeZone"))).toBe(true);
  });
});

describe("findMissingImages", () => {
  const publicDir = path.join(process.cwd(), "public");

  it("returns nothing when every image exists", () => {
    expect(findMissingImages(siteConfigSchema.parse(siteConfig), publicDir)).toEqual([]);
  });

  it("names the missing path", () => {
    const input = clone();
    input.trips[0].image = "/images/trips/tidak-ada.jpg";
    expect(findMissingImages(siteConfigSchema.parse(input), publicDir)).toEqual(["/images/trips/tidak-ada.jpg"]);
  });
});

describe("validateSiteConfig", () => {
  it("reports schema errors with their path", () => {
    const input = clone();
    input.contact.whatsapp = "0812";
    const result = validateSiteConfig(input, path.join(process.cwd(), "public"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatch(/^contact\.whatsapp:/);
  });
});
