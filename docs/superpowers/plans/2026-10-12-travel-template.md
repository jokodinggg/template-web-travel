# Template Website Travel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Template one-page Next.js untuk travel agent / open trip bergaya "Visa Travels", seluruh konten dan tema dari satu file config, dengan form request booking trip yang disimpan ke Neon dan mengirim email lewat Resend.

**Architecture:** Sama dengan template homestay (`sewa-kos-UMKM`). Next.js App Router merender section sesuai `siteConfig.sections`. Config divalidasi zod. Booking memakai Server Action tipis yang memanggil `submitBookingCore` dengan dependency injection (repo DB, pengirim email, waktu).

**Tech Stack:** Next.js, TypeScript strict, Tailwind CSS v4, zod, Drizzle ORM + `@neondatabase/serverless`, Resend + `@react-email/components`, lucide-react, Vitest + Testing Library + jsdom, PGlite, Playwright, tsx.

**Spec:** `docs/superpowers/specs/2026-10-12-travel-template-design.md`

## Global Constraints

- Tidak ada teks, warna, atau gambar khusus klien di komponen; semua dari `siteConfig` (termasuk `siteConfig.copy`).
- `site.config.ts` diekspor dengan `satisfies SiteConfig`.
- Tanggal selalu string `YYYY-MM-DD`; "hari ini" dihitung di `siteConfig.booking.timeZone`.
- Rate limit: maksimal 5 request per email atau per `ip_hash` dalam 1 jam; request ke-6 ditolak.
- Email gagal setelah insert → tetap `{ ok: true }`, error di-log. Insert gagal → `{ ok: false }` tanpa email.
- Tanpa fallback mock saat `DATABASE_URL` / `RESEND_API_KEY` kosong.
- Animasi mati saat `prefers-reduced-motion: reduce`.
- npm, alias `@/*` → `src/*`.

## Review Focus

1. Peserta memilih open trip dengan slot tersisa 2, mengisi 3 peserta → server menolak di field `pax`. Task 3.
2. Peserta memilih open trip lalu mengirim tanggal yang bukan jadwal keberangkatan → ditolak di `departureDate`. Task 3.
3. Private trip dengan `minPax: 2`, peserta mengisi 1 → ditolak di `pax`. Task 3.
4. Submit pukul 23:30 WIB, keberangkatan hari ini, server UTC → diterima. Task 2–3.
5. Filter hero "Explore" dengan lokasi "bali" dan budget "< 1 jt" → hanya trip cocok yang tampil di `#trips`. Task 5–6.
6. Resend error setelah insert → peserta tetap melihat kode booking. Task 8.

---

### Task 1: Scaffold, schema config, contoh config, validator
- Files: `src/config/{font-keys,schema,site.config}.ts`, `scripts/validate-config.ts`, `vitest.config.ts`, `public/images/*`
- Test: schema menerima contoh; menolak id trip duplikat, `categoryId` tidak dikenal, open trip tanpa `departures`, private trip dengan `minPax > maxPax`, WhatsApp bukan `62…`, ikon lucide tidak dikenal, section tidak dikenal. `findMissingImages` menyebut path yang hilang.
- Commit: `feat: scaffold app with typed travel site config and validator`

### Task 2: Utilitas booking (`src/lib/booking.ts`)
- `todayInTimeZone`, `estimateTotal(pricePerPax, pax)`, `generateBookingCode()` → `TR-XXXXX`, `formatPrice`, `formatDate(date, locale)`, `upcomingDepartures(trip, today)` (open trip: departure ≥ today dan `slotsLeft > 0`, urut naik).
- Commit: `feat: add booking date, price and code utilities`

### Task 3: Schema form booking (`src/lib/booking-schema.ts`)
- `normalizePhone`, `buildBookingSchema(config, today)` dengan aturan spec bagian 7.
- Commit: `feat: add trip booking form schema`

### Task 4: Tema, font, layout, SEO (JSON-LD `TravelAgency`)
- Commit: `feat: derive theme, fonts and SEO from site config`

### Task 5: Filter trip (`src/lib/trip-filter.ts`) + provider
- `filterTrips(trips, filter, today)`: `query` cocok ke nama/region/categoryId (case-insensitive), `categoryId`, `budgetId` (min ≤ harga ≤ max), `month` (`YYYY-MM`; open trip punya departure di bulan itu, private trip selalu lolos).
- `TripFilterProvider` / `useTripFilter()`.
- Commit: `feat: add trip filtering`

### Task 6: UI — header, Hero + search bar, Values carousel, Trips grid, section lain, footer
- Registry `SECTION_COMPONENTS`, `renderSections(config)`.
- Test: urutan section, menu mobile Escape, hero Explore mengisi filter, kartu trip memilih trip, filter kosong menampilkan pesan.
- Commit: `feat: add travel sections and config-driven renderer`

### Task 7: Database (Drizzle + Neon) dan repo booking (PGlite di test)
- Commit: `feat: add booking_requests table and repository`

### Task 8: Email dan `submitBookingCore`
- Commit: `feat: add booking submission core and email templates`

### Task 9: Server Action dan form booking
- Commit: `feat: wire booking form to server action`

### Task 10: E2E, CI, README
- Commit: `chore: add e2e test, CI workflow and template README`
