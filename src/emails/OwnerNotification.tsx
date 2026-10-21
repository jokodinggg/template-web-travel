import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { Copy } from "@/config/schema";
import { fill, whatsappLink } from "@/lib/text";
import { type BookingSummary, DetailRows, type EmailTheme, fontFamily } from "./shared";

type OwnerNotificationProps = {
  brandName: string;
  booking: BookingSummary;
  copy: Copy["email"];
  theme: EmailTheme;
};

export function OwnerNotification({ brandName, booking, copy, theme }: OwnerNotificationProps) {
  const subject = fill(copy.ownerSubject, { code: booking.code, trip: booking.tripName });
  const rows: [string, string][] = [
    [copy.code, booking.code],
    [copy.trip, booking.tripName],
    [copy.departure, booking.departure],
    [copy.pax, String(booking.pax)],
    [copy.estimate, booking.estimate],
    [copy.name, booking.guestName],
    [copy.emailLabel, booking.guestEmail],
    [copy.phone, `+${booking.guestPhone}`],
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
          <Text style={{ fontSize: 15, lineHeight: "24px" }}>{copy.ownerIntro}</Text>
          <DetailRows rows={rows} theme={theme} />
          <Button
            href={whatsappLink(booking.guestPhone, `${booking.guestName} — ${booking.code}`)}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 999,
              color: theme.primaryForeground,
              display: "inline-block",
              fontSize: 14,
              fontWeight: 600,
              marginTop: 24,
              padding: "12px 24px",
            }}
          >
            {copy.chatGuest}
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
