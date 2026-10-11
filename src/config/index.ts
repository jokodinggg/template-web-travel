import { siteConfigSchema, type ResolvedSiteConfig } from "./schema";
import { siteConfig } from "./site.config";

// Divalidasi saat modul dimuat, sehingga config yang salah menggagalkan build dan dev server.
export const config: ResolvedSiteConfig = siteConfigSchema.parse(siteConfig);
