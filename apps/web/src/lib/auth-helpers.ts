import { eq } from "@gig-payout/db";
import { getDb, wallets } from "@gig-payout/db";

export const SESSION_STRATEGY = "jwt" as const;
export async function getTrustlineReadyForUser(
  userId: string,
): Promise<boolean> {
  const db = getDb();
  const [wallet] = await db
    .select({ trustlineReady: wallets.trustlineReady })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);
  return wallet?.trustlineReady ?? false;
}
