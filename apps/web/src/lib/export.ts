import type { Transaction } from "@syphus/db";

export function transactionsToCsv(rows: Transaction[]): string {
  const header = "date,amount_usdc,sender,transaction_hash,memo";
  const lines = rows.map((r) =>
    [
      r.stellarCreatedAt.toISOString(),
      r.amountUsdc,
      r.senderAddress,
      r.transactionHash,
      r.memo ?? "",
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

export function transactionsToPdfHtml(
  rows: Transaction[],
  userName: string,
): string {
  const total = rows.reduce((sum, r) => sum + Number(r.amountUsdc), 0);
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td>${r.stellarCreatedAt.toISOString().slice(0, 10)}</td><td>${r.amountUsdc}</td><td>${r.senderAddress.slice(0, 12)}...</td><td>${r.transactionHash.slice(0, 12)}...</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Income Report</title>
<style>body{font-family:IBM Plex Sans,sans-serif;padding:40px;color:#1A1A18}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}h1{color:#0D6E4F}</style>
</head><body>
<h1>Syphus Income Report</h1>
<p>Recipient: ${userName}</p>
<p>Total USDC: ${total.toFixed(2)}</p>
<p>Generated: ${new Date().toISOString()}</p>
<table><thead><tr><th>Date</th><th>USDC</th><th>Sender</th><th>Tx</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<p><small>Informational export only. Not tax advice.</small></p>
</body></html>`;
}
