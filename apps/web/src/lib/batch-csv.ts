import { isValidPublicKey } from "@gig-payout/stellar";

export interface BatchCsvRow {
  recipientName: string;
  destinationAddress: string;
  amountUsdc: string;
  memo?: string;
}

export interface ParseBatchCsvResult {
  rows?: BatchCsvRow[];
  errors?: string[];
}

const MAX_ROWS = 50;
const AMOUNT_RE = /^\d+(\.\d{1,7})?$/;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function parseBatchCsv(content: string): ParseBatchCsvResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return { errors: ["CSV must include a header row and at least one payout row"] };
  }

  const headers = lines[0].split(",").map(normalizeHeader);
  const nameIdx = headers.indexOf("name");
  const addressIdx = headers.findIndex((h) =>
    ["stellar_address", "address", "destination", "public_key"].includes(h),
  );
  const amountIdx = headers.findIndex((h) =>
    ["amount_usdc", "amount", "usdc"].includes(h),
  );
  const memoIdx = headers.indexOf("memo");

  if (nameIdx === -1 || addressIdx === -1 || amountIdx === -1) {
    return {
      errors: [
        "CSV header must include name, stellar_address (or address), and amount_usdc (or amount)",
      ],
    };
  }

  const rows: BatchCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (rows.length >= MAX_ROWS) {
      errors.push(`Maximum ${MAX_ROWS} payouts per batch`);
      break;
    }

    const cols = lines[i].split(",").map((c) => c.trim());
    const lineNo = i + 1;
    const recipientName = cols[nameIdx] ?? "";
    const destinationAddress = cols[addressIdx] ?? "";
    const amountUsdc = cols[amountIdx] ?? "";
    const memo = memoIdx >= 0 ? cols[memoIdx] : undefined;

    if (!recipientName) {
      errors.push(`Line ${lineNo}: name is required`);
      continue;
    }
    if (!isValidPublicKey(destinationAddress)) {
      errors.push(`Line ${lineNo}: invalid Stellar address`);
      continue;
    }
    if (!AMOUNT_RE.test(amountUsdc) || parseFloat(amountUsdc) <= 0) {
      errors.push(`Line ${lineNo}: invalid amount`);
      continue;
    }
    if (memo && memo.length > 28) {
      errors.push(`Line ${lineNo}: memo must be 28 characters or less`);
      continue;
    }

    rows.push({
      recipientName,
      destinationAddress,
      amountUsdc,
      memo: memo || undefined,
    });
  }

  if (errors.length > 0) {
    return { errors };
  }
  if (rows.length === 0) {
    return { errors: ["No valid payout rows found"] };
  }

  return { rows };
}

export function sumBatchAmounts(rows: BatchCsvRow[]): string {
  const total = rows.reduce((sum, row) => sum + parseFloat(row.amountUsdc), 0);
  return total.toFixed(7).replace(/\.?0+$/, "") || "0";
}
