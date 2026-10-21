"use client";

import { ArrowRight } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { scrollToSection } from "@/lib/scroll";
import { filterKey, type TripFilter } from "@/lib/trip-filter";
import { useTripFilter } from "./trip-filter-provider";
import { useFilterDraft, useMonthOptions } from "./use-filter-draft";

type HeroSearchProps = Pick<ResolvedSiteConfig, "trips" | "categories" | "budgets" | "locale"> & {
  timeZone: string;
  copy: ResolvedSiteConfig["copy"]["search"];
};

const cell = "flex min-w-0 flex-col gap-1 px-5 py-3.5 sm:py-4";
const label = "text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/60";
const control =
  "w-full min-w-0 truncate bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/70 [&>option]:text-neutral-950";

export function HeroSearch(props: HeroSearchProps) {
  const { filter, setFilter } = useTripFilter();
  // Remount saat filter diubah dari tempat lain (bar Discover, reset) agar draft ikut sinkron.
  return <HeroSearchForm key={filterKey(filter)} {...props} initial={filter} onApply={setFilter} />;
}

function HeroSearchForm({
  trips,
  categories,
  budgets,
  locale,
  timeZone,
  copy,
  initial,
  onApply,
}: HeroSearchProps & { initial: TripFilter; onApply: (filter: TripFilter) => void }) {
  const { draft, update } = useFilterDraft(initial);
  const months = useMonthOptions(trips, locale, timeZone);

  return (
    <form
      role="search"
      aria-label={copy.explore}
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
        scrollToSection("trips");
      }}
      className="grid grid-cols-2 overflow-hidden rounded-[calc(var(--radius-brand)+0.5rem)] border border-white/15 bg-black/35 shadow-2xl backdrop-blur-xl md:grid-cols-[repeat(4,minmax(0,1fr))_auto] [&>label]:border-white/10 [&>label:nth-child(odd)]:border-r md:[&>label]:border-r [&>label:nth-child(-n+2)]:border-b md:[&>label]:border-b-0"
    >
      <label className={cell}>
        <span className={label}>{copy.activity}</span>
        <select className={control} value={draft.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
          <option value="">{copy.activityAll}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}>{copy.location}</span>
        <input
          type="search"
          className={control}
          placeholder={copy.locationPlaceholder}
          value={draft.query}
          onChange={(e) => update("query", e.target.value)}
        />
      </label>
      <label className={cell}>
        <span className={label}>{copy.date}</span>
        <select className={control} value={draft.month} onChange={(e) => update("month", e.target.value)}>
          <option value="">{copy.dateAny}</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}>{copy.budget}</span>
        <select className={control} value={draft.budgetId} onChange={(e) => update("budgetId", e.target.value)}>
          <option value="">{copy.budgetAny}</option>
          {budgets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <div className="col-span-2 p-2 md:col-span-1">
        <button
          type="submit"
          className="inline-flex h-full min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-brand)] bg-white px-7 text-sm font-semibold text-neutral-950 transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {copy.explore}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
