import { MessageCircle } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { whatsappLink } from "@/lib/text";
import { BookingForm } from "../booking/booking-form";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Reveal } from "../ui/reveal";

export function Booking({ config }: { config: ResolvedSiteConfig }) {
  const copy = config.copy.booking;

  return (
    <section id="booking" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">{copy.heading}</h2>
          <p className="mt-4 max-w-md text-base/relaxed text-muted">{copy.intro}</p>
          <a
            href={whatsappLink(config.contact.whatsapp, config.copy.footer.whatsappMessage)}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden />
            {copy.whatsappFallback}
          </a>
        </Reveal>
        <BookingForm
          trips={config.trips}
          locale={config.locale}
          currency={config.currency}
          timeZone={config.booking.timeZone}
          maxPaxPerRequest={config.booking.maxPaxPerRequest}
          whatsapp={config.contact.whatsapp}
          copy={copy}
        />
      </Container>
    </section>
  );
}
