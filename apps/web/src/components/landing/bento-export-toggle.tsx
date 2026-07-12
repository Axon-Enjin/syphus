"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type ExportFormat = "csv" | "pdf";

const csvRows = [
  "date,client,usdc,php_equiv,status",
  "2026-07-10,Acme Studio,500,29350,confirmed",
  "2026-07-08,Northwind,1200,70440,confirmed",
  "2026-07-03,Helix Labs,350,20545,confirmed",
];

const docLines = [
  { label: "Total received", value: "₱120,335" },
  { label: "Transactions", value: "14" },
  { label: "Format", value: "BIR-friendly PDF" },
];

export function BentoExportToggle() {
  const [format, setFormat] = useState<ExportFormat>("csv");

  return (
    <div className="landing-bento-export">
      <div className="landing-bento-export__tabs" role="tablist" aria-label="Export format">
        <button
          type="button"
          role="tab"
          aria-selected={format === "csv"}
          className={`landing-bento-export__tab focus-ring${format === "csv" ? " landing-bento-export__tab--active" : ""}`}
          onClick={() => setFormat("csv")}
        >
          CSV export
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={format === "pdf"}
          className={`landing-bento-export__tab focus-ring${format === "pdf" ? " landing-bento-export__tab--active" : ""}`}
          onClick={() => setFormat("pdf")}
        >
          PDF summary
        </button>
      </div>

      <div
        key={format}
        className="landing-bento-export__preview landing-bento-export__preview--animated"
        role="tabpanel"
      >
        {format === "csv" ? (
          <div className="landing-bento-export__code mono">
            {csvRows.map((row, i) => (
              <span
                key={row}
                className="landing-bento-export__row"
                style={{ "--row": i } as CSSProperties}
              >
                {row}
              </span>
            ))}
          </div>
        ) : (
          <div className="landing-bento-export__doc">
            <p
              className="landing-bento-export__doc-title landing-bento-export__doc-line--animated"
              style={{ "--row": 0 } as CSSProperties}
            >
              Income summary · Q2 2026
            </p>
            {docLines.map((line, i) => (
              <p
                key={line.label}
                className="landing-bento-export__doc-line landing-bento-export__doc-line--animated"
                style={{ "--row": i + 1 } as CSSProperties}
              >
                {line.label}: {line.value}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
