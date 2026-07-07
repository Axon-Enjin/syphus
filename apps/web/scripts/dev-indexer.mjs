/**
 * Polls the local index-payments cron route every 30s.
 * Run alongside `pnpm dev`: pnpm dev:indexer
 *
 * Requires CRON_SECRET in apps/web/.env.local (default: dev-cron-secret)
 */

const BASE_URL = process.env.INDEXER_URL ?? "http://localhost:3000";
const INTERVAL_MS = Number(process.env.INDEXER_INTERVAL_MS ?? 30_000);
const SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";

async function tick() {
  const url = `${BASE_URL}/api/cron/index-payments`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const body = await res.json().catch(() => ({}));
    const time = new Date().toISOString().slice(11, 19);
    if (!res.ok) {
      console.error(`[${time}] indexer failed ${res.status}`, body);
      return;
    }
    const indexed = body.indexed ?? 0;
    console.log(`[${time}] indexed ${indexed} new payment(s)`);
  } catch (err) {
    console.error(
      `[${new Date().toISOString().slice(11, 19)}] indexer error:`,
      err instanceof Error ? err.message : err,
    );
  }
}

console.log(`Dev indexer polling ${BASE_URL} every ${INTERVAL_MS / 1000}s`);
await tick();
setInterval(tick, INTERVAL_MS);
