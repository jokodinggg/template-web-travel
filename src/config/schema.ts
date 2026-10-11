import { z } from "zod";
import { FONT_KEYS } from "./font-keys";
import { ICON_KEYS } from "./icon-keys";

export const SECTION_KEYS = [
  "hero",
  "values",
  "trips",
  "highlights",
  "testimonials",
  "faq",
  "booking",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

const text = z.string().trim().min(1);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "Harus warna hex 6 digit, mis. #1a2b3c" });
const cssLength = z.string().regex(/^\d+(\.\d+)?(px|rem)$/, { error: "Harus panjang CSS, mis. 16px atau 1rem" });
const imagePath = z
  .string()
  .regex(/^\/images\/[\w\-./]+\.(jpe?g|png|webp|avif)$/i, {
    error: "Harus path gambar di public/images, mis. /images/hero.jpg",
  });
const isoDate = z.iso.date({ error: "Harus tanggal YYYY-MM-DD" });
const slug = z.string().regex(/^[a-z0-9-]+$/, { error: "Hanya huruf kecil, angka, dan tanda minus" });

const linkSchema = z.object({ label: text, href: text });

const timeZone = z
  .string()
  .refine(
    (tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    { error: "Zona waktu IANA tidak dikenal" },
  );

const inclusionsSchema = z.object({
  accommodation: text,
  transport: text,
  meals: text,
});

const tripBase = {
  id: slug,
  name: text,
  region: text,
  categoryId: slug,
  pricePerPax: z.number().int().positive(),
  duration: text,
  image: imagePath,
  summary: text,
  inclusions: inclusionsSchema,
};

const departureSchema = z.object({
  date: isoDate,
  slotsLeft: z.number().int().nonnegative(),
});

const openTripSchema = z.object({
  ...tripBase,
  type: z.literal("open"),
  departures: z.array(departureSchema).min(1, { error: "Open trip wajib punya minimal 1 jadwal keberangkatan" }),
});

const privateTripSchema = z.object({
  ...tripBase,
  type: z.literal("private"),
  minPax: z.number().int().positive(),
  maxPax: z.number().int().positive(),
});

export const tripSchema = z.discriminatedUnion("type", [openTripSchema, privateTripSchema]);

const copySchema = z.object({
  header: z.object({ search: text, menuOpen: text, menuClose: text }),
  search: z.object({
    activity: text,
    activityAll: text,
    location: text,
    locationPlaceholder: text,
    date: text,
    dateAny: text,
    budget: text,
    budgetAny: text,
    explore: text,
  }),
  values: z.object({ prev: text, next: text, slidesLabel: text }),
  trips: z.object({
    destination: text,
    destinationPlaceholder: text,
    category: text,
    categoryAll: text,
    price: text,
    priceAll: text,
    date: text,
    dateAny: text,
    discover: text,
    empty: text,
    reset: text,
    slotsLeft: text,
    soldOut: text,
    perPax: text,
    open: text,
    private: text,
    flexibleDate: text,
    accommodation: text,
    transport: text,
    meals: text,
    book: text,
  }),
  highlights: z.object({ eyebrow: text, heading: text }),
  testimonials: z.object({ eyebrow: text, heading: text }),
  faq: z.object({ eyebrow: text, heading: text }),
  booking: z.object({
    eyebrow: text,
    heading: text,
    intro: text,
    name: text,
    email: text,
    phone: text,
    phoneHint: text,
    trip: text,
    tripPlaceholder: text,
    departure: text,
    departurePlaceholder: text,
    departureOption: text,
    noDepartures: text,
    pax: text,
    notes: text,
    notesPlaceholder: text,
    estimate: text,
    estimateNote: text,
    submit: text,
    submitting: text,
    successTitle: text,
    successBody: text,
    newRequest: text,
    whatsappFallback: text,
  }),
  errors: z.object({
    name: text,
    email: text,
    phone: text,
    unknownTrip: text,
    date: text,
    pastDate: text,
    notADeparture: text,
    departureFull: text,
    notEnoughSlots: text,
    paxRange: text,
    paxMax: text,
    notes: text,
    rateLimited: text,
    generic: text,
  }),
  email: z.object({
    ownerSubject: text,
    ownerIntro: text,
    chatGuest: text,
    guestSubject: text,
    guestGreeting: text,
    guestIntro: text,
    guestOutro: text,
    code: text,
    trip: text,
    departure: text,
    pax: text,
    estimate: text,
    name: text,
    emailLabel: text,
    phone: text,
    notes: text,
  }),
  footer: z.object({
    contact: text,
    follow: text,
    rights: text,
    whatsapp: text,
    whatsappMessage: text,
  }),
});

export const siteConfigSchema = z
  .object({
    brand: z.object({ name: text, logo: imagePath.optional() }),
    theme: z.object({
      primary: hexColor,
      accent: hexColor,
      background: hexColor,
      foreground: hexColor,
      muted: hexColor,
      fontHeading: z.enum(FONT_KEYS),
      fontBody: z.enum(FONT_KEYS),
      radius: cssLength,
    }),
    locale: text,
    currency: z.string().regex(/^[A-Z]{3}$/),
    nav: z.array(linkSchema).min(1),
    hero: z.object({ word: text, subtitle: text, image: imagePath }),
    values: z.object({
      badge: text,
      rating: z.object({ value: text, label: text }),
      headline: z.tuple([text, text]),
      eyebrow: text,
      heading: text,
      body: text,
      cta: linkSchema,
      slides: z.array(z.object({ image: imagePath, title: text, caption: text })).min(1),
    }),
    tripsSection: z.object({ eyebrow: text, heading: text, intro: text }),
    categories: z.array(z.object({ id: slug, label: text })).min(1),
    budgets: z.array(
      z.object({
        id: slug,
        label: text,
        min: z.number().int().nonnegative(),
        max: z.number().int().positive().optional(),
      }),
    ),
    trips: z.array(tripSchema).min(1),
    highlights: z.array(z.object({ icon: z.enum(ICON_KEYS), title: text, body: text })),
    testimonials: z.array(z.object({ quote: text, author: text, trip: text })),
    faq: z.array(z.object({ q: text, a: text })),
    contact: z.object({
      ownerEmail: z.email(),
      whatsapp: z.string().regex(/^62\d{8,13}$/, { error: "Nomor WhatsApp harus format 62…, tanpa + atau spasi" }),
      instagram: z.string().regex(/^[A-Za-z0-9._]+$/, { error: "Username Instagram tanpa @" }).optional(),
      address: text,
    }),
    booking: z.object({
      fromEmail: z.email(),
      timeZone: timeZone.default("Asia/Jakarta"),
      maxPaxPerRequest: z.number().int().positive(),
    }),
    sections: z.array(z.enum(SECTION_KEYS)).min(1),
    seo: z.object({ title: text, description: text, ogImage: imagePath }),
    copy: copySchema,
  })
  .superRefine((config, ctx) => {
    const issue = (path: PropertyKey[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });

    const findDuplicates = (values: string[]) =>
      values.filter((value, index) => values.indexOf(value) !== index);

    for (const id of new Set(findDuplicates(config.trips.map((t) => t.id)))) {
      issue(["trips"], `ID trip duplikat: ${id}`);
    }
    for (const id of new Set(findDuplicates(config.categories.map((c) => c.id)))) {
      issue(["categories"], `ID kategori duplikat: ${id}`);
    }
    for (const id of new Set(findDuplicates(config.budgets.map((b) => b.id)))) {
      issue(["budgets"], `ID budget duplikat: ${id}`);
    }
    for (const key of new Set(findDuplicates(config.sections))) {
      issue(["sections"], `Section duplikat: ${key}`);
    }

    const categoryIds = new Set(config.categories.map((c) => c.id));
    config.trips.forEach((trip, i) => {
      if (!categoryIds.has(trip.categoryId)) {
        issue(["trips", i, "categoryId"], `Kategori tidak dikenal: ${trip.categoryId}`);
      }
      if (trip.type === "private" && trip.minPax > trip.maxPax) {
        issue(["trips", i, "minPax"], "minPax tidak boleh lebih besar dari maxPax");
      }
      if (trip.type === "open") {
        for (const date of new Set(findDuplicates(trip.departures.map((d) => d.date)))) {
          issue(["trips", i, "departures"], `Tanggal keberangkatan duplikat: ${date}`);
        }
      }
    });

    config.budgets.forEach((budget, i) => {
      if (budget.max !== undefined && budget.min > budget.max) {
        issue(["budgets", i, "min"], "min tidak boleh lebih besar dari max");
      }
    });
  });

/** Bentuk config yang ditulis di `site.config.ts`. */
export type SiteConfig = z.input<typeof siteConfigSchema>;
/** Bentuk config setelah divalidasi dan diberi default. */
export type ResolvedSiteConfig = z.output<typeof siteConfigSchema>;
export type Trip = ResolvedSiteConfig["trips"][number];
export type OpenTrip = Extract<Trip, { type: "open" }>;
export type PrivateTrip = Extract<Trip, { type: "private" }>;
export type Departure = OpenTrip["departures"][number];
export type Category = ResolvedSiteConfig["categories"][number];
export type Budget = ResolvedSiteConfig["budgets"][number];
export type Copy = ResolvedSiteConfig["copy"];
