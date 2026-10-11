import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";
import type { Copy } from "@/config/schema";
import { fill, whatsappLink } from "@/lib/text";
import { type BookingSummary, DetailRows, type EmailTheme, fontFamily } from "./shared";

type GuestConfirmationProps = {
  brandName: string;
  booking: BookingSummary;
  copy: Copy["email"];
  estimateNote: string;
  ownerWhatsapp: string;
  theme: EmailTheme;
};

export function GuestConfirmation({ brandName, booking, copy, estimateNote, ownerWhatsapp, theme }: GuestConfirmationProps) {
  const subject = fill(copy.guestSubject, { code: booking.code });
  const rows: [string, string][] = [
    [copy.code, booking.code],
    [copy.trip, booking.tripName],
    [copy.departure, booking.departure],
    [copy.pax, String(booking.pax)],
    [copy.estimate, booking.estimate],
  ];
  if (booking.notes) rows.push([copy.notes, booking.notes]);

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily, margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 560, padding: 32 }}>
          <Text style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{brandName}</Text>
          <Heading as="h1" style={{ fontSize: 22, margin: "8px 0 0" }}>
            {subject}
          </Heading>
          <Text style={{ fontSize: 15, lineHeight: "24px" }}>
            {fill(copy.guestGreeting, { name: booking.guestName })}
            <br />
            {copy.guestIntro}
          </Text>
          <Text
            style={{
              backgroundColor: theme.accent,
              borderRadius: 8,
              display: "inline-block",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              margin: "8px 0",
              padding: "8px 16px",
            }}
          >
            {booking.code}
          </Text>
          <DetailRows rows={rows} theme={theme} />
          <Text style={{ color: theme.muted, fontSize: 13 }}>{estimateNote}</Text>
          <Text style={{ fontSize: 15, lineHeight: "24px" }}>{copy.guestOutro}</Text>
          <Link href={whatsappLink(ownerWhatsapp)} style={{ color: theme.primary, fontSize: 14, fontWeight: 600 }}>
            +{ownerWhatsapp}
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
