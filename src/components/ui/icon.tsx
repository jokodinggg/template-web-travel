import {
  BadgeCheck,
  Camera,
  Compass,
  Headphones,
  HeartHandshake,
  Leaf,
  type LucideIcon,
  Map,
  MapPin,
  Mountain,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Tent,
  Ticket,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
import type { IconKey } from "@/config/icon-keys";

export const ICONS = {
  BadgeCheck,
  Camera,
  Compass,
  HeartHandshake,
  Headphones,
  Leaf,
  Map,
  MapPin,
  Mountain,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Tent,
  Ticket,
  Users,
  Wallet,
  Waves,
} satisfies Record<IconKey, LucideIcon>;

export function Icon({ name, className }: { name: IconKey; className?: string }) {
  const Component = ICONS[name];
  return <Component className={className} aria-hidden />;
}
