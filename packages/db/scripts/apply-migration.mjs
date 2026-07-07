import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const envPath = path.join(root, "apps/web/.env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const url = match[1]
  .trim()
  .replace(/([?&])channel_binding=require(&?)/g, "$1")
  .replace(/[?&]$/, "");

const sql = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../drizzle/0001_batch_payout.sql"),
  "utf8",
);

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: true },
});

try {
  console.log("Applying 0001_batch_payout.sql...");
  await pool.query(sql);
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('batches', 'batch_items') ORDER BY table_name",
  );
  console.log("Migration applied. Tables:", tables.rows.map((r) => r.table_name).join(", "));
} catch (e) {
  console.error("Migration failed:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await pool.end();
}
