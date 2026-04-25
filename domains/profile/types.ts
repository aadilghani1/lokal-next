export interface GoogleBusinessProfile {
  id: string;
  userId: string;
  url: string;
  name: string | null;
  placeId: string | null;
  tenantSlug: string | null;
  status: ProfileStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileStatus = "pending" | "active" | "error";
