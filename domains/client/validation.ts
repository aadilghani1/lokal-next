import { z } from "zod/v4";

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
