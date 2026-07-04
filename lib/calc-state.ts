import type { SalaryInput } from "@/lib/salary/engine";
import { CANTONS, type Canton } from "@/lib/salary/cantons";
import { CONST_2026 } from "@/lib/salary/constants";

export interface CalcState extends SalaryInput {
  /** UI: whether the gross field is entered per month or per year. */
  inputPeriod: "month" | "year";
  /** UI: raw value in the gross field (interpreted via inputPeriod). */
  grossValue: number;
  /** B/L permit → withholding tax on the payslip. */
  quellensteuer: boolean;
}

export const DEFAULT_STATE: CalcState = {
  grossValue: 8000,
  inputPeriod: "month",
  grossMonthly: 8000,
  has13th: true,
  age: 30,
  canton: "ZH",
  children: 0,
  married: false,
  doubleIncome: false,
  churchMember: false,
  bvgEmployeeShare: 0.5,
  nbuRate: CONST_2026.nbuDefault,
  ktgRate: 0,
  quellensteuer: false,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Merge a patch and keep the derived fields consistent.
 *
 * Unit switch (month ↔ year alone in the patch) converts the displayed value
 * so the underlying salary stays identical — 8'000/month with a 13th salary
 * becomes 104'000/year, not 8'000/year. When the patch carries its own
 * grossValue (typing, URL hydration), the value is authoritative and is
 * interpreted in the patch's unit instead.
 *
 * The 13th-salary toggle preserves what the user actually entered: the
 * monthly amount in month mode (annual grows to ×13), the annual total in
 * year mode (payout shrinks to /13).
 */
export function applyPatch(prev: CalcState, patch: Partial<CalcState>): CalcState {
  const next = { ...prev, ...patch };
  const payouts = next.has13th ? 13 : 12;
  if (
    patch.inputPeriod !== undefined &&
    patch.inputPeriod !== prev.inputPeriod &&
    patch.grossValue === undefined
  ) {
    next.grossValue = round2(
      patch.inputPeriod === "year" ? prev.grossMonthly * payouts : prev.grossMonthly
    );
  }
  next.grossMonthly =
    next.inputPeriod === "year" ? next.grossValue / payouts : next.grossValue;
  return next;
}

export function readUrlState(): Partial<CalcState> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<CalcState> = {};
  const num = (k: string) => {
    const v = Number(p.get(k));
    return Number.isFinite(v) && v >= 0 ? v : undefined;
  };
  const g = num("g");
  if (g !== undefined && g > 0 && g <= 10_000_000) out.grossValue = g;
  if (p.get("p") === "y") out.inputPeriod = "year";
  const c = p.get("c")?.toUpperCase();
  if (c && (CANTONS as readonly string[]).includes(c)) out.canton = c as Canton;
  const age = num("a");
  if (age !== undefined && age >= 15 && age <= 70) out.age = age;
  const kids = num("k");
  if (kids !== undefined && kids <= 12) out.children = kids;
  if (p.get("m") === "1") out.married = true;
  if (p.get("d") === "1") out.doubleIncome = true;
  if (p.get("ch") === "1") out.churchMember = true;
  if (p.get("q") === "1") out.quellensteuer = true;
  if (p.get("t13") === "0") out.has13th = false;
  return out;
}

export function writeUrlState(s: CalcState) {
  const p = new URLSearchParams();
  p.set("g", String(s.grossValue));
  if (s.inputPeriod === "year") p.set("p", "y");
  p.set("c", s.canton);
  p.set("a", String(s.age));
  if (s.children) p.set("k", String(s.children));
  if (s.married) p.set("m", "1");
  if (s.doubleIncome) p.set("d", "1");
  if (s.churchMember) p.set("ch", "1");
  if (s.quellensteuer) p.set("q", "1");
  if (!s.has13th) p.set("t13", "0");
  window.history.replaceState(null, "", `?${p.toString()}`);
}
