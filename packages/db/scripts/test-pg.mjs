import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const envPath = path.join(root, "apps/web/.env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const url = match[1]
  .trim()
  .replace(/([?&])channel_binding=require(&?)/g, "$1")
  .replace(/[?&]$/, "");

console.log("Testing pg Pool (TCP)...");
const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 20_000,
});

const start = Date.now();
try {
  const res = await pool.query("SELECT 1 as ok");
  console.log("pg SUCCESS", res.rows, `(${Date.now() - start}ms)`);
} catch (e) {
  console.error("pg FAIL", e.message, `(${Date.now() - start}ms)`);
  process.exit(1);
} finally {
  await pool.end();
}
