import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Transaction } from "@gig-payout/db";

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

export function sumUsdcAmounts(rows: Transaction[]): number {
  return rows.reduce((sum, r) => sum + Number(r.amountUsdc), 0);
}

/** @deprecated Use transactionsToPdf for downloadable reports. */
export function transactionsToPdfHtml(
  rows: Transaction[],
  userName: string,
): string {
  const total = sumUsdcAmounts(rows);
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr><td>${r.stellarCreatedAt.toISOString().slice(0, 10)}</td><td>${r.amountUsdc}</td><td>${r.senderAddress.slice(0, 12)}...</td><td>${r.transactionHash.slice(0, 12)}...</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Income Report</title>
<style>body{font-family:IBM Plex Sans,sans-serif;padding:40px;color:#1a1a18}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e8e8e4;padding:8px;text-align:left}h1{color:#0d6e4f}</style>
</head><body>
<h1>Gig Payout Income Report</h1>
<p>Recipient: ${userName}</p>
<p>Total USDC: ${total.toFixed(2)}</p>
<p>Generated: ${new Date().toISOString()}</p>
<table><thead><tr><th>Date</th><th>USDC</th><th>Sender</th><th>Tx</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<p><small>Informational export only. Not tax advice.</small></p>
</body></html>`;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const FOOTER_Y = 40;

export async function transactionsToPdf(
  rows: Transaction[],
  userName: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const total = sumUsdcAmounts(rows);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    page.drawText("Gig Payout Income Report (continued)", {
      x: MARGIN,
      y,
      size: 10,
      font: bold,
      color: rgb(0.1, 0.1, 0.09),
    });
    y -= LINE_HEIGHT * 2;
  };

  const drawLine = (text: string, size = 11, useBold = false) => {
    if (y < MARGIN + LINE_HEIGHT * 3) {
      addPage();
    }
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.1, 0.09),
    });
    y -= size + 6;
  };

  drawLine("Gig Payout Income Report", 18, true);
  drawLine(`Recipient: ${userName}`);
  drawLine(`Total USDC: ${total.toFixed(2)}`);
  drawLine(`Payments: ${rows.length}`);
  drawLine(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  y -= 8;

  if (rows.length === 0) {
    drawLine("No confirmed payments in this date range.");
  } else {
    drawLine("Date       USDC        Sender                 Transaction", 10, true);
    for (const row of rows) {
      const date = row.stellarCreatedAt.toISOString().slice(0, 10);
      const sender = row.senderAddress.slice(0, 20);
      const tx = row.transactionHash.slice(0, 16);
      drawLine(
        `${date}  ${row.amountUsdc.padEnd(10)}  ${sender.padEnd(20)}  ${tx}`,
        9,
      );
    }
  }

  page.drawText("Informational export only. Not tax advice.", {
    x: MARGIN,
    y: FOOTER_Y,
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.42),
  });

  return doc.save();
}
