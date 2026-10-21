import { existsSync } from "node:fs";
import path from "node:path";
import { siteConfigSchema, type ResolvedSiteConfig } from "./schema";

export function collectImagePaths(config: ResolvedSiteConfig): string[] {
  const paths = [
    config.brand.logo,
    config.hero.image,
    config.seo.ogImage,
    ...config.values.slides.map((s) => s.image),
    ...config.trips.map((t) => t.image),
  ].filter((p): p is string => Boolean(p));
  return [...new Set(paths)];
}

/** Path gambar di config yang filenya tidak ada di `publicDir`. */
export function findMissingImages(config: ResolvedSiteConfig, publicDir: string): string[] {
  return collectImagePaths(config).filter((p) => !existsSync(path.join(publicDir, p)));
}

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateSiteConfig(input: unknown, publicDir: string): ValidationResult {
  const parsed = siteConfigSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  const missing = findMissingImages(parsed.data, publicDir);
  if (missing.length > 0) {
    return { ok: false, errors: missing.map((p) => `Gambar tidak ditemukan: public${p}`) };
  }
  return { ok: true };
}
