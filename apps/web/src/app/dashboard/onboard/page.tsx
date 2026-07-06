import { auth } from "@/lib/auth";
import { getUserWallet } from "@/lib/indexer";
import { WalletSetup } from "./wallet-setup";

export default async function OnboardPage() {
  const session = await auth();
  const wallet = await getUserWallet(session!.user!.id);

  return (
    <WalletSetup
      publicKey={wallet?.publicKey ?? null}
      trustlineReady={wallet?.trustlineReady ?? false}
      anchorKycComplete={wallet?.anchorKycComplete ?? false}
      isExternal={!wallet?.encryptedSecret}
    />
  );
}
