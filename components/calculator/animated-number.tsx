"use client";

import NumberFlow from "@number-flow/react";

import { roundRappen } from "@/lib/format";

// de-CH locale gives the Swiss "'" thousands separator natively.
const WHOLE = { maximumFractionDigits: 0 } as const;
const CENTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 } as const;
const ONE_DP = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;

/**
 * Animated equivalent of chf(): "6'220.–" when whole, "6'221.55" otherwise.
 * Digits spring smoothly on recalculation instead of snapping. Sign (−/+) is
 * left to the caller as a static prefix, matching the existing markup.
 */
export function Money({ value, className }: { value: number; className?: string }) {
  const r = roundRappen(value);
  const whole = Number.isInteger(r);
  return (
    <NumberFlow
      value={r}
      locales="de-CH"
      format={whole ? WHOLE : CENTS}
      suffix={whole ? ".–" : ""}
      className={className}
    />
  );
}

/** Animated equivalent of chfWhole(): "104'000" — whole francs, no cents. */
export function MoneyWhole({ value, className }: { value: number; className?: string }) {
  return (
    <NumberFlow value={Math.round(value)} locales="de-CH" format={WHOLE} className={className} />
  );
}

/**
 * Animated equivalent of pct(): a rate in 0..1 rendered as "5.3%".
 * de-CH keeps "." as the decimal separator, matching (rate*100).toFixed(1).
 */
export function Pct({ value, className }: { value: number; className?: string }) {
  return (
    <NumberFlow
      value={value * 100}
      locales="de-CH"
      format={ONE_DP}
      suffix="%"
      className={className}
    />
  );
}
