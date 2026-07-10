import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTransactionsInRange } from "@/lib/indexer";
import { transactionsToCsv, transactionsToPdf } from "@/lib/export";
import { eq } from "@syphus/db";
import { getDb, users } from "@syphus/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  const months = Number(url.searchParams.get("months") ?? "6");
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);

  const rows = await getTransactionsInRange(session.user.id, from, to);

  if (format === "pdf") {
    const db = getDb();
    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const pdfBytes = await transactionsToPdf(
      rows,
      user?.name ?? user?.email ?? "Freelancer",
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="income-report.pdf"',
      },
    });
  }

  const csv = transactionsToCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="income-report.csv"',
    },
  });
}
