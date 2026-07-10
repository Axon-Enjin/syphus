import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getActiveProviderId } from "@syphus/anchors";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    anchor: getActiveProviderId(),
  };

  let dbStatus = "skipped";
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@syphus/db");
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      dbStatus = "ok";
    } catch {
      dbStatus = "error";
    }
  }

  checks.database = dbStatus;
  const healthy = dbStatus !== "error";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
