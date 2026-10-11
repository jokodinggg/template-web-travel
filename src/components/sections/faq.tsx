import { Plus } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Reveal } from "../ui/reveal";

export function Faq({ config }: { config: ResolvedSiteConfig }) {
  const copy = config.copy.faq;

  return (
    <section id="faq" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">{copy.heading}</h2>
        </Reveal>
        <div className="divide-y divide-line border-y border-line">
          {config.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-5 shrink-0 transition group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
              </summary>
              <p className="mt-3 pr-9 text-base/relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
