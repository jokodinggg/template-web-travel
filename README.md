# Template Website Travel / Open Trip

Template one-page Next.js untuk travel agent dan operator open trip / private trip. Semua teks, warna, font, foto, dan daftar trip diatur di satu file: `src/config/site.config.ts`. Calon peserta bisa mengirim permintaan booking. Data disimpan di Neon Postgres, lalu email dikirim lewat Resend ke pemilik dan ke peserta.

Spesifikasi lengkap: `docs/superpowers/specs/2026-10-12-travel-template-design.md`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · zod · Drizzle ORM + Neon · Resend + React Email · Vitest + PGlite · Playwright

## Pakai untuk klien baru

1. Duplikat repo ini.
2. Edit `src/config/site.config.ts`: brand, tema, trip, jadwal keberangkatan, kontak, dan semua teks UI (`copy`).
3. Ganti foto di `public/images/`. Path di config harus diawali `/images/`.
4. Cek config dan foto:
   ```bash
   npm run validate-config
   ```
5. Buat project Vercel, tambahkan integrasi Neon dan Resend, lalu tarik env:
   ```bash
   vercel integration add neon
   vercel integration add resend
   vercel env pull .env.local
   ```
6. Buat tabel database:
   ```bash
   npm run db:push
   ```
7. Verifikasi domain pengirim (`booking.fromEmail`) di dashboard Resend.
8. Deploy.

Paket Vercel Hobby tidak boleh dipakai untuk situs klien karena dilarang untuk penggunaan komersial. Pakai Vercel Pro atau Cloudflare (OpenNext).

## Mengatur trip

- **Open trip** (`type: "open"`): jadwal tetap di `departures`. Isi `slotsLeft` per tanggal dan perbarui manual saat slot terisi. Jadwal yang sudah lewat atau slotnya 0 otomatis tidak ditawarkan.
- **Private trip** (`type: "private"`): peserta memilih tanggal sendiri. `minPax` dan `maxPax` membatasi jumlah peserta.
- `categories` dan `budgets` mengisi pilihan filter di hero dan di section trip.
- `sections` menentukan urutan section. Section yang tidak tercantum tidak dirender.

## Environment variables

Lihat `.env.example`.

| Nama | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Connection string Neon |
| `RESEND_API_KEY` | Ya | API key Resend |
| `NEXT_PUBLIC_SITE_URL` | Tidak | URL produksi untuk metadata. Di Vercel otomatis memakai domain produksi |
| `IP_HASH_SALT` | Tidak | Salt untuk hash IP pada rate limit |

Jika `DATABASE_URL` atau `RESEND_API_KEY` kosong, form menampilkan pesan gagal dan log server menjelaskan env yang belum diset. Tidak ada mode mock.

## Perintah

```bash
npm run dev              # dev server
npm test                 # unit, komponen, dan integration test (PGlite, tanpa database sungguhan)
npm run typecheck
npm run lint
npm run validate-config
npm run db:generate      # buat file migrasi setelah mengubah src/db/schema.ts
npm run db:push          # terapkan schema ke database di DATABASE_URL
npm run test:e2e         # butuh DATABASE_URL + RESEND_API_KEY dan browser Playwright
```

`npm run build` otomatis menjalankan `validate-config` lebih dulu.

## Alur booking

1. Peserta memilih trip (tombol **Book** di kartu trip atau dropdown di form), tanggal, dan jumlah peserta.
2. Server Action `submitBooking` memvalidasi ulang semua aturan: trip ada, tanggal belum lewat (zona waktu `booking.timeZone`), tanggal open trip sesuai jadwal dan slot cukup, jumlah peserta private trip dalam batas.
3. Anti-spam: honeypot dan maksimal 5 permintaan per email atau per IP dalam 1 jam.
4. Data disimpan ke tabel `booking_requests` dengan status `pending` dan kode `TR-XXXXX`.
5. Email dikirim ke pemilik dan peserta. Jika email gagal, booking tetap tersimpan dan peserta tetap melihat kodenya.

## CI

`.github/workflows/ci.yml` menjalankan validate-config, lint, typecheck, test, dan build. Job e2e hanya berjalan jika secret `E2E_DATABASE_URL` dan `E2E_RESEND_API_KEY` diset. Pakai branch database Neon khusus untuk e2e.

## Foto contoh

Foto di `public/images/` adalah placeholder dari [Lorem Picsum](https://picsum.photos) (lisensi Unsplash). Ganti dengan foto klien sebelum rilis.
