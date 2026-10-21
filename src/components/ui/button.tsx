import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "light" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  light: "bg-white text-neutral-950 hover:bg-white/90",
  outline: "border border-line bg-transparent hover:bg-foreground/5",
};

export function buttonClasses(variant: Variant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold",
    "transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = React.ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<"a"> & { variant?: Variant };

export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}
