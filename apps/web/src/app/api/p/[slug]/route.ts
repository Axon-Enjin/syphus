import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getPaymentLinkBySlug } from "@/app/actions/payments";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`slug:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const link = await getPaymentLinkBySlug(slug);
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: link.slug,
    amountUsdc: link.amountUsdc,
    memo: link.memo,
    label: link.label,
    publicKey: link.publicKey,
    sep7Uri: link.sep7Uri,
  });
}
