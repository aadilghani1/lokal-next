import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  url: text("url").notNull(),
  name: text("name"),
  category: text("category"),
  location: text("location"),
  placeId: text("place_id"),
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  tenantSlug: text("tenant_slug").unique(),
  competitorUrls: jsonb("competitor_urls"),
  status: text("status", { enum: ["pending", "active", "error"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const audits = pgTable("audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  overallScore: integer("overall_score").notNull(),
  categories: jsonb("categories").notNull(),
  competitors: jsonb("competitors").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentJobs = pgTable("content_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: text("job_id").notNull().unique(),
  tenantSlug: text("tenant_slug").notNull(),
  businessName: text("business_name"),
  businessCategory: text("business_category"),
  businessLocation: text("business_location"),
  competitors: jsonb("competitors"),
  topicClusters: jsonb("topic_clusters"),
  totalKeywordsFound: integer("total_keywords_found"),
  totalClusters: integer("total_clusters"),
  agentToolCalls: jsonb("agent_tool_calls"),
  agentInputTokens: integer("agent_input_tokens"),
  agentOutputTokens: integer("agent_output_tokens"),
  status: text("status", { enum: ["processing", "completed", "failed"] })
    .notNull()
    .default("processing"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: text("job_id").notNull(),
    contentJobId: uuid("content_job_id").references(() => contentJobs.id),
    profileId: uuid("profile_id").references(() => profiles.id),
    tenantSlug: text("tenant_slug").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    markdownContent: text("markdown_content").notNull(),
    clusterKeywords: jsonb("cluster_keywords"),
    searchVolume: integer("search_volume"),
    keywordDifficulty: integer("keyword_difficulty"),
    status: text("status", { enum: ["draft", "generating", "published", "failed"] })
      .notNull()
      .default("generating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
  },
  (table) => [
    uniqueIndex("articles_tenant_slug_idx").on(table.tenantSlug, table.slug),
  ]
);
