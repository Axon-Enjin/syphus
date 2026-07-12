"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/brand-mark";
import {
  primaryNavLinks,
  secondaryNavLinks,
} from "@/lib/dashboard-nav";

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    Dashboard: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    "Payment link": (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    Withdraw: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 14h12M10 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 11l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Export: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M10 3v10M6 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "Batch payout": (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h14M7 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "Wallet setup": (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9h14" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  };
  return <>{paths[name] ?? null}</>;
}

function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`focus-ring text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] ${className}`}
    >
      Sign out
    </button>
  );
}

function SidebarLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-[var(--color-inset)] font-medium text-[var(--color-accent)]"
          : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
      }`}
    >
      <NavIcon name={label} />
      {label}
    </Link>
  );
}

export function DashboardShell({
  children,
  onboardingComplete,
  userEmail,
}: {
  children: React.ReactNode;
  onboardingComplete: boolean;
  /** Server-provided email — avoids useSession hydration mismatch */
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const isOnboarding = !onboardingComplete;
  const email = userEmail?.trim() || null;

  if (isOnboarding) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-bg)]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3">
          <div className="font-display flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
            <BrandMark className="h-4 w-4" />
            Wallet setup
          </div>
          <SignOutButton />
        </header>
        <div className="container-app onboard-shell-content">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <aside className="dashboard-sidebar">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--color-border)] px-5 py-5">
            <Link
              href="/dashboard"
              className="font-display focus-ring flex items-center gap-2 font-semibold tracking-tight text-[var(--color-accent)]"
            >
              <BrandMark className="h-5 w-5" />
              Syphus
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
            {primaryNavLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
            <div className="my-3 border-t border-[var(--color-border)]" />
            {secondaryNavLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
          </nav>

          <div className="border-t border-[var(--color-border)] px-5 py-4">
            {email && (
              <p className="mb-2 truncate text-xs text-[var(--color-muted)]">
                {email}
              </p>
            )}
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <main className="container-app py-8">{children}</main>
      </div>

      <nav className="dashboard-bottom-nav" aria-label="Mobile navigation">
        {primaryNavLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-ring flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] transition-colors ${
                active
                  ? "font-medium text-[var(--color-accent)]"
                  : "text-[var(--color-muted)]"
              }`}
            >
              <NavIcon name={link.label} />
              {link.shortLabel}
            </Link>
          );
        })}
        <Link
          href="/dashboard/onboard"
          className={`focus-ring flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] transition-colors ${
            pathname === "/dashboard/onboard"
              ? "font-medium text-[var(--color-accent)]"
              : "text-[var(--color-muted)]"
          }`}
        >
          <NavIcon name="Wallet setup" />
          Setup
        </Link>
      </nav>
    </div>
  );
}
