import { and, eq, gte, or, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { bookingRequests, type NewBookingRequest } from "./schema";

export type Database = PgDatabase<PgQueryResultHKT>;

export type RecentCounts = { byEmail: number; byIp: number };

export type BookingRepo = {
  insert(row: NewBookingRequest): Promise<void>;
  /** Jumlah request sejak `since` dari email yang sama dan dari `ipHash` yang sama. */
  countRecent(params: { email: string; ipHash: string; since: Date }): Promise<RecentCounts>;
};

export function createBookingRepo(db: Database): BookingRepo {
  return {
    async insert(row) {
      await db.insert(bookingRequests).values(row);
    },

    async countRecent({ email, ipHash, since }) {
      const t = bookingRequests;
      const [row] = await db
        .select({
          byEmail: sql<number>`count(*) filter (where ${t.guestEmail} = ${email})`.mapWith(Number),
          byIp: sql<number>`count(*) filter (where ${t.ipHash} = ${ipHash})`.mapWith(Number),
        })
        .from(t)
        .where(and(gte(t.createdAt, since), or(eq(t.guestEmail, email), eq(t.ipHash, ipHash))));
      return { byEmail: row?.byEmail ?? 0, byIp: row?.byIp ?? 0 };
    },
  };
}

/** True jika error berasal dari pelanggaran unique constraint Postgres (kode 23505). */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth++) {
    if (typeof current === "object" && "code" in current && current.code === "23505") return true;
    current = typeof current === "object" && "cause" in current ? current.cause : undefined;
  }
  return false;
}
