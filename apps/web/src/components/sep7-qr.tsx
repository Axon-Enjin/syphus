"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Sep7QrProps {
  uri: string;
  size?: number;
  label?: string;
}

export function Sep7Qr({ uri, size = 160, label = "Scan to pay" }: Sep7QrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(uri, {
      width: size,
      margin: 1,
      color: { dark: "#1a1a18", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uri, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-lg bg-[var(--color-border)] motion-reduce:animate-none"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={dataUrl}
        alt={label}
        width={size}
        height={size}
        className="rounded-lg border border-[var(--color-border)] bg-white p-2"
      />
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
    </div>
  );
}
