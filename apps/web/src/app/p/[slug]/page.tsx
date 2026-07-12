import { getPaymentLinkBySlug } from "@/app/actions/payments";
import { PublicCheckout } from "@/components/public-checkout";
import { PublicLayout } from "@/components/public-layout";
import {
  getHorizonUrl,
  getLinkOnChain,
  getNetworkPassphrase,
  isSorobanEnabled,
} from "@syphus/stellar";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await getPaymentLinkBySlug(slug);
  if (!link) {
    return { title: "Payment link not found · Syphus" };
  }

  const name = link.userName ?? link.label ?? "Contractor";
  const amount = link.amountUsdc ? `${link.amountUsdc} USDC` : "USDC";

  return {
    title: `Pay ${name} · Syphus`,
    description: `Send ${amount} on Stellar to ${name} via Syphus.`,
  };
}

export default async function PublicCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getPaymentLinkBySlug(slug);
  if (!link) notFound();

  const stellarNetwork =
    process.env.STELLAR_NETWORK === "public" ? "public" : "testnet";

  const onChain =
    isSorobanEnabled()
      ? await getLinkOnChain(slug).catch(() => null)
      : null;

  const paidOnChain =
    link.onChainStatus === "paid" || onChain?.status === "paid";
  const registeredOnChain =
    paidOnChain ||
    link.onChainStatus === "registered" ||
    onChain?.status === "registered";

  return (
    <PublicLayout>
      <PublicCheckout
        userName={link.userName}
        label={link.label}
        amountUsdc={link.amountUsdc}
        memo={link.memo}
        publicKey={link.publicKey}
        sep7Uri={link.sep7Uri}
        stellarNetwork={stellarNetwork}
        horizonUrl={getHorizonUrl()}
        networkPassphrase={getNetworkPassphrase()}
        verifiedOnChain={paidOnChain}
        registeredOnChain={registeredOnChain}
        registerTxHash={link.registerTxHash}
        paidTxHash={onChain?.paidTxHash ?? null}
      />
    </PublicLayout>
  );
}
