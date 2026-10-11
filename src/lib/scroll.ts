/** Menggulir ke section. Kecepatan mengikuti `scroll-behavior` di CSS (mati saat reduced motion). */
export function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView?.({ block: "start" });
}
