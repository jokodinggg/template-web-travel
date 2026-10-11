import { cn } from "@/lib/cn";

/** Fade-in saat masuk viewport (CSS di `globals.css`, mati saat `prefers-reduced-motion`). */
export function Reveal({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
