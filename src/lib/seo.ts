import type { Metadata } from "next";
import type { ResolvedSiteConfig } from "@/config/schema";
import { formatPrice } from "./booking";

export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export function buildMetadata(config: ResolvedSiteConfig, url: string): Metadata {
  const { seo } = config;
  return {
    metadataBase: new URL(url),
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: config.brand.name,
      title: seo.title,
      description: seo.description,
      locale: config.locale.replace("-", "_"),
      images: [{ url: seo.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

export function buildJsonLd(config: ResolvedSiteConfig, url: string) {
  const prices = config.trips.map((t) => t.pricePerPax);
  const price = (amount: number) => formatPrice(amount, config.locale, config.currency);
  const { contact } = config;

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: config.brand.name,
    description: config.seo.description,
    url,
    image: new URL(config.seo.ogImage, url).toString(),
    telephone: `+${contact.whatsapp}`,
    email: contact.ownerEmail,
    address: { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "ID" },
    priceRange: `${price(Math.min(...prices))} – ${price(Math.max(...prices))}`,
    ...(contact.instagram ? { sameAs: [`https://instagram.com/${contact.instagram}`] } : {}),
  };
}

/** JSON untuk `<script type="application/ld+json">`, aman dari penutupan tag lebih awal. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
