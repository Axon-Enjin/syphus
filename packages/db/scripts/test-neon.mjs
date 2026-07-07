import { neon } from "@neondatabase/serverless";
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

const url = match[1].trim();
const variants = [
  { name: "current", url },
  {
    name: "no_channel_binding",
    url: url.replace(/&?channel_binding=require/, ""),
  },
  {
    name: "direct_not_pooler",
    url: url
      .replace("-pooler", "")
      .replace(/&?channel_binding=require/, ""),
  },
];

for (const v of variants) {
  const start = Date.now();
  try {
    const sql = neon(v.url);
    const rows = await sql`SELECT 1 as ok`;
    console.log(`[${v.name}] SUCCESS (${Date.now() - start}ms)`, rows);
  } catch (e) {
    console.log(`[${v.name}] FAIL (${Date.now() - start}ms)`, e.message);
    if (e.cause?.code) console.log("  cause:", e.cause.code);
  }
}
