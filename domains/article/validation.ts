import { z } from "zod/v4";

export const createArticleSchema = z.object({
  jobId: z.string().min(1),
  tenantSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  markdownContent: z.string().min(1),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

export const rankBetterRequestSchema = z.object({
  gbpUrl: z.string().min(1),
  tenantSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

export type RankBetterRequest = z.infer<typeof rankBetterRequestSchema>;
