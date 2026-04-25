ALTER TABLE "profiles" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "rating" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "review_count" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "competitor_urls" jsonb;