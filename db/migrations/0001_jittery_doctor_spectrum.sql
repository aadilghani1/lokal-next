ALTER TABLE "profiles" ADD COLUMN "tenant_slug" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenant_slug_unique" UNIQUE("tenant_slug");