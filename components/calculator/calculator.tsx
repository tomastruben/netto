"use client";

import * as React from "react";
import { calcSalary, type SalaryInput } from "@/lib/salary/engine";
import { CANTONS, type Canton } from "@/lib/salary/cantons";
import { CONST_2026 } from "@/lib/salary/constants";
import type { Dict, Locale } from "@/lib/i18n";
import { SalaryForm } from "./salary-form";
import { Results } from "./results";
import { CantonCompare } from "./canton-compare";
import { Monetize } from "./monetize";

export interface CalcState extends SalaryInput {
  /** UI: whether the gross field is entered per month or per year. */
  inputPeriod: "month" | "year";
  /** UI: raw value in the gross field (interpreted via inputPeriod). */
  grossValue: number;
  /** B/L permit → withholding tax on the payslip. */
  quellensteuer: boolean;
}

const DEFAULT_STATE: CalcState = {
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

function readUrlState(): Partial<CalcState> {
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

function writeUrlState(s: CalcState) {
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

export function Calculator({ dict, locale }: { dict: Dict; locale: Locale }) {
  const [state, setState] = React.useState<CalcState>(DEFAULT_STATE);

  // Hydrate from the share URL once, after mount (avoids SSR mismatch).
  React.useEffect(() => {
    const fromUrl = readUrlState();
    if (Object.keys(fromUrl).length === 0) return;
    setState((s) => {
      const next = { ...s, ...fromUrl };
      const payouts = next.has13th ? 13 : 12;
      next.grossMonthly =
        next.inputPeriod === "year" ? next.grossValue / payouts : next.grossValue;
      return next;
    });
  }, []);

  const update = React.useCallback((patch: Partial<CalcState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const payouts = next.has13th ? 13 : 12;
      next.grossMonthly =
        next.inputPeriod === "year" ? next.grossValue / payouts : next.grossValue;
      writeUrlState(next);
      return next;
    });
  }, []);

  const result = React.useMemo(() => calcSalary(state), [state]);

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
      <div className="rise rise-2 lg:col-span-5 xl:col-span-4">
        <SalaryForm dict={dict} locale={locale} state={state} onChange={update} />
      </div>
      <div className="flex flex-col gap-8 lg:col-span-7 xl:col-span-8">
        <div className="rise rise-3">
          <Results dict={dict} state={state} result={result} />
        </div>
        <div className="rise rise-4">
          <CantonCompare dict={dict} state={state} locale={locale} />
        </div>
        <div className="rise rise-5">
          <Monetize dict={dict} />
        </div>
      </div>
    </div>
  );
}
