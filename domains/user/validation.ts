import { z } from "zod/v4";

export const clerkWebhookEventSchema = z.object({
  data: z.object({
    id: z.string(),
    email_addresses: z.array(
      z.object({ email_address: z.string().email() })
    ),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    image_url: z.string().nullable(),
  }),
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
});

export type ClerkWebhookEvent = z.infer<typeof clerkWebhookEventSchema>;
