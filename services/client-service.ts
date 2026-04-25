"use server";

import { getRequiredAuth } from "@/lib/auth";
import type { Client } from "@/domains/client";

export async function getCurrentClient(): Promise<Client | null> {
  const { orgId } = await getRequiredAuth();
  if (!orgId) return null;

  // TODO: query database for client by orgId
  void orgId;
  return null;
}

export async function provisionClient(
  orgId: string,
  name: string
): Promise<Client> {
  // TODO: create client record in database linked to Clerk org
  const client: Client = {
    id: crypto.randomUUID(),
    orgId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return client;
}
