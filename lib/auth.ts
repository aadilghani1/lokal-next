import { auth } from "@clerk/nextjs/server";

type AuthSession = Awaited<ReturnType<typeof auth>>;

export async function getRequiredOrgId(): Promise<string> {
  const { orgId } = await auth();
  if (!orgId) {
    throw new Error("No active organization. Please select an organization.");
  }
  return orgId;
}

export async function getRequiredAuth(): Promise<AuthSession> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }
  return session;
}
