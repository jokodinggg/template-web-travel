import { config } from "@/config";

export default function Home() {
  return <main>{config.brand.name}</main>;
}
