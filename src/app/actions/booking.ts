"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { config } from "@/config";
import { createBookingRepo } from "@/db/booking-repo";
import { getDb } from "@/db/client";
import { createResendSender } from "@/lib/email";
import { type BookingResult, submitBookingCore } from "@/lib/submit-booking";

export async function submitBooking(_previous: BookingResult | null, formData: FormData): Promise<BookingResult> {
  let deps;
  try {
    deps = {
      repo: createBookingRepo(getDb()),
      sendEmail: createResendSender(`${config.brand.name} <${config.booking.fromEmail}>`),
    };
  } catch (error) {
    console.error("[booking] service belum dikonfigurasi:", error);
    return { ok: false, message: config.copy.errors.generic };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? ""}:${ip}`)
    .digest("hex");

  return submitBookingCore(Object.fromEntries(formData), { config, ...deps, now: new Date(), ipHash });
}
