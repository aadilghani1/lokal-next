"use server";

import { getRequiredUserId } from "@/lib/auth";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  profileSubmissionSchema,
  type ProfileSubmissionInput,
  type GoogleBusinessProfile,
} from "@/domains/profile";

export async function submitProfile(
  input: ProfileSubmissionInput
): Promise<GoogleBusinessProfile> {
  const clerkId = await getRequiredUserId();
  const validated = profileSubmissionSchema.parse(input);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const [row] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      url: validated.url,
      status: "pending",
    })
    .returning();

  return {
    id: row.id,
    userId: row.userId,
    url: row.url,
    name: row.name,
    placeId: row.placeId,
    status: row.status as GoogleBusinessProfile["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getProfiles(): Promise<GoogleBusinessProfile[]> {
  const clerkId = await getRequiredUserId();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!user) return [];

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    url: row.url,
    name: row.name,
    placeId: row.placeId,
    status: row.status as GoogleBusinessProfile["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}
