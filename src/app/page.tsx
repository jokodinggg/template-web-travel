import { BookingSelectionProvider } from "@/components/booking/booking-selection-provider";
import { Footer, WhatsAppFloat } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { renderSections } from "@/components/sections/registry";
import { TripFilterProvider } from "@/components/trips/trip-filter-provider";
import { config } from "@/config";

export default function Home() {
  return (
    <TripFilterProvider>
      <BookingSelectionProvider>
        <Header brand={config.brand} nav={config.nav} copy={config.copy.header} overHero={config.sections[0] === "hero"} />
        <main className={config.sections[0] === "hero" ? undefined : "pt-20"}>{renderSections(config)}</main>
        <Footer config={config} />
        <WhatsAppFloat config={config} />
      </BookingSelectionProvider>
    </TripFilterProvider>
  );
}
