"use client";

import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { cn } from "@/lib/cn";
import { Container } from "../ui/container";

type HeaderProps = {
  brand: ResolvedSiteConfig["brand"];
  nav: ResolvedSiteConfig["nav"];
  copy: ResolvedSiteConfig["copy"]["header"];
  /** True jika section pertama adalah hero foto, sehingga header transparan di atasnya. */
  overHero: boolean;
};

export function Header({ brand, nav, copy, overHero }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      menuButton?.focus();
    };
  }, [menuOpen]);

  const transparent = overHero && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        transparent ? "text-white" : "border-b border-line bg-background/90 text-foreground backdrop-blur-md",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <div className="flex items-center gap-4">
          <a href="#top" className="font-heading text-lg font-bold tracking-tight sm:text-xl">
            {brand.name}
          </a>
          <a
            href="#trips"
            className={cn(
              "hidden items-center gap-2 rounded-full border px-4 py-2 text-sm transition sm:inline-flex",
              transparent ? "border-white/30 hover:bg-white/10" : "border-line hover:bg-foreground/5",
            )}
          >
            <Search className="size-4" aria-hidden />
            {copy.search}
          </a>
        </div>

        <nav aria-label={brand.name} className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="opacity-85 transition hover:opacity-100">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full md:hidden"
          aria-label={copy.menuOpen}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-6" aria-hidden />
        </button>
      </Container>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={brand.name}
          className="fixed inset-0 z-50 flex flex-col bg-background text-foreground md:hidden"
        >
          <Container className="flex h-16 items-center justify-between">
            <span className="font-heading text-lg font-bold tracking-tight">{brand.name}</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full"
              aria-label={copy.menuClose}
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-6" aria-hidden />
            </button>
          </Container>
          <nav aria-label={brand.name} className="flex-1 overflow-y-auto">
            <Container>
              <ul className="divide-y divide-line border-y border-line">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block py-5 font-heading text-2xl font-semibold"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </nav>
        </div>
      )}
    </header>
  );
}
