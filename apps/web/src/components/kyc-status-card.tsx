import Link from "next/link";
import { StatusBadge } from "./ui";

interface KycStatusCardProps {
  complete: boolean;
  compact?: boolean;
}

export function KycStatusCard({ complete, compact = false }: KycStatusCardProps) {
  if (complete) {
    return (
      <StatusBadge variant="success">
        Identity verified — withdrawals to your bank are enabled
      </StatusBadge>
    );
  }

  if (compact) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Withdrawals to your bank require identity verification.{" "}
        <Link href="/dashboard/withdraw" className="link-accent">
          Start when you withdraw
        </Link>
      </p>
    );
  }

  return (
    <div className="callout-warning p-4 text-sm">
      <p>
        Withdrawals to your bank require identity verification. You&apos;ll
        complete this during your first withdrawal.
      </p>
      <p className="mt-2 text-xs opacity-80">
        Receiving USDC payments does not require verification.
      </p>
    </div>
  );
}
