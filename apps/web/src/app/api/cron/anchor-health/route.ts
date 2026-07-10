import { NextResponse } from "next/server";
import { runHealthChecks } from "@syphus/anchors";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runHealthChecks();
  return NextResponse.json({ ok: true, anchors: results });
}
