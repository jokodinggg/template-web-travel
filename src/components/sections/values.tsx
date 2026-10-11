import { Target } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { ButtonLink } from "../ui/button";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Reveal } from "../ui/reveal";
import { ValuesCarousel } from "./values-carousel";

export function Values({ config }: { config: ResolvedSiteConfig }) {
  const { values } = config;

  return (
    <section id="values" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="rounded-full border border-line px-4 py-2 text-sm font-medium">{values.badge}</span>
          <p className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-semibold tracking-tight">{values.rating.value}</span>
            <span className="text-sm text-muted">{values.rating.label}</span>
          </p>
        </div>

        <Reveal>
          <h2 className="mt-10 font-heading text-[clamp(2.4rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
            <span className="block">{values.headline[0]}</span>
            <span className="block pl-[8%] text-muted sm:pl-[18%]">{values.headline[1]}</span>
          </h2>
        </Reveal>

        <div className="mt-10 flex items-center gap-4 text-muted" aria-hidden>
          <span className="h-px flex-1 border-t border-dashed border-current" />
          <Target className="size-6 text-accent" />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
          <Reveal className="max-w-md">
            <Eyebrow>{values.eyebrow}</Eyebrow>
            <h3 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{values.heading}</h3>
            <p className="mt-4 text-base/relaxed text-muted">{values.body}</p>
            <ButtonLink href={values.cta.href} className="mt-8">
              {values.cta.label}
            </ButtonLink>
          </Reveal>
          <ValuesCarousel slides={values.slides} copy={config.copy.values} />
        </div>
      </Container>
    </section>
  );
}
