"use client";

import { useState } from "react";
import { sumPhpApprox } from "@/lib/php-display";

export type ExportMonthRange = 1 | 3 | 6 | 12;

export interface ExportRangeStats {
  paymentCount: number;
  totalUsdc: string;
}

interface ExportPanelProps {
  statsByMonths: Record<ExportMonthRange, ExportRangeStats>;
}

const monthOptions: ExportMonthRange[] = [1, 3, 6, 12];

export function ExportPanel({ statsByMonths }: ExportPanelProps) {
  const [months, setMonths] = useState<ExportMonthRange>(6);
  const stats = statsByMonths[months];
  const { php, label } = sumPhpApprox([stats.totalUsdc]);

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
        {stats.paymentCount} payment{stats.paymentCount === 1 ? "" : "s"} in
        last {months} {months === 1 ? "month" : "months"} ·{" "}
        <span className="font-medium text-[var(--color-text)]">
          {php} {label}
        </span>{" "}
        total
      </p>
      <p className="text-xs text-[var(--color-muted)]">
        Download uses the selected range above.
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
