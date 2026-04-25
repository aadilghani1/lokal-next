"use server";

import { getRequiredOrgId } from "@/lib/auth";
import {
  profileSubmissionSchema,
  type ProfileSubmissionInput,
  type GoogleBusinessProfile,
} from "@/domains/profile";

export async function submitProfile(
  input: ProfileSubmissionInput
): Promise<GoogleBusinessProfile> {
  const orgId = await getRequiredOrgId();
  const validated = profileSubmissionSchema.parse(input);

  // TODO: persist to database
  const profile: GoogleBusinessProfile = {
    id: crypto.randomUUID(),
    orgId,
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
  const orgId = await getRequiredOrgId();

  // TODO: query database filtered by orgId
  void orgId;
  return [];
}
