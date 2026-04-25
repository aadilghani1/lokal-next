"use server";

import { getRequiredUserId } from "@/lib/auth";
import {
  profileSubmissionSchema,
  type ProfileSubmissionInput,
  type GoogleBusinessProfile,
} from "@/domains/profile";

export async function submitProfile(
  input: ProfileSubmissionInput
): Promise<GoogleBusinessProfile> {
  const userId = await getRequiredUserId();
  const validated = profileSubmissionSchema.parse(input);

  // TODO: persist to database
  const profile: GoogleBusinessProfile = {
    id: crypto.randomUUID(),
    userId,
    url: validated.url,
    name: null,
    placeId: null,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return profile;
}

export async function getProfiles(): Promise<GoogleBusinessProfile[]> {
  const userId = await getRequiredUserId();

  // TODO: query database filtered by userId
  void userId;
  return [];
}
