"use client";

import { useMemo, useState } from "react";

const PHP_RATE = 58.7;

const recentPayments = [
  { name: "Maria Reyes", usdc: 500, php: 29350, time: "12s ago" },
  { name: "Andre Santos", usdc: 1200, php: 70440, time: "2m ago" },
  { name: "Lia Mendoza", usdc: 350, php: 20545, time: "8m ago" },
];

function formatPhp(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function HeroCalculator() {
  const [usdc, setUsdc] = useState("500");

  const phpAmount = useMemo(() => {
    const parsed = Number.parseFloat(usdc);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed * PHP_RATE);
  }, [usdc]);

  return (
    <div className="landing-simulator">
      <div className="landing-os">
        <div className="landing-os__chrome" aria-hidden="true">
          <span className="landing-os__dot" />
          <span className="landing-os__dot" />
          <span className="landing-os__dot" />
          <span className="landing-os__title">Payout preview</span>
        </div>

        <div className="landing-os__body">
          <p className="landing-simulator__label">You receive</p>
          <p className="landing-simulator__php" aria-live="polite">
            {formatPhp(phpAmount)}
          </p>
          <p className="landing-simulator__dest">To GCash · same day</p>

          <label className="landing-simulator__field" htmlFor="usdc-amount">
            <span className="landing-simulator__field-label">Client pays</span>
            <div className="landing-simulator__input-wrap">
              <input
                id="usdc-amount"
                type="number"
                min="1"
                step="1"
                value={usdc}
                onChange={(e) => setUsdc(e.target.value)}
                className="landing-simulator__input focus-ring"
              />
              <span className="landing-simulator__suffix">USDC</span>
            </div>
          </label>

          <ul className="landing-simulator__feed" aria-label="Recent payments">
            {recentPayments.map((payment) => (
              <li key={payment.name} className="landing-simulator__feed-item">
                <div>
                  <p className="landing-simulator__feed-name">{payment.name}</p>
                  <p className="landing-simulator__feed-meta">
                    {payment.usdc} USDC · {payment.time}
                  </p>
                </div>
                <p className="landing-simulator__feed-php">
                  {formatPhp(payment.php)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
