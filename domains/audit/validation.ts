import { z } from "zod/v4";

export const auditCategorySchema = z.object({
  name: z.string(),
  score: z.number().int().min(0).max(100),
  maxScore: z.number().int().positive(),
  suggestions: z.array(z.string()),
});

export const competitorSchema = z.object({
  rank: z.number().int().positive(),
  name: z.string(),
  url: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  overallScore: z.number(),
  organicTraffic: z.number().nullable(),
  organicKeywords: z.number().nullable(),
  serpRank: z.number().nullable(),
});

export type AuditCategoryInput = z.infer<typeof auditCategorySchema>;
export type CompetitorInput = z.infer<typeof competitorSchema>;
