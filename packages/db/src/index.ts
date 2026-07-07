import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Neon copy-paste URLs often include channel_binding=require, which breaks Node on Windows. */
export function normalizeDatabaseUrl(url: string): string {
  return url
    .replace(/([?&])channel_binding=require(&?)/g, "$1")
    .replace(/[?&]$/, "");
}

function createPool(url: string) {
  const needsSsl =
    url.includes("neon.tech") ||
    url.includes("sslmode=require") ||
    url.includes("sslmode=verify");

  return new Pool({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
    max: 5,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
  });
}

export function getDb() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  const url = normalizeDatabaseUrl(raw);
  if (!db || !pool) {
    pool = createPool(url);
    db = drizzle(pool, { schema });
  }
  return db;
}

/** Drop cached pool after transient network errors so the next call reconnects. */
export function resetDb() {
  if (pool) {
    void pool.end();
  }
  pool = null;
  db = null;
}

function isTransientDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code =
    err instanceof Error && "code" in err
      ? String((err as NodeJS.ErrnoException).code)
      : "";
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ENOTFOUND" ||
    msg.includes("fetch failed") ||
    msg.includes("connection") ||
    msg.includes("timeout") ||
    msg.includes("Error connecting to database")
  );
}

/** Retry DB work when Neon is slow or the HTTP/TCP connection drops. */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (!isTransientDbError(err) || i === attempts - 1) {
        throw err;
      }
      resetDb();
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw last;
}

export * from "./schema";
export { eq, sql, desc, and, gte, lte } from "drizzle-orm";
