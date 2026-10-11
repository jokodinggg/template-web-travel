import Image from "next/image";
import type { ResolvedSiteConfig } from "@/config/schema";
import { HeroSearch } from "../trips/hero-search";
import { Container } from "../ui/container";

export function Hero({ config }: { config: ResolvedSiteConfig }) {
  const { hero } = config;

  return (
    <section id="hero" className="relative isolate flex min-h-svh flex-col overflow-hidden text-white">
      <Image src={hero.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/30 to-black/70" aria-hidden />

      <Container className="flex flex-1 flex-col items-center justify-center pt-24 pb-10 text-center">
        <h1 className="font-heading text-[clamp(5.5rem,24vw,19rem)] leading-[0.82] font-semibold tracking-[-0.05em]">
          {hero.word}
        </h1>
        <p className="mt-6 max-w-xl text-base/relaxed text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)] sm:text-lg/relaxed">{hero.subtitle}</p>
      </Container>

      <Container className="pb-5 sm:pb-10">
        <HeroSearch
          trips={config.trips}
          categories={config.categories}
          budgets={config.budgets}
          locale={config.locale}
          timeZone={config.booking.timeZone}
          copy={config.copy.search}
        />
      </Container>
    </section>
  );
}
