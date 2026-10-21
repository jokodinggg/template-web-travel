import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { ResolvedSiteConfig } from "@/config/schema";
import { fill, whatsappLink } from "@/lib/text";
import { Container } from "../ui/container";
import { InstagramIcon } from "../ui/social-icons";

export function Footer({ config }: { config: ResolvedSiteConfig }) {
  const { contact, brand } = config;
  const copy = config.copy.footer;
  const linkClass = "inline-flex items-center gap-2 opacity-75 transition hover:opacity-100";

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-heading text-3xl font-bold tracking-tight">{brand.name}</p>
          <p className="mt-4 flex max-w-sm items-start gap-2 text-sm/relaxed opacity-75">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {contact.address}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">{copy.contact}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={whatsappLink(contact.whatsapp, copy.whatsappMessage)} className={linkClass}>
                <MessageCircle className="size-4" aria-hidden />+{contact.whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.ownerEmail}`} className={linkClass}>
                <Mail className="size-4" aria-hidden />
                {contact.ownerEmail}
              </a>
            </li>
          </ul>
        </div>

        {contact.instagram && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">{copy.follow}</h2>
            <a href={`https://instagram.com/${contact.instagram}`} className={`${linkClass} mt-4 text-sm`} rel="noopener">
              <InstagramIcon className="size-4" />@{contact.instagram}
            </a>
          </div>
        )}
      </Container>
      <Container className="border-t border-current/15 py-6 text-xs opacity-60">
        {fill(copy.rights, { brand: brand.name })}
      </Container>
    </footer>
  );
}

export function WhatsAppFloat({ config }: { config: ResolvedSiteConfig }) {
  const copy = config.copy.footer;
  return (
    <a
      href={whatsappLink(config.contact.whatsapp, copy.whatsappMessage)}
      aria-label={copy.whatsapp}
      className="fixed right-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
