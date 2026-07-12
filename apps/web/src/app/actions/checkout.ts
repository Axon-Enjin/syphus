"use server";

import { buildUnsignedPaymentTx } from "@syphus/stellar";

export async function buildCheckoutPaymentXdr(input: {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  memo?: string | null;
}): Promise<{ xdr?: string; error?: string }> {
  const result = await buildUnsignedPaymentTx({
    sourcePublicKey: input.sourcePublicKey,
    destination: input.destination,
    amount: input.amount,
    memo: input.memo,
  });

  if (!result.success || !result.xdr) {
    return { error: result.error ?? "Failed to build payment" };
  }

  return { xdr: result.xdr };
}
