"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { cn } from "@/lib/cn";

type ValuesCarouselProps = {
  slides: ResolvedSiteConfig["values"]["slides"];
  copy: ResolvedSiteConfig["copy"]["values"];
};

const GAP_PX = 16;

export function ValuesCarousel({ slides, copy }: ValuesCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const updateEdges = () => {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      atStart: track.scrollLeft <= 1,
      atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    // ResizeObserver langsung memanggil callback sekali setelah observe, jadi tombol langsung sinkron.
    const observer = new ResizeObserver(() => {
      setEdges({
        atStart: track.scrollLeft <= 1,
        atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
      });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstSlide = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstSlide) return;
    track.scrollBy({ left: direction * (firstSlide.offsetWidth + GAP_PX) });
  };

  return (
    <div className="min-w-0">
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        tabIndex={0}
        aria-label={copy.slidesLabel}
        className="no-scrollbar flex snap-x snap-mandatory items-end gap-4 overflow-x-auto scroll-smooth rounded-[var(--radius-brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:scroll-auto"
      >
        {slides.map((slide, index) => (
          <li
            key={slide.image}
            className={cn(
              "relative shrink-0 snap-start overflow-hidden rounded-[var(--radius-brand)]",
              index % 2 === 0 ? "h-[24rem] w-[16rem] sm:h-[28rem] sm:w-[19rem]" : "h-[18rem] w-[14rem] sm:h-[21rem] sm:w-[16rem]",
            )}
          >
            <Image src={slide.image} alt={slide.title} fill sizes="(min-width: 640px) 304px, 256px" className="object-cover" />
            <div className="absolute inset-x-3 bottom-3 rounded-[calc(var(--radius-brand)-6px)] bg-black/40 p-3 text-white backdrop-blur-md">
              <p className="font-heading font-semibold">{slide.title}</p>
              <p className="text-xs text-white/80">{slide.caption}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={edges.atStart}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-5 text-sm font-semibold transition hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {copy.prev}
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={edges.atEnd}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
        >
          {copy.next}
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
