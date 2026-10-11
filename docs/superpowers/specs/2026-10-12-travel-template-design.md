# Template Website Travel / Open Trip — Design Spec

Tanggal: 2026-10-12
Status: Draft
Referensi bisnis: `sewa-kos-UMKM/docs/superpowers/specs/2026-10-12-homestay-template-design.md` (struktur, stack, dan alur booking sama; yang berubah adalah domain: kamar → trip, malam → peserta).

## 1. Tujuan

Membuat template website one-page untuk UMKM travel agent / operator open trip dan private trip. Gaya visual mengacu pada referensi "Visa Travels":

- Hero foto full-screen dengan satu kata judul raksasa di tengah ("Travel"), subtitle pendek, dan bar pencarian di bagian bawah hero (Aktivitas, Lokasi, Tanggal, Budget, tombol "Explore").
- Section nilai: badge "We are …" dan "5K+ People Satisfied", headline besar dua baris dengan baris kedua menjorok, garis putus-putus dengan ikon target, lalu blok nilai di kiri dan carousel foto destinasi di kanan dengan tombol Prev/Next.
- Section trip: label "Popular Destination 2025", judul besar "Pick the Place", teks pendek di kanan, bar filter (Destinasi, Kategori, Harga, Tanggal, tombol "Discover"), lalu grid kartu trip dengan badge sisa slot, foto, harga, tipe trip, tanggal, dan baris akomodasi/transport/makan.

Template dipakai ulang untuk banyak klien. Semua konten dan tema berasal dari satu file konfigurasi TypeScript, sehingga klien baru tidak memerlukan perubahan kode komponen.

### Kriteria sukses

- Developer dapat meluncurkan situs untuk klien baru dalam waktu kurang dari 1 jam: edit config, ganti foto, provision layanan, deploy.
- Calon peserta dapat mengirim permintaan booking trip. Data tersimpan di database, pemilik menerima email notifikasi, dan peserta menerima email konfirmasi berisi kode booking.
- Tidak ada teks, warna, atau gambar khusus klien yang di-hardcode di dalam komponen.

### Di luar scope

Admin dashboard, pengurangan slot otomatis dari database, pembayaran online / DP, multi-bahasa, CMS, halaman detail per trip, dan blog. Sisa slot dan jadwal keberangkatan diatur manual di config oleh pemilik. Arsitektur tidak boleh menghalangi penambahan fitur ini nanti.

## 2. Stack

Sama dengan template homestay:

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- `next/font/google`, `next/image`, `lucide-react`
- zod untuk validasi config dan form
- Neon Postgres + Drizzle ORM untuk penyimpanan booking
- Resend + React Email untuk email transaksional
- Vitest untuk unit dan integration test (PGlite), Playwright untuk e2e
- Hosting: Vercel Pro, atau Cloudflare (OpenNext). Paket Vercel Hobby tidak boleh dipakai untuk situs klien karena dilarang untuk penggunaan komersial.

## 3. Struktur proyek

```
src/
  config/
    site.config.ts       Satu-satunya file yang diedit per klien
    schema.ts            Tipe SiteConfig dan zod schema-nya
    font-keys.ts         Daftar font yang didukung
  app/
    layout.tsx           Font, token tema, metadata, JSON-LD
    page.tsx             Merender section sesuai urutan config.sections
    actions/booking.ts   Server Action submitBooking
  components/
    sections/            Hero, Values, Trips, Highlights, Testimonials,
                         Faq, Booking
    trips/               TripFilterProvider, TripCard, FilterBar
    booking/             BookingSelectionProvider, BookingForm
    ui/                  Button, Container, Eyebrow, Reveal
  db/
    schema.ts            Tabel booking_requests (Drizzle)
    client.ts            Koneksi Neon
    booking-repo.ts      insert, countRecent
  emails/
    OwnerNotification.tsx
    GuestConfirmation.tsx
  lib/
    booking.ts           Tanggal, estimasi harga, generator kode booking
    booking-schema.ts    Zod schema form booking
    trip-filter.ts       Logika filter trip (murni, dites)
    theme.ts, fonts.ts, seo.ts
scripts/
  validate-config.ts     Validasi config dan cek keberadaan file gambar
public/images/           Foto klien
```

## 4. Konfigurasi (`site.config.ts`)

Diekspor dengan `satisfies SiteConfig`. Zod schema yang sama dipakai di `scripts/validate-config.ts` dan saat build.

| Field | Isi |
|---|---|
| `brand` | `name`, `logo` (opsional) |
| `theme` | `primary`, `accent`, `background`, `foreground`, `muted`, `fontHeading`, `fontBody`, `radius` |
| `locale`, `currency` | Contoh `"id-ID"`, `"IDR"` |
| `nav` | Daftar `{ label, href }` |
| `hero` | `word` (judul raksasa), `subtitle`, `image`, `searchCta` |
| `values` | `badge`, `rating` (`{ value, label }`), `headline` (2 baris), `eyebrow`, `heading`, `body`, `cta`, `slides` (`{ image, title, caption }`) |
| `trips` | Daftar trip (lihat di bawah) |
| `tripsSection` | `eyebrow`, `heading`, `intro` |
| `categories` | Daftar `{ id, label }` (mis. Pantai, Gunung, Budaya) |
| `budgets` | Daftar `{ id, label, min, max }` untuk filter harga |
| `highlights` | Daftar `{ icon, title, body }`; `icon` adalah nama ikon `lucide-react` |
| `testimonials` | Daftar `{ quote, author, trip }` |
| `faq` | Daftar `{ q, a }` |
| `contact` | `ownerEmail`, `whatsapp` (62…), `instagram`, `address` |
| `booking` | `fromEmail`, `timeZone` (default `Asia/Jakarta`), `maxPaxPerRequest` |
| `sections` | Urutan section. Section yang tidak tercantum tidak dirender |
| `seo` | `title`, `description`, `ogImage` |
| `copy` | Semua teks UI tetap (label form, filter, pesan sukses) |

Trip:

| Field | Isi |
|---|---|
| `id` | slug `^[a-z0-9-]+$`, unik |
| `name`, `region` | Contoh "Uluwatu", "Badung Regency, Bali" |
| `categoryId` | Harus ada di `categories` |
| `type` | `"open"` (jadwal tetap, gabung peserta lain) atau `"private"` (tanggal diminta peserta) |
| `pricePerPax` | int > 0 |
| `duration` | Teks, mis. "3H2M" |
| `image`, `summary` | |
| `departures` | Hanya `open`: daftar `{ date: "YYYY-MM-DD", slotsLeft: int ≥ 0 }` |
| `minPax`, `maxPax` | Hanya `private`: batas jumlah peserta |
| `inclusions` | `{ accommodation, transport, meals }` |

## 5. Tema

Sama dengan homestay: `lib/theme.ts` mengubah `config.theme` menjadi CSS variables `--brand-*` di `<html>`, Tailwind v4 membacanya lewat `@theme inline`. Font dari peta statis `lib/fonts.ts`, dibatasi `FONT_KEYS`.

## 6. Section

- **Header**: brand + search kecil di kiri, nav di kanan, transparan di atas hero. Di bawah `md` menjadi tombol menu yang membuka sheet (Escape menutup).
- **Hero**: foto `100svh`, kata judul raksasa (`clamp`) di tengah, subtitle. Bar pencarian menempel di bawah: 4 sel (Aktivitas, Lokasi, Tanggal, Budget) berlatar kaca gelap + tombol "Explore" putih. Explore menyetel filter trip lalu menggulir ke `#trips`. Di mobile bar menjadi grid 2 kolom.
- **Values**: badge kiri-atas, headline besar dengan baris kedua menjorok kanan, garis putus-putus dengan ikon target. Blok kiri (eyebrow bernomor, heading, body, tombol "Book a Seat" ke `#booking`), kanan carousel kartu foto ukuran berbeda dengan Prev/Next (keyboard dapat diakses).
- **Trips**: eyebrow, heading raksasa, intro kanan, bar filter (input destinasi, select kategori, select budget, select bulan, tombol Discover), grid kartu 3 kolom. Kartu: nama + region, badge "N Slot left" (open trip, dari departure terdekat), foto, pil harga/tipe/tanggal di atas foto, baris akomodasi/transport/makan, tombol "Book" yang memilih trip di form booking. Pesan kosong jika filter tidak cocok.
- **Highlights**: grid ikon + judul + teks (alasan memilih agen).
- **Testimonials**, **Faq** (details/summary).
- **Booking**: form (bagian 7).
- **Footer**: kontak, sosial, tombol WhatsApp melayang.

Prinsip umum: mobile-first, `next/image` dengan `priority` di hero, animasi fade-in ringan yang mati saat `prefers-reduced-motion`.

## 7. Alur booking

### Form

Field: nama, email, nomor WhatsApp, trip, tanggal keberangkatan, jumlah peserta, catatan (opsional), honeypot. Untuk trip `open`, tanggal dipilih dari `departures` yang masih punya slot dan belum lewat. Untuk trip `private`, tanggal bebas (date input, minimal hari ini). Form menampilkan estimasi `pax × pricePerPax` berlabel "estimasi"; harga final dikonfirmasi pemilik.

### Server Action `submitBooking`

1. Validasi zod di server:
   - `tripId` harus ada di `config.trips`;
   - `departureDate` tidak boleh sebelum hari ini (zona waktu config);
   - trip `open`: `departureDate` harus salah satu `departures[].date`, dan `pax ≤ slotsLeft`;
   - trip `private`: `minPax ≤ pax ≤ maxPax`;
   - `pax` 1..`booking.maxPaxPerRequest`.
2. Anti-spam: honeypot terisi → sukses palsu tanpa simpan. Lebih dari 5 request dari email atau `ip_hash` yang sama dalam 1 jam → tolak.
3. Simpan ke `booking_requests` dengan `status = 'pending'` dan kode unik `TR-XXXXX`.
4. Kirim email ke pemilik (detail + tautan WhatsApp ke peserta) dan ke peserta (ringkasan + kode).
5. Kembalikan `{ ok: true, bookingCode }` atau `{ ok: false, fieldErrors?, message? }`.

### Tabel `booking_requests`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid, PK | default random |
| `code` | text, unique | `TR-7F3K2` |
| `trip_id` | text | mengacu ke `config.trips[].id` |
| `trip_type` | text | `open` / `private`, disalin saat booking |
| `departure_date` | date | |
| `guest_name`, `guest_email`, `guest_phone` | text | |
| `pax` | integer | |
| `notes` | text, nullable | |
| `est_total` | integer | rupiah |
| `status` | text | default `pending` |
| `ip_hash` | text | |
| `created_at` | timestamptz | default now |

Trip tidak disimpan di database karena trip adalah konten.

### Penanganan error

Sama dengan homestay: validasi gagal → error per field; insert gagal → pesan umum + tautan WhatsApp, email tidak dikirim; email gagal setelah insert → tetap sukses dan error di-log; env DB/Resend tidak ada → gagal dengan pesan jelas, tanpa mock.

## 8. SEO

`metadata` dari `config.seo`, OpenGraph image, JSON-LD `TravelAgency` (nama, alamat, telepon, rentang harga dari `trips`).

## 9. Testing

- Unit: schema config, schema form, utilitas tanggal/harga/kode, logika filter trip.
- Integration: `submitBookingCore` dengan PGlite, email di-mock.
- Komponen: renderer section, menu mobile, kartu trip memilih trip, filter, form booking.
- E2E: satu skenario pilih trip → isi form → kode booking tampil.
- `npm run validate-config` di CI dan sebelum build.

## 10. Alur pakai template untuk klien baru

1. Duplikat repo.
2. Edit `src/config/site.config.ts` dan ganti isi `public/images/`.
3. `npm run validate-config`.
4. Buat project Vercel, `vercel integration add` untuk Neon dan Resend, `vercel env pull`.
5. `npm run db:push`.
6. Verifikasi domain pengirim di Resend.
7. Deploy.

## 11. Biaya per klien

Sama dengan homestay: Neon free, Resend free (3.000 email/bulan, 1 domain per team) atau Resend Pro, Vercel Pro atau Cloudflare free, domain dibayar klien.
