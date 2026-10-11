import type { ResolvedSiteConfig } from "@/config/schema";
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
        </Reveal>
      </Container>
    </section>
  );
}
