"use client";

import { useState } from "react";
import { sumPhpApprox } from "@/lib/php-display";

interface ExportPanelProps {
  paymentCount: number;
  totalUsdc: string;
}

const monthOptions = [1, 3, 6, 12] as const;

export function ExportPanel({ paymentCount, totalUsdc }: ExportPanelProps) {
  const [months, setMonths] = useState<number>(6);
  const { php, label } = sumPhpApprox([totalUsdc]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-[var(--color-text)]">
          Date range
        </p>
        <div className="flex flex-wrap gap-2">
          {monthOptions.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`focus-ring rounded-lg px-4 py-2 text-sm transition-colors active:scale-[0.98] ${
                months === m
                  ? "bg-[var(--color-accent)] font-medium text-white"
                  : "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {m} {m === 1 ? "month" : "months"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        {paymentCount} payment{paymentCount === 1 ? "" : "s"} in range ·{" "}
        <span className="font-medium text-[var(--color-text)]">
          {php} {label}
        </span>{" "}
        total
      </p>

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/export?format=csv&months=${months}`}
          className="btn-primary focus-ring"
        >
          Download CSV
        </a>
        <a
          href={`/api/export?format=pdf&months=${months}`}
          className="btn-secondary focus-ring"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
