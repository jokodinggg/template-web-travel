CREATE TABLE "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"trip_id" text NOT NULL,
	"trip_type" text NOT NULL,
	"departure_date" date NOT NULL,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text NOT NULL,
	"pax" integer NOT NULL,
	"notes" text,
	"est_total" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_requests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "booking_requests_email_created_idx" ON "booking_requests" USING btree ("guest_email","created_at");--> statement-breakpoint
CREATE INDEX "booking_requests_ip_created_idx" ON "booking_requests" USING btree ("ip_hash","created_at");