import {
  Asset,
  Horizon,
  Keypair,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export { checkUsdcTrustline } from "./trustline";
export type { TrustlineStatus } from "./trustline";

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

/** Circle USDC issuer on Stellar testnet (public, documented). */
export const TESTNET_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

/** Circle USDC issuer on Stellar mainnet (public, documented). */
export const PUBLIC_USDC_ISSUER =
  "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

export function getUsdcIssuer(): string {
  const configured = process.env.USDC_ISSUER?.trim().replace(
    /^["']|["']$/g,
    "",
  );
  const issuer =
    configured ||
    (process.env.STELLAR_NETWORK === "public"
      ? PUBLIC_USDC_ISSUER
      : TESTNET_USDC_ISSUER);

  if (!isValidPublicKey(issuer)) {
    throw new Error(
      `USDC_ISSUER is not a valid Stellar address (got "${issuer}"). ` +
        `For testnet, set USDC_ISSUER=${TESTNET_USDC_ISSUER} in .env.local`,
    );
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

export interface AddTrustlineResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Add a USDC trustline to a Stellar account by signing and submitting
 * a changeTrust operation using the account's secret key.
 */
export async function addUsdcTrustline(
  secretKey: string,
): Promise<AddTrustlineResult> {
  const keypair = Keypair.fromSecret(secretKey);
  const publicKey = keypair.publicKey();
  const horizonUrl = getHorizonUrl();
  const server = new Horizon.Server(horizonUrl);

  // Load the account to get the sequence number
  let account;
  try {
    account = await server.loadAccount(publicKey);
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? `Account not found or not funded: ${err.message}`
          : "Account not found on network",
    };
  }

  const usdcAsset = new Asset("USDC", getUsdcIssuer());
  const networkPassphrase = getNetworkPassphrase();

  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase,
  })
    .addOperation(Operation.changeTrust({ asset: usdcAsset }))
    .setTimeout(30)
    .build();

  transaction.sign(keypair);

  try {
    const response = await server.submitTransaction(transaction);
    return {
      success: true,
      transactionHash: response.hash,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Transaction submission failed";
    return { success: false, error: message };
  }
}


export interface BuildTrustlineTxResult {
  success: boolean;
  xdr?: string;
  error?: string;
}

/**
 * Build an unsigned changeTrust transaction XDR for USDC.
 * The client (e.g. Freighter) will sign it.
 */
export async function buildUnsignedTrustlineTx(
  publicKey: string,
): Promise<BuildTrustlineTxResult> {
  try {
    const horizonUrl = getHorizonUrl();
    const server = new Horizon.Server(horizonUrl);

    let account;
    try {
      account = await server.loadAccount(publicKey);
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? `Account not found or not funded: ${err.message}`
            : "Account not found on network",
      };
    }

    const usdcAsset = new Asset("USDC", getUsdcIssuer());
    const networkPassphrase = getNetworkPassphrase();

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(Operation.changeTrust({ asset: usdcAsset }))
      .setTimeout(180)
      .build();

    return {
      success: true,
      xdr: transaction.toXDR(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to build transaction",
    };
  }
}
