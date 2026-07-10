"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markMockKycComplete } from "@/app/actions/withdraw";

export function MockKycButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    const res = await markMockKycComplete();
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="btn-secondary focus-ring px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? "Marking…" : "Mark KYC complete (mock)"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
