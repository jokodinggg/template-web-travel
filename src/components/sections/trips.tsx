import type { ResolvedSiteConfig } from "@/config/schema";
import { TripsExplorer } from "../trips/trips-explorer";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Reveal } from "../ui/reveal";

export function Trips({ config }: { config: ResolvedSiteConfig }) {
  const { tripsSection } = config;

  return (
    <section id="trips" className="py-20 sm:py-28">
      <Container>
        <Reveal className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
          <div>
            <Eyebrow>{tripsSection.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-heading text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.04em]">
              {tripsSection.heading}
            </h2>
          </div>
          <p className="text-base/relaxed text-muted lg:pb-3">{tripsSection.intro}</p>
        </Reveal>

        <div className="mt-10">
          <TripsExplorer
            trips={config.trips}
            categories={config.categories}
            budgets={config.budgets}
            locale={config.locale}
            currency={config.currency}
            timeZone={config.booking.timeZone}
            copy={config.copy.trips}
          />
        </div>
      </Container>
    </section>
  );
}
