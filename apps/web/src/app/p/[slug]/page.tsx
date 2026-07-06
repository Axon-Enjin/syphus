import { getPaymentLinkBySlug } from "@/app/actions/payments";
import { notFound } from "next/navigation";

export default async function PublicCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getPaymentLinkBySlug(slug);
  if (!link) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6">
      <p className="text-sm font-medium text-[#0D6E4F]">Pay with USDC</p>
      <h1 className="text-3xl font-semibold">
        {link.label ?? "Contractor payment"}
      </h1>
      {link.amountUsdc && (
        <p className="text-2xl font-semibold">{link.amountUsdc} USDC</p>
      )}
      <p className="text-sm text-[#6B6B63]">
        Send on the <strong>Stellar network</strong>. Include memo if shown.
      </p>
      <code className="mono block break-all rounded-lg bg-white p-4 text-xs border">
        {link.publicKey}
      </code>
      {link.memo && (
        <p className="text-sm">
          Memo: <strong>{link.memo}</strong>
        </p>
      )}
      <a
        href={link.sep7Uri}
        className="rounded-lg bg-[#0D6E4F] px-5 py-3 text-center text-sm font-medium text-white"
      >
        Open in Stellar wallet
      </a>
    </main>
  );
}
