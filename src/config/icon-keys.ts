// Nama ikon lucide-react yang boleh dipakai di config (mis. `highlights[].icon`).
// Peta ke komponennya ada di `src/components/ui/icon.tsx`.
export const ICON_KEYS = [
  "BadgeCheck",
  "Camera",
  "Compass",
  "HeartHandshake",
  "Headphones",
  "Leaf",
  "Map",
  "MapPin",
  "Mountain",
  "Plane",
  "Route",
  "ShieldCheck",
  "Sparkles",
  "Star",
  "Tent",
  "Ticket",
  "Users",
  "Wallet",
  "Waves",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];
