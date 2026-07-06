import { describe, expect, it, beforeEach, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";

const USDC_ISSUER = Keypair.random().publicKey();

// Mock the Horizon.Server class
const mockSubmitTransaction = vi.fn();
const mockLoadAccount = vi.fn();

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...actual,
    Horizon: {
      Server: vi.fn().mockImplementation(() => ({
        loadAccount: mockLoadAccount,
        submitTransaction: mockSubmitTransaction,
      })),
    },
  };
});

describe("addUsdcTrustline", () => {
  const testKeypair = Keypair.random();

  beforeEach(() => {
    process.env.USDC_ISSUER = USDC_ISSUER;
    process.env.STELLAR_NETWORK = "testnet";
    process.env.HORIZON_URL = "https://horizon-testnet.stellar.org";
    vi.clearAllMocks();
  });

  it("submits a changeTrust transaction and returns success", async () => {
    mockLoadAccount.mockResolvedValueOnce({
      accountId: () => testKeypair.publicKey(),
      sequenceNumber: () => "100",
      sequence: "100",
      incrementSequenceNumber: () => {},
    });

    mockSubmitTransaction.mockResolvedValueOnce({
      hash: "abc123def456",
    });

    // Import after mocks are set up
    const { addUsdcTrustline } = await import("./index");
    const result = await addUsdcTrustline(testKeypair.secret());

    expect(result.success).toBe(true);
    expect(result.transactionHash).toBe("abc123def456");
    expect(mockLoadAccount).toHaveBeenCalledWith(testKeypair.publicKey());
    expect(mockSubmitTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns error when account is not funded", async () => {
    mockLoadAccount.mockRejectedValueOnce(new Error("Request failed with status code 404"));

    const { addUsdcTrustline } = await import("./index");
    const result = await addUsdcTrustline(testKeypair.secret());

    expect(result.success).toBe(false);
    expect(result.error).toContain("Account not found or not funded");
  });

  it("returns error when transaction submission fails", async () => {
    mockLoadAccount.mockResolvedValueOnce({
      accountId: () => testKeypair.publicKey(),
      sequenceNumber: () => "100",
      sequence: "100",
      incrementSequenceNumber: () => {},
    });

    mockSubmitTransaction.mockRejectedValueOnce(
      new Error("Transaction failed: op_no_issuer"),
    );

    const { addUsdcTrustline } = await import("./index");
    const result = await addUsdcTrustline(testKeypair.secret());

    expect(result.success).toBe(false);
    expect(result.error).toContain("Transaction failed");
  });
});
