"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { chfWhole, pct } from "@/lib/format";
import { Money, MoneyWhole, Pct } from "./animated-number";
import { CONST_2026 } from "@/lib/salary/constants";
import type { SalaryResult } from "@/lib/salary/engine";
import type { Dict } from "@/lib/i18n";
import type { CalcState } from "./calculator";

interface Segment {
  key: string;
  label: string;
  value: number;
  className: string;
}

function CompositionBar({ segments, netLabel }: { segments: Segment[]; netLabel: string }) {
  const [active, setActive] = React.useState<string | null>(null);
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return null;
  const visible = segments
    .filter((s) => s.value > 0)
    .map((s) => ({ ...s, label: s.key === "net" ? netLabel : s.label }));

  const dimmed = (key: string) =>
    active !== null && active !== key ? "opacity-35" : "";

  return (
    <TooltipProvider>
      <div>
        <div
          className="flex h-9 w-full overflow-hidden border"
          onMouseLeave={() => setActive(null)}
        >
          {visible.map((s) => (
            <Tooltip key={s.key}>
              <TooltipTrigger
                render={
                  <div
                    tabIndex={0}
                    aria-label={`${s.label}: CHF ${chfWhole(s.value)} (${pct(s.value / total)})`}
                    style={{ width: `${(s.value / total) * 100}%` }}
                    className={cn(
                      s.className,
                      "outline-none transition-all duration-300",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      dimmed(s.key)
                    )}
                    onMouseEnter={() => setActive(s.key)}
                    onFocus={() => setActive(s.key)}
                    onBlur={() => setActive(null)}
                  />
                }
              />
              <TooltipContent>
                <span className="font-medium">{s.label}</span>
                <span className="num">
                  {chfWhole(s.value)} · {pct(s.value / total)}
                </span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {visible.map((s) => (
            <span
              key={s.key}
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "flex cursor-default items-center gap-1.5 text-[11px] transition-all duration-200",
                active === s.key ? "text-foreground" : "text-muted-foreground",
                dimmed(s.key)
              )}
            >
              <span
                className={cn(
                  "size-2 border transition-transform duration-200",
                  s.className,
                  active === s.key && "scale-125"
                )}
              />
              {s.label}
              <Pct value={s.value / total} className="num" />
            </span>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function Row({
  label,
  hint,
  rate,
  monthly,
  annual,
  negative = true,
}: {
  label: string;
  hint?: string;
  rate?: string;
  monthly: number;
  annual: number;
  negative?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="py-2.5 whitespace-normal">
        <div className="font-medium">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </TableCell>
      <TableCell className="num w-16 text-right text-xs text-muted-foreground">
        {rate ?? ""}
      </TableCell>
      <TableCell className="num w-28 text-right">
        {negative && monthly > 0 ? "−" : ""}
        <Money value={monthly} />
      </TableCell>
      <TableCell className="num w-28 hidden text-right text-muted-foreground sm:table-cell">
        {negative && annual > 0 ? "−" : ""}
        <MoneyWhole value={annual} />
      </TableCell>
    </TableRow>
  );
}

export function Results({
  dict,
  state,
  result,
}: {
  dict: Dict;
  state: CalcState;
  result: SalaryResult;
}) {
  const t = dict.results;
  const r = result;
  const qst = state.quellensteuer;
  const perPayout = (annual: number) => annual / r.payouts;

  // Payslip net: social only for residents; social + withholding tax for B/L.
  const payslipNetAnnual = qst
    ? r.grossAnnual - r.totalSocialAnnual - r.taxAnnual
    : r.grossAnnual - r.totalSocialAnnual;
  const afterTaxMonthly = (r.grossAnnual - r.totalSocialAnnual - r.taxAnnual) / 12;
  const deductedAnnual = qst ? r.totalSocialAnnual + r.taxAnnual : r.totalSocialAnnual;

  const s = r.social;
  const segments: Segment[] = [
    { key: "net", label: t.net, value: r.netAnnual, className: "bg-background" },
    { key: "bvg", label: t.bvg, value: s.bvg, className: "bg-chart-5" },
    { key: "ahv", label: t.ahv, value: s.ahv, className: "bg-chart-4" },
    { key: "alv", label: t.alv, value: s.alv, className: "bg-chart-3" },
    { key: "nbu", label: t.nbu, value: s.nbu, className: "bg-chart-2" },
    { key: "ktg", label: t.ktg, value: s.ktg, className: "bg-foreground" },
    { key: "tax", label: qst ? t.taxQst : t.tax, value: r.taxAnnual, className: "bg-primary" },
  ];

  const grossMonthlyPayout = r.grossAnnual / r.payouts;
  const capped = r.grossAnnual > CONST_2026.uvgCeiling;

  return (
    <Tabs defaultValue="employee">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="microlabel">{dict.results.deductions}</h2>
        <TabsList className="h-8">
          <TabsTrigger value="employee" className="px-3 text-xs">
            {dict.employer.employeeTab}
          </TabsTrigger>
          <TabsTrigger value="employer" className="px-3 text-xs">
            {dict.employer.employerTab}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="employee" className="space-y-7 pt-4">
        {/* Hero */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              {qst ? t.netMonthlyQst : t.netMonthly}
            </span>
            {/* Always mounted so the row height never changes — only fade it in/out.
                Conditionally rendering it reflowed the hero number below. */}
            <Badge
              variant="outline"
              aria-hidden={r.payouts !== 13}
              className={`num text-[10px] transition-opacity duration-200 ${
                r.payouts === 13 ? "opacity-100" : "opacity-0"
              }`}
            >
              × 13
            </Badge>
          </div>
          <div className="num mt-1 text-5xl font-medium tracking-tight sm:text-7xl">
            <Money value={perPayout(payslipNetAnnual)} />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="num text-foreground">
                <MoneyWhole value={payslipNetAnnual} />
              </span>{" "}
              {t.netAnnual}
            </span>
            <span>
              <Pct
                value={r.grossAnnual > 0 ? payslipNetAnnual / r.grossAnnual : 0}
                className="num text-foreground"
              />{" "}
              {t.ofGross}
            </span>
          </div>
        </div>

        {/* After-tax secondary (residents) or QST note */}
        {qst ? (
          <p className="border-l-2 border-primary pl-3 text-xs text-muted-foreground">
            {t.taxWithheld}
          </p>
        ) : (
          <div className="flex items-baseline justify-between border-l-2 border-primary pl-3">
            <div>
              <div className="text-sm font-medium">{t.afterTax}</div>
              <div className="text-[11px] text-muted-foreground">{t.afterTaxHint}</div>
            </div>
            <div className="num text-2xl">
              <Money value={afterTaxMonthly} />
            </div>
          </div>
        )}

        {/* Composition */}
        <div>
          <h3 className="microlabel mb-2">{t.composition}</h3>
          <CompositionBar segments={segments} netLabel={t.net} />
        </div>

        {/* Deduction table */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="microlabel h-8">{t.item}</TableHead>
              <TableHead className="microlabel h-8 w-16 text-right">{t.rate}</TableHead>
              <TableHead className="microlabel h-8 w-28 text-right">{t.monthlyCol}</TableHead>
              <TableHead className="microlabel h-8 w-28 hidden text-right sm:table-cell">
                {t.annualCol}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Row
              label={t.grossLabel}
              monthly={grossMonthlyPayout}
              annual={r.grossAnnual}
              negative={false}
            />
            <Row
              label={t.ahv}
              hint={t.ahvHint}
              rate="5.3%"
              monthly={perPayout(s.ahv)}
              annual={s.ahv}
            />
            <Row
              label={t.alv}
              hint={t.alvHint}
              rate="1.1%"
              monthly={perPayout(s.alv)}
              annual={s.alv}
            />
            <Row
              label={t.nbu}
              hint={t.nbuHint}
              rate={pct(state.nbuRate)}
              monthly={perPayout(s.nbu)}
              annual={s.nbu}
            />
            {s.ktg > 0 && (
              <Row
                label={t.ktg}
                hint={t.ktgHint}
                rate={pct(state.ktgRate)}
                monthly={perPayout(s.ktg)}
                annual={s.ktg}
              />
            )}
            {s.bvg > 0 ? (
              <Row
                label={t.bvg}
                hint={t.bvgHint}
                monthly={perPayout(s.bvg)}
                annual={s.bvg}
              />
            ) : (
              <TableRow>
                <TableCell className="py-2.5 font-medium">{t.bvg}</TableCell>
                <TableCell colSpan={3} className="text-right text-[11px] text-muted-foreground">
                  {t.bvgNone}
                </TableCell>
              </TableRow>
            )}
            {qst && (
              <Row
                label={t.taxQst}
                hint={t.taxHint}
                rate={pct(r.taxRate)}
                monthly={perPayout(r.taxAnnual)}
                annual={r.taxAnnual}
              />
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="border-t-2 border-foreground bg-transparent hover:bg-transparent">
              <TableCell className="font-semibold">{t.totalDeductions}</TableCell>
              <TableCell className="num text-right text-xs text-muted-foreground">
                <Pct value={r.grossAnnual > 0 ? deductedAnnual / r.grossAnnual : 0} />
              </TableCell>
              <TableCell className="num text-right font-semibold">
                −<Money value={perPayout(deductedAnnual)} />
              </TableCell>
              <TableCell className="num hidden text-right font-semibold sm:table-cell">
                −<MoneyWhole value={deductedAnnual} />
              </TableCell>
            </TableRow>
            {!qst && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">
                  {t.tax}
                  <div className="text-[11px] font-normal text-muted-foreground">
                    {t.taxHint}
                  </div>
                </TableCell>
                <TableCell className="num text-right text-xs text-muted-foreground">
                  <Pct value={r.taxRate} />
                </TableCell>
                <TableCell className="num text-right text-muted-foreground">
                  −<Money value={r.taxAnnual / 12} />
                </TableCell>
                <TableCell className="num hidden text-right text-muted-foreground sm:table-cell">
                  −<MoneyWhole value={r.taxAnnual} />
                </TableCell>
              </TableRow>
            )}
            {state.children > 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium text-foreground">
                  {t.childAllowance}
                  <div className="text-[11px] font-normal text-muted-foreground">
                    {t.childAllowanceHint}
                  </div>
                </TableCell>
                <TableCell />
                <TableCell className="num text-right text-primary">
                  +<Money value={r.childAllowanceMonthly} />
                </TableCell>
                <TableCell className="num hidden text-right text-primary sm:table-cell">
                  +<MoneyWhole value={r.childAllowanceMonthly * 12} />
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {capped && <span className="mr-1">{t.ceilingNote} ·</span>}
          {qst ? t.qstNote : t.estimateNote}{" "}
          <a
            href="https://swisstaxcalculator.estv.admin.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t.estimateLink}
          </a>
        </p>
      </TabsContent>

      <TabsContent value="employer" className="space-y-7 pt-4">
        <div>
          <span className="text-sm text-muted-foreground">
            {dict.employer.totalCost}
          </span>
          <div className="num mt-1 text-5xl font-medium tracking-tight sm:text-7xl">
            <MoneyWhole value={r.grossAnnual + r.employer.totalAnnual} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {dict.employer.totalCostHint} —{" "}
            <span className="num text-foreground">
              +
              <Pct value={r.grossAnnual > 0 ? r.employer.totalAnnual / r.grossAnnual : 0} />
            </span>{" "}
            {dict.employer.onTop}
          </div>
        </div>

        <Table className="table-fixed">
          <TableBody>
            <Row
              label={t.grossLabel}
              monthly={grossMonthlyPayout}
              annual={r.grossAnnual}
              negative={false}
            />
            <Row label={t.ahv} rate="5.3%" monthly={perPayout(r.employer.ahv)} annual={r.employer.ahv} negative={false} />
            <Row label={t.alv} rate="1.1%" monthly={perPayout(r.employer.alv)} annual={r.employer.alv} negative={false} />
            <Row label={dict.employer.bu} rate="0.5%" monthly={perPayout(r.employer.nbu)} annual={r.employer.nbu} negative={false} />
            {r.employer.ktg > 0 && (
              <Row label={t.ktg} monthly={perPayout(r.employer.ktg)} annual={r.employer.ktg} negative={false} />
            )}
            {r.employer.bvg > 0 && (
              <Row label={t.bvg} monthly={perPayout(r.employer.bvg)} annual={r.employer.bvg} negative={false} />
            )}
            <Row label={dict.employer.fak} rate="1.5%" monthly={perPayout(r.employer.fak)} annual={r.employer.fak} negative={false} />
          </TableBody>
          <TableFooter>
            <TableRow className="border-t-2 border-foreground bg-transparent hover:bg-transparent">
              <TableCell className="font-semibold">{dict.employer.totalCost}</TableCell>
              <TableCell />
              <TableCell className="num text-right font-semibold">
                <Money value={perPayout(r.grossAnnual + r.employer.totalAnnual)} />
              </TableCell>
              <TableCell className="num hidden text-right font-semibold sm:table-cell">
                <MoneyWhole value={r.grossAnnual + r.employer.totalAnnual} />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TabsContent>
    </Tabs>
  );
}
