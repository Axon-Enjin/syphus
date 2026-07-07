import { NextResponse } from "next/server";
import { getOffRampStatus, runHealthChecks } from "@gig-payout/anchors";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runHealthChecks();
  const offRamp = getOffRampStatus();

  if (offRamp.paused) {
    console.error("[ops-alert] anchor-offramp-paused", {
      anchors: results,
      offRamp,
      timestamp: new Date().toISOString(),
    });
  } else if (offRamp.activeProvider !== offRamp.primaryProvider) {
    console.warn("[ops-alert] anchor-failover-active", {
      anchors: results,
      offRamp,
      timestamp: new Date().toISOString(),
    });
  }

  const anyDown = Object.values(results).some((s) => s === "down");
  if (anyDown) {
    console.warn("[ops-alert] anchor-health-degraded", {
      anchors: results,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, anchors: results, offRamp });
}
