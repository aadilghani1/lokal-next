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
  placeId: text("place_id"),
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

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: text("job_id").notNull(),
    profileId: uuid("profile_id").references(() => profiles.id),
    tenantSlug: text("tenant_slug").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    markdownContent: text("markdown_content").notNull(),
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
