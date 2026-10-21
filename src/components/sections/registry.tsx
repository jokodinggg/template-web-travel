import type { ResolvedSiteConfig, SectionKey } from "@/config/schema";
import { Booking } from "./booking";
import { Faq } from "./faq";
import { Hero } from "./hero";
import { Highlights } from "./highlights";
import { Testimonials } from "./testimonials";
import { Trips } from "./trips";
import { Values } from "./values";

type SectionComponent = (props: { config: ResolvedSiteConfig }) => React.ReactNode;

export const SECTION_COMPONENTS: Record<SectionKey, SectionComponent> = {
  hero: Hero,
  values: Values,
  trips: Trips,
  highlights: Highlights,
  testimonials: Testimonials,
  faq: Faq,
  booking: Booking,
};

/** Merender section sesuai urutan `config.sections`. Section yang tidak tercantum tidak dirender. */
export function renderSections(config: ResolvedSiteConfig): React.ReactNode[] {
  return config.sections.map((key) => {
    const Section = SECTION_COMPONENTS[key];
    return <Section key={key} config={config} />;
  });
}
