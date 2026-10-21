import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { config } from "@/config";
import { FONTS } from "@/lib/fonts";
import { buildJsonLd, buildMetadata, serializeJsonLd, siteUrl } from "@/lib/seo";
import { themeToCssVars } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = buildMetadata(config, siteUrl());

export const viewport: Viewport = {
  themeColor: config.theme.background,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const style = {
    ...themeToCssVars(config.theme),
    "--brand-font-heading": FONTS[config.theme.fontHeading].style.fontFamily,
    "--brand-font-body": FONTS[config.theme.fontBody].style.fontFamily,
  } as CSSProperties;

  return (
    <html lang={config.locale.split("-")[0]} style={style}>
      <body className="bg-background font-body text-foreground antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJsonLd(config, siteUrl())) }}
        />
      </body>
    </html>
  );
}
