import { auth } from "@clerk/nextjs/server";

type AuthSession = Awaited<ReturnType<typeof auth>>;

export async function getRequiredUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized. Please sign in.");
  }
  return userId;
}

export async function getRequiredAuth(): Promise<AuthSession> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }
  return session;
}
