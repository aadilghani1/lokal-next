export interface Client {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientRole = "owner" | "admin" | "member";

export interface ClientMembership {
  userId: string;
  orgId: string;
  role: ClientRole;
}
