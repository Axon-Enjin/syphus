const DEFAULT_PHP_RATE = 53;

export function getPhpReferenceRate(): number {
  const raw = process.env.PHP_REFERENCE_RATE;
  const parsed = raw ? Number(raw) : DEFAULT_PHP_RATE;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PHP_RATE;
}

export function formatPhpApprox(usdc: string | number): {
  php: string;
  label: string;
} {
  const amount = typeof usdc === "string" ? parseFloat(usdc) : usdc;
  const rate = getPhpReferenceRate();
  const phpValue = Math.round(amount * rate);
  const formatted = `₱${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(phpValue)}`;

  return {
    php: formatted,
    label: "approx.",
  };
}

export function sumPhpApprox(usdcAmounts: (string | number)[]): {
  php: string;
  label: string;
} {
  const total = usdcAmounts.reduce<number>((sum, a) => {
    const n = typeof a === "string" ? parseFloat(a) : a;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  return formatPhpApprox(total);
}
