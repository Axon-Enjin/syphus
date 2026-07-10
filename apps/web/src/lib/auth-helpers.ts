import { eq } from "@gig-payout/db";
import { getDb, wallets, users } from "@gig-payout/db";

export { SESSION_STRATEGY } from "./auth.config";
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

export async function getUserTier(userId: string): Promise<string> {
  const db = getDb();
  const [user] = await db
    .select({ tier: users.tier })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.tier ?? "solo";
}
