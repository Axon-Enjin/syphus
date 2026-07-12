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

  const trustlineReady = !!wallet?.trustlineReady;

  return (
    <DashboardShell
      onboardingComplete={trustlineReady}
      userEmail={session?.user?.email ?? null}
    >
      {children}
    </DashboardShell>
  );
}
