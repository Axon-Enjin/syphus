import { auth } from "@/lib/auth";
import { getUserWallet } from "@/lib/indexer";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const wallet = session?.user?.id
    ? await getUserWallet(session.user.id)
    : null;

  const hasAddress = !!wallet?.publicKey;
  const trustlineReady = !!wallet?.trustlineReady;
  // Onboarding = account (always step 1) + payment address + enable USDC.
  // Identity verification is deferred to the first withdrawal, not counted here.
  const currentStep = 1 + (hasAddress ? 1 : 0) + (trustlineReady ? 1 : 0);

  return (
    <DashboardShell
      onboardingComplete={trustlineReady}
      currentStep={currentStep}
      totalSteps={3}
    >
      {children}
    </DashboardShell>
  );
}
