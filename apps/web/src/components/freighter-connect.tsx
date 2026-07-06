"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";

interface FreighterConnectProps {
  onConnect: (address: string) => void;
  connected?: string | null;
}

export function FreighterConnect({
  onConnect,
  connected,
}: FreighterConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);

    try {
      const { isConnected } = await import("@stellar/freighter-api").then(
        (m) => m.isConnected(),
      );

      if (!isConnected) {
        setError(
          "Freighter not detected. Please install the Freighter browser extension.",
        );
        setLoading(false);
        return;
      }

      const { requestAccess } = await import("@stellar/freighter-api");
      const { address, error: freighterError } = await requestAccess();

      if (freighterError) {
        setError(freighterError.message ?? "Freighter access denied");
        setLoading(false);
        return;
      }

      onConnect(address);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to Freighter",
      );
    } finally {
      setLoading(false);
    }
  }

  if (connected) {
    return (
      <div className="space-y-2">
        <StatusBadge variant="success">Freighter connected</StatusBadge>
        <code className="mono surface-inset block break-all p-2 text-xs">
          {connected}
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="btn-secondary focus-ring w-full disabled:opacity-50"
      >
        {loading ? "Connecting…" : "Connect Freighter wallet"}
      </button>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-[var(--color-muted)]">
        Don&apos;t have Freighter?{" "}
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
        >
          Install it here
        </a>
      </p>
    </div>
  );
}
