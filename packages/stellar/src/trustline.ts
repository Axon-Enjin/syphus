import { getHorizonUrl, getUsdcIssuer, isValidPublicKey } from "./index";

export interface TrustlineStatus {
  exists: boolean;
  balance: string | null;
}

/**
 * Check if a Stellar account has an active USDC trustline.
 * Queries Horizon /accounts/{publicKey} and inspects balances.
 */
export async function checkUsdcTrustline(
  publicKey: string,
): Promise<TrustlineStatus> {
  if (!isValidPublicKey(publicKey)) {
    throw new Error("Invalid Stellar public key");
  }

  const base = getHorizonUrl();
  const url = `${base}/accounts/${publicKey}`;

  const res = await fetch(url);

  if (res.status === 404) {
    // Account not funded yet
    return { exists: false, balance: null };
  }

  if (!res.ok) {
    throw new Error(`Horizon error: ${res.status}`);
  }

  const data = (await res.json()) as {
    balances?: Array<{
      asset_type: string;
      asset_code?: string;
      asset_issuer?: string;
      balance?: string;
    }>;
  };

  const usdcIssuer = getUsdcIssuer();
  const usdcBalance = data.balances?.find(
    (b) =>
      b.asset_type === "credit_alphanum4" &&
      b.asset_code === "USDC" &&
      b.asset_issuer === usdcIssuer,
  );

  if (usdcBalance) {
    return { exists: true, balance: usdcBalance.balance ?? "0" };
  }

  return { exists: false, balance: null };
}
