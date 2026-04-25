"use server";

import { getRequiredAuth } from "@/lib/auth";
import type { Client } from "@/domains/client";

export async function getCurrentClient(): Promise<Client | null> {
  const { userId } = await getRequiredAuth();
  if (!userId) return null;

  // TODO: query database for client by userId
  void userId;
  return null;
}

export async function provisionClient(
  userId: string,
  name: string
): Promise<Client> {
  // TODO: create client record in database
  const client: Client = {
    id: crypto.randomUUID(),
    userId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return client;
}
