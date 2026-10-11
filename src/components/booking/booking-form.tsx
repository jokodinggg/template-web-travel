"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitBooking } from "@/app/actions/booking";
import type { ResolvedSiteConfig } from "@/config/schema";
import { estimateTotal, formatDate, formatPrice, upcomingDepartures } from "@/lib/booking";
import type { BookingField } from "@/lib/booking-schema";
import { cn } from "@/lib/cn";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { fill, whatsappLink } from "@/lib/text";
import { useToday } from "@/lib/use-today";
import { Button, ButtonLink } from "../ui/button";
import { useBookingSelection } from "./booking-selection-provider";

type BookingFormProps = Pick<ResolvedSiteConfig, "trips" | "locale" | "currency"> & {
  timeZone: string;
  maxPaxPerRequest: number;
  whatsapp: string;
  copy: ResolvedSiteConfig["copy"]["booking"];
};

export function BookingForm(props: BookingFormProps) {
  // Remount setelah sukses agar state action dan field kembali kosong.
  const [formKey, setFormKey] = useState(0);
  return <BookingFormInner key={formKey} {...props} onReset={() => setFormKey((k) => k + 1)} />;
}

const fieldClass =
  "mt-2 block w-full rounded-[calc(var(--radius-brand)-6px)] border border-line bg-background px-4 py-3 text-base outline-none transition focus:border-foreground disabled:opacity-60 aria-invalid:border-red-600";

function BookingFormInner({
  trips,
  locale,
  currency,
  timeZone,
  maxPaxPerRequest,
  whatsapp,
  copy,
  onReset,
}: BookingFormProps & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitBooking, null);
  const { selectedTripId, selectTrip } = useBookingSelection();
  const today = useToday(timeZone);
  const id = useId();
  const successRef = useRef<HTMLHeadingElement>(null);

  const [values, setValues] = useState({ name: "", email: "", phone: "", pax: "1", notes: "" });
  const [departure, setDeparture] = useState({ tripId: "", date: "" });

  const trip = trips.find((t) => t.id === selectedTripId);
  const departureDate = departure.tripId === selectedTripId ? departure.date : "";
  const departures = trip ? upcomingDepartures(trip, today) : [];
  const chosenDeparture = departures.find((d) => d.date === departureDate);
  const paxNumber = Number(values.pax);

  const minPax = trip?.type === "private" ? trip.minPax : 1;
  const maxPax = Math.min(
    maxPaxPerRequest,
    trip?.type === "private" ? trip.maxPax : (chosenDeparture?.slotsLeft ?? maxPaxPerRequest),
  );

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const errorId = (field: BookingField) => `${id}-${field}-error`;
  const fieldProps = (field: BookingField) => ({
    id: `${id}-${field}`,
    name: field,
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? errorId(field) : undefined,
  });
  const update = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div className="rounded-[var(--radius-brand)] bg-surface p-6 ring-1 ring-line sm:p-10" role="status">
        <CheckCircle2 className="size-10 text-accent" aria-hidden />
        <h3 ref={successRef} tabIndex={-1} className="mt-4 font-heading text-2xl font-semibold outline-none">
          {copy.successTitle}
        </h3>
        <p className="mt-3 text-base/relaxed text-muted">{fill(copy.successBody, { code: state.bookingCode })}</p>
        <p className="mt-6 inline-block rounded-[calc(var(--radius-brand)-6px)] bg-accent px-5 py-3 font-heading text-2xl font-bold tracking-[0.2em] text-accent-foreground">
          {state.bookingCode}
        </p>
        <div className="mt-8">
          <Button variant="outline" onClick={onReset}>
            {copy.newRequest}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[var(--radius-brand)] bg-surface p-5 ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-tripId`} className="text-sm font-medium">
            {copy.trip}
          </label>
          <select
            {...fieldProps("tripId")}
            required
            className={fieldClass}
            value={selectedTripId}
            onChange={(event) => selectTrip(event.target.value)}
          >
            <option value="">{copy.tripPlaceholder}</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {formatPrice(t.pricePerPax, locale, currency)}
              </option>
            ))}
          </select>
          <FieldError id={errorId("tripId")} message={fieldErrors.tripId} />
        </div>

        <div>
          <label htmlFor={`${id}-departureDate`} className="text-sm font-medium">
            {copy.departure}
          </label>
          {trip?.type === "private" ? (
            <input
              {...fieldProps("departureDate")}
              type="date"
              required
              min={today ?? undefined}
              className={fieldClass}
              value={departureDate}
              onChange={(event) => setDeparture({ tripId: selectedTripId, date: event.target.value })}
            />
          ) : (
            <select
              {...fieldProps("departureDate")}
              required
              disabled={!trip || departures.length === 0}
              className={fieldClass}
              value={departureDate}
              onChange={(event) => setDeparture({ tripId: selectedTripId, date: event.target.value })}
            >
              <option value="">{copy.departurePlaceholder}</option>
              {departures.map((d) => (
                <option key={d.date} value={d.date}>
                  {fill(copy.departureOption, { date: formatDate(d.date, locale), n: d.slotsLeft })}
                </option>
              ))}
            </select>
          )}
          {trip?.type === "open" && departures.length === 0 && (
            <p className="mt-1.5 text-sm text-muted">{copy.noDepartures}</p>
          )}
          <FieldError id={errorId("departureDate")} message={fieldErrors.departureDate} />
        </div>

        <div>
          <label htmlFor={`${id}-pax`} className="text-sm font-medium">
            {copy.pax}
          </label>
          <input
            {...fieldProps("pax")}
            type="number"
            inputMode="numeric"
            required
            min={minPax}
            max={maxPax}
            className={fieldClass}
            value={values.pax}
            onChange={update("pax")}
          />
          <FieldError id={errorId("pax")} message={fieldErrors.pax} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            {copy.name}
          </label>
          <input
            {...fieldProps("name")}
            required
            autoComplete="name"
            className={fieldClass}
            value={values.name}
            onChange={update("name")}
          />
          <FieldError id={errorId("name")} message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor={`${id}-email`} className="text-sm font-medium">
            {copy.email}
          </label>
          <input
            {...fieldProps("email")}
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            value={values.email}
            onChange={update("email")}
          />
          <FieldError id={errorId("email")} message={fieldErrors.email} />
        </div>

        <div>
          <label htmlFor={`${id}-phone`} className="text-sm font-medium">
            {copy.phone}
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            required
            autoComplete="tel"
            placeholder={copy.phoneHint}
            className={fieldClass}
            value={values.phone}
            onChange={update("phone")}
          />
          <FieldError id={errorId("phone")} message={fieldErrors.phone} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-notes`} className="text-sm font-medium">
            {copy.notes}
          </label>
          <textarea
            {...fieldProps("notes")}
            rows={3}
            maxLength={1000}
            placeholder={copy.notesPlaceholder}
            className={cn(fieldClass, "resize-y")}
            value={values.notes}
            onChange={update("notes")}
          />
          <FieldError id={errorId("notes")} message={fieldErrors.notes} />
        </div>
      </div>

      {/* Honeypot: tidak terlihat oleh manusia, sering diisi bot. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div aria-live="polite">
          <p className="text-sm text-muted">{copy.estimate}</p>
          <p className="font-heading text-2xl font-semibold">
            {trip && paxNumber > 0 ? formatPrice(estimateTotal(trip.pricePerPax, paxNumber), locale, currency) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">{copy.estimateNote}</p>
        </div>
        <Button type="submit" disabled={pending} className="sm:min-w-56">
          {pending ? copy.submitting : copy.submit}
        </Button>
      </div>

      {state && !state.ok && state.message && (
        <div role="alert" className="mt-5 rounded-[calc(var(--radius-brand)-6px)] bg-red-50 p-4 text-sm text-red-800">
          <p>{state.message}</p>
          <ButtonLink href={whatsappLink(whatsapp)} variant="outline" className="mt-3 border-red-200 bg-white">
            <MessageCircle className="size-4" aria-hidden />
            {copy.whatsappFallback}
          </ButtonLink>
        </div>
      )}
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  );
}
