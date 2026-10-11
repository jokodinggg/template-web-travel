"use client";

import { BedDouble, Bus, MapPin, Utensils } from "lucide-react";
import Image from "next/image";
import type { ResolvedSiteConfig, Trip } from "@/config/schema";
import { formatDate, formatPrice, upcomingDepartures } from "@/lib/booking";
import { scrollToSection } from "@/lib/scroll";
import { fill } from "@/lib/text";
import { useBookingSelection } from "../booking/booking-selection-provider";
import { buttonClasses } from "../ui/button";

type TripCardProps = Pick<ResolvedSiteConfig, "locale" | "currency"> & {
  trip: Trip;
  today: string | null;
  copy: ResolvedSiteConfig["copy"]["trips"];
};

const pill = "rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur";

export function TripCard({ trip, today, locale, currency, copy }: TripCardProps) {
  const { selectTrip } = useBookingSelection();
  const next = upcomingDepartures(trip, today)[0];
  const soldOut = trip.type === "open" && !next;

  const inclusions = [
    { icon: BedDouble, label: copy.accommodation, value: trip.inclusions.accommodation },
    { icon: Bus, label: copy.transport, value: trip.inclusions.transport },
    { icon: Utensils, label: copy.meals, value: trip.inclusions.meals },
  ];

  return (
    <article className="group flex h-full flex-col rounded-[calc(var(--radius-brand)+0.5rem)] bg-surface p-3 ring-1 ring-line">
      <div className="flex items-start justify-between gap-3 px-2 pt-1">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold tracking-tight">{trip.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{trip.region}</span>
          </p>
        </div>
        {trip.type === "open" && (
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold whitespace-nowrap text-accent-foreground">
            {next ? fill(copy.slotsLeft, { n: next.slotsLeft }) : copy.soldOut}
          </span>
        )}
      </div>

      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[var(--radius-brand)]">
        <Image
          src={trip.image}
          alt={trip.name}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
          <span className={pill}>
            {formatPrice(trip.pricePerPax, locale, currency)}
            <span className="font-normal text-muted">{copy.perPax}</span>
          </span>
          <span className={pill}>
            {trip.type === "open" ? copy.open : copy.private} · {trip.duration}
          </span>
          <span className={pill}>
            {trip.type === "private" ? copy.flexibleDate : next ? formatDate(next.date, locale) : copy.soldOut}
          </span>
        </div>
      </div>

      <p className="mt-3 px-2 text-sm/relaxed text-muted">{trip.summary}</p>

      <dl className="mx-2 mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-xs">
        {inclusions.map(({ icon: Icon, label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="flex items-center gap-1 text-muted">
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            selectTrip(trip.id);
            scrollToSection("booking");
          }}
          className={buttonClasses("primary", "w-full")}
        >
          {soldOut ? copy.soldOut : copy.book}
          <span className="sr-only"> {trip.name}</span>
        </button>
      </div>
    </article>
  );
}
