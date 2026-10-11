import { Column, Row, Section, Text } from "@react-email/components";

export type EmailTheme = { primary: string; primaryForeground: string; accent: string; muted: string };

export type BookingSummary = {
  code: string;
  tripName: string;
  departure: string;
  pax: number;
  estimate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
};

export const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function DetailRows({ rows, theme }: { rows: [label: string, value: string][]; theme: EmailTheme }) {
  return (
    <Section style={{ borderTop: "1px solid #e5e5e5", marginTop: 16 }}>
      {rows.map(([label, value]) => (
        <Row key={label} style={{ borderBottom: "1px solid #e5e5e5" }}>
          <Column style={{ padding: "10px 0", width: "40%", color: theme.muted, fontSize: 14, verticalAlign: "top" }}>
            {label}
          </Column>
          <Column style={{ padding: "10px 0", fontSize: 14, fontWeight: 600, verticalAlign: "top" }}>
            <Text style={{ margin: 0, fontSize: 14, whiteSpace: "pre-line" }}>{value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
