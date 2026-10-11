import { cn } from "@/lib/cn";

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-muted", className)}>{children}</p>
  );
}
