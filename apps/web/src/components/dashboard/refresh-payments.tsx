"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RefreshPayments() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  function handleRefresh() {
    router.refresh();
    setLastRefresh(new Date());
  }

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 30_000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleRefresh}
        className="btn-secondary focus-ring px-3 py-1.5 text-xs active:scale-[0.98]"
      >
        Refresh
      </button>
      {lastRefresh && (
        <span className="text-xs text-[var(--color-muted)]">
          Updated {lastRefresh.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
