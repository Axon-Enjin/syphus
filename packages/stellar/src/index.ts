import { Keypair, Networks, StrKey } from "@stellar/stellar-sdk";

export function getNetworkPassphrase(): string {
  return process.env.STELLAR_NETWORK === "public"
    ? Networks.PUBLIC
    : Networks.TESTNET;
}

export function getHorizonUrl(): string {
  return (
    process.env.HORIZON_URL ??
    (process.env.STELLAR_NETWORK === "public"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org")
  );
}

export function getUsdcIssuer(): string {
  const issuer = process.env.USDC_ISSUER;
  if (!issuer) {
    throw new Error("USDC_ISSUER is not set");
  }
  return issuer;
}

export function isValidPublicKey(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

export function generateKeypair(): { publicKey: string; secretKey: string } {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

export interface Sep7Params {
  destination: string;
  amount?: string;
  memo?: string;
}

export function buildSep7Uri(params: Sep7Params): string {
  if (!isValidPublicKey(params.destination)) {
    throw new Error("Invalid Stellar destination address");
  }

  const search = new URLSearchParams({
    destination: params.destination,
    asset_code: "USDC",
    asset_issuer: getUsdcIssuer(),
    network_passphrase: getNetworkPassphrase(),
  });

  if (params.amount) {
    search.set("amount", params.amount);
  }
  if (params.memo) {
    search.set("memo", params.memo);
  }

  return `web+stellar:pay?${search.toString()}`;
}

export interface HorizonPayment {
  id: string;
  transaction_hash: string;
  from: string;
  amount: string;
  created_at: string;
  transaction_successful: boolean;
}

export async function fetchPayments(
  publicKey: string,
  cursor?: string | null,
): Promise<{ records: HorizonPayment[]; nextCursor: string | null }> {
  const base = getHorizonUrl();
  const url = new URL(`/accounts/${publicKey}/payments`, base);
  url.searchParams.set("order", "asc");
  url.searchParams.set("limit", "200");
  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Horizon error: ${res.status}`);
  }

  const data = (await res.json()) as {
    _embedded?: { records?: Record<string, unknown>[] };
    records?: Record<string, unknown>[];
  };

  const raw = data._embedded?.records ?? data.records ?? [];
  const records: HorizonPayment[] = [];

  for (const row of raw) {
    if (row.type !== "payment" || row.asset_type !== "credit_alphanum4") {
      continue;
    }
    if (row.asset_code !== "USDC" || row.asset_issuer !== getUsdcIssuer()) {
      continue;
    }
    if (row.to !== publicKey) {
      continue;
    }
    records.push({
      id: String(row.id),
      transaction_hash: String(row.transaction_hash),
      from: String(row.from),
      amount: String(row.amount),
      created_at: String(row.created_at),
      transaction_successful: Boolean(row.transaction_successful ?? true),
    });
  }

  const next =
    raw.length > 0 ? String(raw[raw.length - 1]?.paging_token ?? "") : null;

  return { records, nextCursor: next || null };
}
