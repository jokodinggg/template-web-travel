import { describe, expect, it } from "vitest";
import { buildJsonLd, buildMetadata, serializeJsonLd, siteUrl } from "@/lib/seo";
import { readableOn, themeToCssVars } from "@/lib/theme";
import { makeConfig } from "../fixtures";

const config = makeConfig();

describe("theme", () => {
  it("picks readable text colors", () => {
    expect(readableOn("#141414")).toBe("#ffffff");
    expect(readableOn("#F4F2ED")).toBe("#141414");
    expect(readableOn("#E8572A")).toBe("#141414");
  });

  it("maps every theme color to a --brand-* variable", () => {
    expect(themeToCssVars(config.theme)).toMatchObject({
      "--brand-primary": config.theme.primary,
      "--brand-accent": config.theme.accent,
      "--brand-background": config.theme.background,
      "--brand-foreground": config.theme.foreground,
      "--brand-muted": config.theme.muted,
      "--brand-radius": config.theme.radius,
    });
  });
});

describe("seo", () => {
  it("resolves the site URL from env", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://nusa.id/" })).toBe("https://nusa.id");
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "nusa.vercel.app" })).toBe(
      "https://nusa.vercel.app",
    );
    expect(siteUrl({})).toBe("http://localhost:3000");
  });

  it("builds metadata from config.seo", () => {
    const metadata = buildMetadata(config, "https://nusa.id");
    expect(metadata.title).toBe(config.seo.title);
    expect(metadata.openGraph?.images).toEqual([{ url: config.seo.ogImage }]);
  });

  it("builds TravelAgency JSON-LD with a price range from trips", () => {
    const jsonLd = buildJsonLd(config, "https://nusa.id");
    expect(jsonLd["@type"]).toBe("TravelAgency");
    expect(jsonLd.telephone).toBe(`+${config.contact.whatsapp}`);
    expect(jsonLd.priceRange.replace(/\s/g, " ")).toBe("Rp 750.000 – Rp 2.500.000");
    expect(jsonLd.image).toBe("https://nusa.id/images/og.jpg");
  });

  it("escapes < in JSON-LD", () => {
    expect(serializeJsonLd({ name: "</script>" })).toBe('{"name":"\\u003c/script>"}');
  });
});
