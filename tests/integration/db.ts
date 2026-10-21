import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Database } from "@/db/booking-repo";

/** Database Postgres in-memory dengan migrasi dari folder `drizzle/`. */
export async function createTestDb(): Promise<{ db: Database; client: PGlite }> {
  const client = new PGlite();
  const db = drizzle({ client });
  await migrate(db, { migrationsFolder: "drizzle" });
  return { db, client };
}
