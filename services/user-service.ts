"use server";

import { getRequiredAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/domains/user";

export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkId } = await getRequiredAuth();
  if (!clerkId) return null;

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return row ?? null;
}
