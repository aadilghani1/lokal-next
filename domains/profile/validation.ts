import { z } from "zod/v4";

const GBP_URL_PATTERNS = [
  /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/place\/.+/,
  /^https:\/\/maps\.app\.goo\.gl\/.+/,
  /^https:\/\/maps\.google\.[a-z.]+\/\?cid=\d+/,
];

export const gbpUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .refine(
    (url) => GBP_URL_PATTERNS.some((pattern) => pattern.test(url)),
    "Please enter a valid Google Business Profile URL"
  );

export const profileSubmissionSchema = z.object({
  url: gbpUrlSchema,
});

export type ProfileSubmissionInput = z.infer<typeof profileSubmissionSchema>;
