"use server";

import { getRequiredAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const { userId: clerkId } = await getRequiredAuth();
  if (!clerkId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user ?? null;
}
