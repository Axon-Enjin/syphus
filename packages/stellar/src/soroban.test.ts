import { describe, expect, it } from "vitest";
import { nativeToScVal } from "@stellar/stellar-sdk";
import {
  isSorobanEnabled,
  parseLinkRecord,
  toRegistrySymbol,
  usdcToStroops,
} from "./soroban";

describe("soroban helpers", () => {
  it("toRegistrySymbol strips dashes and truncates to 16 chars", () => {
    expect(toRegistrySymbol("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(
      "a1b2c3d4e5f67890",
    );
  });

  it("usdcToStroops converts 7-decimal amounts", () => {
    expect(usdcToStroops("500")).toBe(BigInt(500_0000000));
    expect(usdcToStroops("1.5")).toBe(BigInt(1_5000000));
    expect(usdcToStroops("0.0000001")).toBe(BigInt(1));
  });

  it("parseLinkRecord decodes unit enum status variants (['Paid'])", () => {
    const val = nativeToScVal({
      creator: "GBZMYSACL7VI5KELKL227GBYOGBMKXVIQC3HOWSJLXGEHPWOD5ER6MSQ",
      destination: "GBZMYSACL7VI5KELKL227GBYOGBMKXVIQC3HOWSJLXGEHPWOD5ER6MSQ",
      amount: 125000000,
      memo: "invoice",
      status: ["Paid"],
      register_ts: 1783834594,
      paid_tx_hash: "deadbeef",
    });

    const record = parseLinkRecord(val);
    expect(record?.status).toBe("paid");
    expect(record?.amount).toBe("12.5");
    expect(record?.paidTxHash).toBe("deadbeef");
  });

  it("parseLinkRecord decodes ['Registered'] as registered", () => {
    const val = nativeToScVal({
      creator: "GBZMYSACL7VI5KELKL227GBYOGBMKXVIQC3HOWSJLXGEHPWOD5ER6MSQ",
      destination: "GBZMYSACL7VI5KELKL227GBYOGBMKXVIQC3HOWSJLXGEHPWOD5ER6MSQ",
      amount: null,
      memo: null,
      status: ["Registered"],
      register_ts: 1783834594,
      paid_tx_hash: null,
    });

    const record = parseLinkRecord(val);
    expect(record?.status).toBe("registered");
    expect(record?.amount).toBeNull();
    expect(record?.paidTxHash).toBeNull();
  });

  it("isSorobanEnabled is false without env", () => {
    const prevEnabled = process.env.SOROBAN_ENABLED;
    const prevId = process.env.PAYMENT_REGISTRY_CONTRACT_ID;
    const prevSecret = process.env.SOROBAN_ADMIN_SECRET;

    delete process.env.SOROBAN_ENABLED;
    delete process.env.PAYMENT_REGISTRY_CONTRACT_ID;
    delete process.env.SOROBAN_ADMIN_SECRET;

    expect(isSorobanEnabled()).toBe(false);

    process.env.SOROBAN_ENABLED = prevEnabled;
    process.env.PAYMENT_REGISTRY_CONTRACT_ID = prevId;
    process.env.SOROBAN_ADMIN_SECRET = prevSecret;
  });

  it("isSorobanEnabled is true when fully configured", () => {
    const prevEnabled = process.env.SOROBAN_ENABLED;
    const prevId = process.env.PAYMENT_REGISTRY_CONTRACT_ID;
    const prevSecret = process.env.SOROBAN_ADMIN_SECRET;

    process.env.SOROBAN_ENABLED = "true";
    process.env.PAYMENT_REGISTRY_CONTRACT_ID =
      "CA3D5KRYM6CB7OWQ6TWYRRBVZ4TSSO4S3QW4H6QK2F5Y6Z3Q2ZQZQZQZ";
    process.env.SOROBAN_ADMIN_SECRET =
      "SDZYW7O3IOWJI3E4YGFY6J5T6QZ2QZ2QZ2QZ2QZ2QZ2QZ2QZ2QZ2QZ2Q";

    expect(isSorobanEnabled()).toBe(true);

    process.env.SOROBAN_ENABLED = prevEnabled;
    process.env.PAYMENT_REGISTRY_CONTRACT_ID = prevId;
    process.env.SOROBAN_ADMIN_SECRET = prevSecret;
  });
});
