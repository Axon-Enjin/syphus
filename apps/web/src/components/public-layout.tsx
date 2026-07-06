import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
        <div className="container-app flex items-center justify-between py-4">
          <Link
            href="/"
            className="focus-ring font-display flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-text)]"
          >
            <BrandMark className="h-5 w-5 text-[var(--color-accent)]" />
            Gig Payout
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="focus-ring rounded-md px-2 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn-primary focus-ring">
              Get started
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
