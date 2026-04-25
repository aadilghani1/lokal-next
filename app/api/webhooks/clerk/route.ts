import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(request: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { data, type } = event;
  const email = data.email_addresses[0]?.email_address ?? "";
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  switch (type) {
    case "user.created":
      await db.insert(users).values({
        clerkId: data.id,
        email,
        name,
        imageUrl: data.image_url,
      });
      break;

    case "user.updated":
      await db
        .update(users)
        .set({ email, name, imageUrl: data.image_url, updatedAt: new Date() })
        .where(eq(users.clerkId, data.id));
      break;

    case "user.deleted":
      await db.delete(users).where(eq(users.clerkId, data.id));
      break;
  }

  return NextResponse.json({ received: true });
}
