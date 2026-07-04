/** Swiss number formatting: 1'234.55, Rappen rounded to 0.05, ".–" for whole francs. */

const swiss = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const swissCents = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Round to the nearest 5 Rappen (Swiss cash rounding, used for display). */
export function roundRappen(n: number): number {
  return Math.round(n * 20) / 20;
}

/** "6'221.55" or "6'220.–" when whole. */
export function chf(n: number): string {
  const r = roundRappen(n);
  if (Number.isInteger(r)) return `${swiss.format(r)}.–`;
  return swissCents.format(r);
}

/** Whole francs only: "74'658" — for annual figures and charts. */
export function chfWhole(n: number): string {
  return swiss.format(Math.round(n));
}

/** "10.1%" with one decimal. */
export function pct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
