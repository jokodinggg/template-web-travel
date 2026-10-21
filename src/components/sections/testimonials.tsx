import { Quote } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Reveal } from "../ui/reveal";

export function Testimonials({ config }: { config: ResolvedSiteConfig }) {
  const copy = config.copy.testimonials;

  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">{copy.heading}</h2>
        </Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {config.testimonials.map((item) => (
            <li key={item.author}>
              <figure className="flex h-full flex-col rounded-[var(--radius-brand)] bg-surface p-6 ring-1 ring-line sm:p-8">
                <Quote className="size-7 text-accent" aria-hidden />
                <blockquote className="mt-4 flex-1 text-lg/relaxed">{item.quote}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 text-sm">
                  <span className="font-semibold">{item.author}</span>
                  <span className="text-muted"> · {item.trip}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
