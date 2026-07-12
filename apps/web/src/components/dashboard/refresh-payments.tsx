"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { syncMyPayments } from "@/app/actions/sync";

export function RefreshPayments() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncMyPayments();
      router.refresh();
      setLastRefresh(new Date());
    } finally {
      setSyncing(false);
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      void runSync();
    }, 30_000);
    return () => clearInterval(interval);
  }, [runSync]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => void runSync()}
        disabled={syncing}
        className="btn-secondary focus-ring px-3 py-1.5 text-xs active:scale-[0.98] disabled:opacity-50"
      >
        {syncing ? "Syncing…" : "Refresh"}
      </button>
      {lastRefresh && (
        <span className="text-xs text-[var(--color-muted)]">
          Synced {lastRefresh.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
