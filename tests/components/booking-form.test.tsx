// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking/booking-form";
import { BookingSelectionProvider } from "@/components/booking/booking-selection-provider";
import { TripCard } from "@/components/trips/trip-card";
import type { BookingResult } from "@/lib/submit-booking";
import { makeConfig } from "../fixtures";

const submitBooking = vi.hoisted(() => vi.fn<(prev: unknown, formData: FormData) => Promise<BookingResult>>());
vi.mock("@/app/actions/booking", () => ({ submitBooking }));

const config = makeConfig();
const copy = config.copy.booking;

function renderForm() {
  return render(
    <BookingSelectionProvider>
      <TripCard
        trip={config.trips[0]}
        today={null}
        locale={config.locale}
        currency={config.currency}
        copy={config.copy.trips}
      />
      <BookingForm
        trips={config.trips}
        locale={config.locale}
        currency={config.currency}
        timeZone="UTC"
        maxPaxPerRequest={config.booking.maxPaxPerRequest}
        whatsapp={config.contact.whatsapp}
        copy={copy}
      />
    </BookingSelectionProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(copy.trip), "bali-mahal");
  await user.selectOptions(screen.getByLabelText(copy.departure), "2026-12-05");
  await user.clear(screen.getByLabelText(copy.pax));
  await user.type(screen.getByLabelText(copy.pax), "2");
  await user.type(screen.getByLabelText(copy.name), "Rani Putri");
  await user.type(screen.getByLabelText(copy.email), "rani@example.com");
  await user.type(screen.getByLabelText(copy.phone), "081234567890");
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-12T03:00:00Z") });
  submitBooking.mockReset();
});

describe("BookingForm", () => {
  it("preselects the trip chosen from a trip card", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Uluwatu/ }));

    expect(screen.getByLabelText(copy.trip)).toHaveValue("bali-open");
    const departures = within(screen.getByLabelText(copy.departure)).getAllByRole("option");
    // Jadwal penuh (21 Nov) tidak ditawarkan.
    expect(departures.map((o) => o.getAttribute("value"))).toEqual(["", "2026-10-12", "2026-11-07", "2026-12-12"]);
  });

  it("shows a live estimate of pax × price", async () => {
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);

    expect(screen.getByText(copy.estimate).parentElement).toHaveTextContent(/Rp\s5\.000\.000/);
  });

  it("uses a free date input for private trips", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.selectOptions(screen.getByLabelText(copy.trip), "jogja");

    const date = screen.getByLabelText(copy.departure);
    expect(date).toHaveAttribute("type", "date");
    expect(date).toHaveAttribute("min", "2026-10-12");
    expect(screen.getByLabelText(copy.pax)).toHaveAttribute("min", "2");
  });

  it("submits the form and shows the booking code", async () => {
    submitBooking.mockResolvedValue({ ok: true, bookingCode: "TR-K7M2P" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText("TR-K7M2P", { selector: "p.tracking-\\[0\\.2em\\]" })).toBeInTheDocument();
    const formData = submitBooking.mock.calls[0][1];
    expect(Object.fromEntries(formData)).toMatchObject({
      tripId: "bali-mahal",
      departureDate: "2026-12-05",
      pax: "2",
      name: "Rani Putri",
      email: "rani@example.com",
      phone: "081234567890",
      website: "",
    });
  });

  it("shows server field errors next to their field and keeps the input", async () => {
    submitBooking.mockResolvedValue({ ok: false, fieldErrors: { pax: "Sisa slot hanya 2" } });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    const pax = screen.getByLabelText(copy.pax);
    expect(await screen.findByText("Sisa slot hanya 2")).toBeInTheDocument();
    expect(pax).toHaveAttribute("aria-invalid", "true");
    expect(pax).toHaveAccessibleDescription("Sisa slot hanya 2");
    expect(screen.getByLabelText(copy.name)).toHaveValue("Rani Putri");
  });

  it("shows a general error with a WhatsApp fallback", async () => {
    submitBooking.mockResolvedValue({ ok: false, message: config.copy.errors.generic });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(config.copy.errors.generic);
    expect(within(alert).getByRole("link")).toHaveAttribute("href", `https://wa.me/${config.contact.whatsapp}`);
  });
});
