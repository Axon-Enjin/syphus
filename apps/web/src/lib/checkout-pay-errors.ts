export interface PayErrorInfo {
  title: string;
  body: string;
  /** Optional help links shown under the message */
  actions?: { label: string; href: string }[];
}

/**
 * Turn Horizon / Freighter / build errors into calm, actionable copy.
 */
export function explainCheckoutPayError(
  raw: string,
  opts: { network: "testnet" | "public"; amount?: string },
): PayErrorInfo {
  const code = raw.toLowerCase();
  const amountHint = opts.amount ? `${opts.amount} USDC` : "the invoice amount";
  const isTestnet = opts.network === "testnet";

  if (
    code.includes("op_underfunded") ||
    code.includes("underfunded")
  ) {
    return {
      title: "Not enough USDC in this wallet",
      body: isTestnet
        ? `Freighter needs at least ${amountHint} of testnet USDC (plus a little XLM for fees). Fund the account, then try again.`
        : `This Freighter account needs at least ${amountHint} of USDC on Stellar, plus a little XLM for network fees.`,
      actions: isTestnet
        ? [
            {
              label: "Get testnet XLM (Friendbot)",
              href: "https://friendbot.stellar.org",
            },
            {
              label: "Stellar Laboratory (testnet)",
              href: "https://laboratory.stellar.org/#account-creator?network=test",
            },
          ]
        : undefined,
    };
  }

  if (
    code.includes("op_no_trust") ||
    code.includes("op_no_destination") ||
    code.includes("no trustline")
  ) {
    return {
      title: "USDC isn’t enabled on this wallet",
      body: "Add a USDC trustline in Freighter for this network, then try the payment again.",
    };
  }

  if (
    code.includes("op_line_full") ||
    code.includes("line_full")
  ) {
    return {
      title: "Recipient can’t receive this amount",
      body: "Their USDC balance limit is full. Ask them to raise their trustline limit, or send a smaller amount.",
    };
  }

  if (
    code.includes("tx_insufficient_balance") ||
    code.includes("insufficient balance") ||
    code.includes("insufficient fee")
  ) {
    return {
      title: "Not enough XLM for network fees",
      body: isTestnet
        ? "Stellar fees are paid in XLM. Fund this Freighter account with testnet XLM, then retry."
        : "Stellar fees are paid in XLM. Add a small amount of XLM to this wallet, then retry.",
      actions: isTestnet
        ? [
            {
              label: "Get testnet XLM (Friendbot)",
              href: "https://friendbot.stellar.org",
            },
          ]
        : undefined,
    };
  }

  if (
    code.includes("freighter not detected") ||
    code.includes("not detected")
  ) {
    return {
      title: "Freighter isn’t available",
      body: "Install the Freighter browser extension, unlock it, and set the network to match this page — or pay manually below.",
      actions: [
        { label: "Install Freighter", href: "https://www.freighter.app/" },
      ],
    };
  }

  if (
    code.includes("access denied") ||
    code.includes("user rejected") ||
    code.includes("cancelled") ||
    code.includes("canceled") ||
    code.includes("rejected")
  ) {
    return {
      title: "Payment wasn’t approved",
      body: "You closed or rejected the Freighter prompt. Click Pay with Freighter again when you’re ready.",
    };
  }

  if (
    code.includes("not funded") ||
    code.includes("account not found") ||
    code.includes("friendbot")
  ) {
    return {
      title: "This wallet isn’t funded yet",
      body: isTestnet
        ? "Switch Freighter to Testnet and fund the account with Friendbot before sending USDC."
        : "This Stellar account needs to be funded with XLM before it can send payments.",
      actions: isTestnet
        ? [
            {
              label: "Fund with Friendbot",
              href: "https://friendbot.stellar.org",
            },
          ]
        : undefined,
    };
  }

  if (code.includes("enter how much") || code.includes("valid usdc amount")) {
    return {
      title: "Amount needed",
      body: "Enter how much USDC to send, then try again.",
    };
  }

  if (code.includes("wrong network") || code.includes("network_passphrase")) {
    return {
      title: "Wrong network in Freighter",
      body: isTestnet
        ? "Open Freighter and switch to Testnet, then try again."
        : "Open Freighter and switch to Public Network, then try again.",
    };
  }

  // Fallback: keep a short human line; hide raw codes in the body detail
  const cleaned = raw
    .replace(/^payment failed:\s*/i, "")
    .replace(/^transaction failed:\s*/i, "")
    .trim();

  return {
    title: "Payment didn’t go through",
    body:
      cleaned && cleaned.length < 120
        ? cleaned
        : "Something went wrong submitting to Stellar. Check Freighter’s network and balances, then try again.",
  };
}
