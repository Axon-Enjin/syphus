"use server";

import { auth } from "@/lib/auth";
import { indexWalletForUser } from "@/lib/indexer";

export async function syncMyPayments(): Promise<
  { ok: true; newCount: number } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = await indexWalletForUser(session.user.id);
  if (!("newCount" in result)) {
    return { error: result.error };
  }

  return { ok: true, newCount: result.newCount };
}
