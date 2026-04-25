CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" text NOT NULL,
	"profile_id" uuid,
	"tenant_slug" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"markdown_content" text NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"categories" jsonb NOT NULL,
	"competitors" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"name" text,
	"place_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "articles_tenant_slug_idx" ON "articles" USING btree ("tenant_slug","slug");