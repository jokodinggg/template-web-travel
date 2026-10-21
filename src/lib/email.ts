import "server-only";
import { render } from "@react-email/components";
import { Resend } from "resend";
import type { EmailMessage } from "./submit-booking";

/** Pengirim email lewat Resend. Gagal dengan pesan jelas jika `RESEND_API_KEY` belum diset; tidak ada fallback mock. */
export function createResendSender(from: string): (message: EmailMessage) => Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY belum diset. Tambahkan integrasi Resend di Vercel lalu jalankan `vercel env pull`.",
    );
  }
  const resend = new Resend(apiKey);

  return async ({ to, subject, replyTo, react }) => {
    const [html, text] = await Promise.all([render(react), render(react, { plainText: true })]);
    const { error } = await resend.emails.send({ from, to, subject, replyTo, html, text });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
  };
}
