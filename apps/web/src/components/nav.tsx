"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BrandMark } from "@/components/brand-mark";
import { OnboardingBanner } from "./ui-interactive";
import { allNavLinks } from "@/lib/dashboard-nav";

/** @deprecated Dashboard routes use DashboardShell via layout. Kept for compatibility. */
export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const trustlineReady = session?.user?.trustlineReady ?? false;
  const email = session?.user?.email;
  const isOnboarding = session && !trustlineReady;

  const signOutButton = (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="focus-ring rounded-md px-2 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
    >
      Sign out
    </button>
  );

  if (isOnboarding) {
    return (
      <>
        <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm">
          <div className="font-display flex items-center gap-2 font-medium text-[var(--color-accent)]">
            <BrandMark className="h-4 w-4" />
            Wallet setup
          </div>
          {signOutButton}
        </nav>
        <OnboardingBanner currentStep={2} totalSteps={3} />
      </>
    );
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
      <div className="container-app flex items-center justify-between py-3 text-sm">
        <div className="flex flex-wrap items-center gap-1 sm:gap-4">
          <Link
            href="/dashboard"
            className="font-display focus-ring mr-2 hidden items-center gap-1.5 font-semibold tracking-tight text-[var(--color-accent)] sm:flex"
          >
            <BrandMark className="h-4 w-4" />
            Syphus
          </Link>
          {allNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring rounded-md px-2 py-1 transition-colors ${
                  active
                    ? "font-medium text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-xs text-[var(--color-muted)] md:inline">
              {email.length > 24 ? `${email.slice(0, 24)}…` : email}
            </span>
          )}
          {signOutButton}
        </div>
      </div>
    </nav>
  );
}
