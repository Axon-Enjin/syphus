import {
  getActiveProviderId,
  getOffRampStatus,
  isOffRampPaused,
} from "@syphus/anchors";
import { sql } from "@syphus/db";
import { NextResponse } from "next/server";

export async function GET() {
  const offRamp = getOffRampStatus();
  const checks: Record<string, string> = {
    app: "ok",
    anchor: getActiveProviderId(),
    offRamp: offRamp.paused ? "paused" : "available",
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

  const healthy = dbStatus !== "error" && !isOffRampPaused();
  const status =
    dbStatus === "error" ? "degraded" : isOffRampPaused() ? "degraded" : "healthy";

  return NextResponse.json(
    {
      status,
      checks,
      offRamp,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
