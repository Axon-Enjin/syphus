import { NextResponse } from "next/server";
import { indexAllWallets } from "@/lib/indexer";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await indexAllWallets();
  return NextResponse.json({ ok: true, ...result });
}
