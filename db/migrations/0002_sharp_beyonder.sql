CREATE TABLE "content_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" text NOT NULL,
	"tenant_slug" text NOT NULL,
	"business_name" text,
	"business_category" text,
	"business_location" text,
	"competitors" jsonb,
	"topic_clusters" jsonb,
	"total_keywords_found" integer,
	"total_clusters" integer,
	"agent_tool_calls" jsonb,
	"agent_input_tokens" integer,
	"agent_output_tokens" integer,
	"status" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "content_job_id" uuid;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "cluster_keywords" jsonb;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "search_volume" integer;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "keyword_difficulty" integer;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_content_job_id_content_jobs_id_fk" FOREIGN KEY ("content_job_id") REFERENCES "public"."content_jobs"("id") ON DELETE no action ON UPDATE no action;