import { auth } from "@/lib/auth";
import { getUserWallet } from "@/lib/indexer";
import { PayLinkForm } from "./pay-link-form";

export default async function PayLinkPage() {
  const session = await auth();
  const wallet = session?.user?.id
    ? await getUserWallet(session.user.id)
    : null;

  const email = session?.user?.email ?? "";
  const freelancerName = email.includes("@")
    ? email.split("@")[0]!
    : email || "Your name";

  return (
    <PayLinkForm
      trustlineReady={wallet?.trustlineReady ?? false}
      freelancerName={freelancerName}
    />
  );
}
