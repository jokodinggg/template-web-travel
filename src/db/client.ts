import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Database } from "./booking-repo";

let db: Database | undefined;

/** Koneksi Neon. Gagal dengan pesan jelas jika `DATABASE_URL` belum diset; tidak ada fallback mock. */
export function getDb(): Database {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diset. Jalankan `vercel env pull` setelah menambahkan integrasi Neon, lalu `npm run db:push`.",
    );
  }
  db = drizzle({ client: neon(url) });
  return db;
}
