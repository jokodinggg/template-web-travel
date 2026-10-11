import type { ResolvedSiteConfig } from "@/config/schema";
import { Container } from "../ui/container";
import { Eyebrow } from "../ui/eyebrow";
import { Icon } from "../ui/icon";
import { Reveal } from "../ui/reveal";

export function Highlights({ config }: { config: ResolvedSiteConfig }) {
  const copy = config.copy.highlights;

  return (
    <section id="highlights" className="bg-primary py-20 text-primary-foreground sm:py-28">
      <Container>
        <Reveal>
          <Eyebrow className="text-current opacity-60">{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.heading}
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-brand)] bg-current/15 sm:grid-cols-2 lg:grid-cols-4">
          {config.highlights.map((item) => (
            <li key={item.title} className="bg-primary p-6 sm:p-8">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-6 font-heading text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm/relaxed opacity-70">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
