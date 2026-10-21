// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingSelectionProvider, useBookingSelection } from "@/components/booking/booking-selection-provider";
import { Header } from "@/components/layout/header";
import { renderSections } from "@/components/sections/registry";
import { HeroSearch } from "@/components/trips/hero-search";
import { TripFilterProvider } from "@/components/trips/trip-filter-provider";
import { TripsExplorer } from "@/components/trips/trips-explorer";
import { makeConfig } from "../fixtures";

vi.mock("@/app/actions/booking", () => ({ submitBooking: vi.fn() }));

const config = makeConfig();

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TripFilterProvider>
      <BookingSelectionProvider>{children}</BookingSelectionProvider>
    </TripFilterProvider>
  );
}

function SelectedTrip() {
  return <span data-testid="selected">{useBookingSelection().selectedTripId}</span>;
}

function renderExplorer() {
  const tripsProps = {
    trips: config.trips,
    categories: config.categories,
    budgets: config.budgets,
    locale: config.locale,
    timeZone: config.booking.timeZone,
  };
  return render(
    <Providers>
      <HeroSearch {...tripsProps} copy={config.copy.search} />
      <TripsExplorer {...tripsProps} currency={config.currency} copy={config.copy.trips} />
      <SelectedTrip />
    </Providers>,
  );
}

const cardTitles = () => screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("renderSections", () => {
  it("renders only the configured sections, in order", () => {
    const { container } = render(
      <Providers>{renderSections(makeConfig({ sections: ["faq", "highlights", "testimonials"] }))}</Providers>,
    );
    expect([...container.querySelectorAll("section")].map((s) => s.id)).toEqual(["faq", "highlights", "testimonials"]);
  });

  it("renders every section of the example config", () => {
    const { container } = render(<Providers>{renderSections(config)}</Providers>);
    expect([...container.querySelectorAll("section")].map((s) => s.id)).toEqual(config.sections);
  });
});

describe("Header", () => {
  it("opens the mobile menu and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<Header brand={config.brand} nav={config.nav} copy={config.copy.header} overHero />);

    const openButton = screen.getByRole("button", { name: config.copy.header.menuOpen });
    await user.click(openButton);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByRole("link")).toHaveLength(config.nav.length);
    expect(screen.getByRole("button", { name: config.copy.header.menuClose })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });
});

describe("trip search and cards", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-12T03:00:00Z") });
  });

  it("applies the hero search to the trip grid on Explore", async () => {
    const user = userEvent.setup();
    renderExplorer();
    expect(cardTitles()).toEqual(["Uluwatu", "Nusa Penida", "Bromo Sunrise", "Jogja Heritage"]);

    const hero = screen.getByRole("search", { name: config.copy.search.explore });
    await user.type(within(hero).getByRole("searchbox"), "bali");
    await user.selectOptions(within(hero).getByRole("combobox", { name: config.copy.search.budget }), "hemat");
    await user.click(within(hero).getByRole("button", { name: config.copy.search.explore }));

    expect(cardTitles()).toEqual(["Uluwatu"]);
    // Bar filter di section trip ikut menampilkan filter yang aktif.
    const bar = screen.getByRole("search", { name: config.copy.trips.discover });
    expect(within(bar).getByRole("searchbox")).toHaveValue("bali");
  });

  it("shows an empty message with a reset button when nothing matches", async () => {
    const user = userEvent.setup();
    renderExplorer();

    const bar = screen.getByRole("search", { name: config.copy.trips.discover });
    await user.type(within(bar).getByRole("searchbox"), "atlantis");
    await user.click(within(bar).getByRole("button", { name: config.copy.trips.discover }));

    expect(screen.getByRole("status")).toHaveTextContent(config.copy.trips.empty);
    expect(cardTitles()).toEqual([]);

    await user.click(screen.getByRole("button", { name: config.copy.trips.reset }));
    expect(cardTitles()).toHaveLength(4);
  });

  it("selects the trip for booking when Book is clicked", async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole("button", { name: `${config.copy.trips.book} Bromo Sunrise` }));
    expect(screen.getByTestId("selected")).toHaveTextContent("bromo");
  });

  it("shows slots left from the nearest bookable departure", () => {
    renderExplorer();
    const card = screen.getByRole("heading", { name: "Uluwatu" }).closest("article")!;
    expect(card).toHaveTextContent("5 slot tersisa");
  });
});
