import path from "node:path";
import { siteConfig } from "../src/config/site.config";
import { validateSiteConfig } from "../src/config/validate";

const result = validateSiteConfig(siteConfig, path.join(process.cwd(), "public"));

if (result.ok) {
  console.log("✓ site.config.ts valid");
} else {
  console.error("✗ site.config.ts tidak valid:");
  for (const error of result.errors) console.error(`  - ${error}`);
  process.exit(1);
}
