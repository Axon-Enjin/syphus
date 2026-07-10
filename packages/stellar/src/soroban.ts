import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { getNetworkPassphrase } from "./index";

export type OnChainLinkStatus = "registered" | "paid";

export interface OnChainLinkRecord {
  creator: string;
  destination: string;
  amount: string | null;
  memo: string | null;
  status: OnChainLinkStatus;
  registerTs: number;
  paidTxHash: string | null;
}

export interface OnChainBatchRecord {
  creator: string;
  itemCount: number;
  total: string;
  registerTs: number;
}

export interface SorobanInvokeResult {
  ok: boolean;
  txHash?: string;
  error?: string;
}

export function isSorobanEnabled(): boolean {
  if (process.env.SOROBAN_ENABLED === "false") return false;
  if (process.env.SOROBAN_ENABLED !== "true") return false;
  return Boolean(getContractId() && getAdminSecret());
}

export function getSorobanRpcUrl(): string {
  return (
    process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org"
  );
}

export function getContractId(): string | null {
  const id = process.env.PAYMENT_REGISTRY_CONTRACT_ID?.trim();
  return id || null;
}

function getAdminSecret(): string | null {
  const secret = process.env.SOROBAN_ADMIN_SECRET?.trim();
  return secret || null;
}

/** First 16 hex chars of a UUID, suitable as Soroban Symbol key. */
export function toRegistrySymbol(id: string): string {
  return id.replace(/-/g, "").slice(0, 16);
}

/** Convert USDC decimal string to Stellar stroops (7 decimals). */
export function usdcToStroops(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid USDC amount: ${amount}`);
  }
  const [whole, frac = ""] = trimmed.split(".");
  const padded = frac.padEnd(7, "0").slice(0, 7);
  return BigInt(whole) * BigInt(10_000_000) + BigInt(padded || "0");
}

function stroopsToUsdc(stroops: bigint): string {
  const divisor = BigInt(10_000_000);
  const whole = stroops / divisor;
  const frac = (stroops % divisor).toString().padStart(7, "0");
  return `${whole}.${frac}`.replace(/\.?0+$/, "") || "0";
}

function getAdminKeypair(): Keypair {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("SOROBAN_ADMIN_SECRET is not set");
  }
  return Keypair.fromSecret(secret);
}

function getContract(): Contract {
  const contractId = getContractId();
  if (!contractId) {
    throw new Error("PAYMENT_REGISTRY_CONTRACT_ID is not set");
  }
  return new Contract(contractId);
}

function getRpcServer(): rpc.Server {
  return new rpc.Server(getSorobanRpcUrl(), { allowHttp: true });
}

async function pollTransaction(
  server: rpc.Server,
  hash: string,
): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const tx = await server.getTransaction(hash);
    if (tx.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return;
    }
    if (tx.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Soroban transaction failed: ${hash}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Soroban transaction timed out: ${hash}`);
}

export async function invokeContract(
  method: string,
  args: xdr.ScVal[],
): Promise<SorobanInvokeResult> {
  if (!isSorobanEnabled()) {
    return { ok: false, error: "Soroban is disabled" };
  }

  try {
    const server = getRpcServer();
    const source = getAdminKeypair();
    const contract = getContract();
    const account = await server.getAccount(source.publicKey());

    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(60)
      .build();

    tx = await server.prepareTransaction(tx);
    tx.sign(source);

    const sent = await server.sendTransaction(tx);
    if (sent.status !== "PENDING") {
      return {
        ok: false,
        error: `Send failed: ${sent.status} ${sent.errorResult?.toXDR("base64") ?? ""}`,
      };
    }

    await pollTransaction(server, sent.hash);
    return { ok: true, txHash: sent.hash };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Soroban invoke failed",
    };
  }
}

async function readContract(
  method: string,
  args: xdr.ScVal[],
): Promise<xdr.ScVal | null> {
  if (!getContractId() || !getAdminSecret()) return null;

  try {
    const server = getRpcServer();
    const contract = getContract();
    const source = getAdminKeypair();
    const account = await server.getAccount(source.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(60)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      return null;
    }
    return sim.result?.retval ?? null;
  } catch {
    return null;
  }
}

function parseLinkRecord(val: xdr.ScVal): OnChainLinkRecord | null {
  try {
    const raw = scValToNative(val) as Record<string, unknown>;
    if (!raw || typeof raw !== "object") return null;

    const statusRaw = raw.status;
    const status =
      statusRaw === "Paid" || statusRaw === 1 ? "paid" : "registered";

    const amount =
      raw.amount == null ? null : stroopsToUsdc(BigInt(String(raw.amount)));

    return {
      creator: String(raw.creator ?? ""),
      destination: String(raw.destination ?? ""),
      amount,
      memo: raw.memo == null ? null : String(raw.memo),
      status,
      registerTs: Number(raw.register_ts ?? 0),
      paidTxHash:
        raw.paid_tx_hash == null ? null : String(raw.paid_tx_hash),
    };
  } catch {
    return null;
  }
}

function parseBatchRecord(val: xdr.ScVal): OnChainBatchRecord | null {
  try {
    const raw = scValToNative(val) as Record<string, unknown>;
    if (!raw || typeof raw !== "object") return null;

    return {
      creator: String(raw.creator ?? ""),
      itemCount: Number(raw.item_count ?? 0),
      total: stroopsToUsdc(BigInt(String(raw.total ?? 0))),
      registerTs: Number(raw.register_ts ?? 0),
    };
  } catch {
    return null;
  }
}

export async function registerPaymentLink(params: {
  slug: string;
  creator: string;
  destination: string;
  amountUsdc?: string | null;
  memo?: string | null;
}): Promise<SorobanInvokeResult> {
  const amountVal =
    params.amountUsdc != null && params.amountUsdc !== ""
      ? nativeToScVal(usdcToStroops(params.amountUsdc), { type: "i128" })
      : xdr.ScVal.scvVoid();

  return invokeContract("register_link", [
    nativeToScVal(params.slug, { type: "symbol" }),
    new Address(params.creator).toScVal(),
    new Address(params.destination).toScVal(),
    amountVal,
    params.memo
      ? nativeToScVal(params.memo, { type: "string" })
      : xdr.ScVal.scvVoid(),
  ]);
}

export async function registerBatch(params: {
  batchId: string;
  creator: string;
  itemCount: number;
  totalUsdc: string;
}): Promise<SorobanInvokeResult> {
  return invokeContract("register_batch", [
    nativeToScVal(toRegistrySymbol(params.batchId), { type: "symbol" }),
    new Address(params.creator).toScVal(),
    nativeToScVal(params.itemCount, { type: "u32" }),
    nativeToScVal(usdcToStroops(params.totalUsdc), { type: "i128" }),
  ]);
}

export async function markLinkPaid(params: {
  slug: string;
  txHash: string;
}): Promise<SorobanInvokeResult> {
  return invokeContract("mark_link_paid", [
    nativeToScVal(params.slug, { type: "symbol" }),
    nativeToScVal(params.txHash, { type: "string" }),
  ]);
}

export async function getLinkOnChain(
  slug: string,
): Promise<OnChainLinkRecord | null> {
  const val = await readContract("get_link", [
    nativeToScVal(slug, { type: "symbol" }),
  ]);
  if (!val) return null;
  return parseLinkRecord(val);
}

export async function getBatchOnChain(
  batchId: string,
): Promise<OnChainBatchRecord | null> {
  const val = await readContract("get_batch", [
    nativeToScVal(toRegistrySymbol(batchId), { type: "symbol" }),
  ]);
  if (!val) return null;
  return parseBatchRecord(val);
}
