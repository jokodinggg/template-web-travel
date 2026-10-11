"use client";

import { Search } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import type { TripFilter } from "@/lib/trip-filter";
import { buttonClasses } from "../ui/button";
import { useFilterDraft, useMonthOptions } from "./use-filter-draft";

type FilterBarProps = Pick<ResolvedSiteConfig, "trips" | "categories" | "budgets" | "locale"> & {
  timeZone: string;
  copy: ResolvedSiteConfig["copy"]["trips"];
  initial: TripFilter;
  onApply: (filter: TripFilter) => void;
};

const cell = "flex min-w-0 flex-col gap-1 rounded-[calc(var(--radius-brand)-6px)] bg-background px-4 py-2.5";
const label = "text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted";
const control = "w-full min-w-0 truncate bg-transparent text-sm font-medium outline-none placeholder:text-muted";

export function FilterBar({ trips, categories, budgets, locale, timeZone, copy, initial, onApply }: FilterBarProps) {
  const { draft, update } = useFilterDraft(initial);
  const months = useMonthOptions(trips, locale, timeZone);

  return (
    <form
      role="search"
      aria-label={copy.discover}
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
      className="grid gap-2 rounded-[var(--radius-brand)] bg-surface p-2 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto]"
    >
      <label className={cell}>
        <span className={label}>{copy.destination}</span>
        <span className="flex items-center gap-2">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            type="search"
            className={control}
            placeholder={copy.destinationPlaceholder}
            value={draft.query}
            onChange={(e) => update("query", e.target.value)}
          />
        </span>
      </label>
      <label className={cell}>
        <span className={label}>{copy.category}</span>
        <select className={control} value={draft.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
          <option value="">{copy.categoryAll}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}>{copy.price}</span>
        <select className={control} value={draft.budgetId} onChange={(e) => update("budgetId", e.target.value)}>
          <option value="">{copy.priceAll}</option>
          {budgets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
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
      <button type="submit" className={buttonClasses("primary", "min-h-12 rounded-[calc(var(--radius-brand)-6px)] px-8")}>
        {copy.discover}
      </button>
    </form>
  );
}
