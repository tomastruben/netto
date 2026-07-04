"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { compareCantons } from "@/lib/salary/engine";
import { CANTON_DATA } from "@/lib/salary/cantons";
import { Badge } from "@/components/ui/badge";
import { MoneyWhole } from "./animated-number";
import type { Dict, Locale } from "@/lib/i18n";
import type { CalcState } from "./calculator";

export function CantonCompare({
  dict,
  state,
  locale,
}: {
  dict: Dict;
  state: CalcState;
  locale: Locale;
}) {
  const t = dict.compare;
  const [showAll, setShowAll] = React.useState(false);

  const ranking = React.useMemo(() => compareCantons(state), [state]);
  if (state.grossMonthly <= 0) return null;

  const max = ranking[0]?.netAnnual ?? 1;
  const selectedIdx = ranking.findIndex((r) => r.canton === state.canton);
  const visible = showAll
    ? ranking
    : ranking.filter(
        (_, i) => i < 5 || Math.abs(i - selectedIdx) <= 1 || i === ranking.length - 1
      );

  return (
    <section>
      <div className="flex items-baseline justify-between border-b pb-3">
        <h2 className="microlabel">{t.title}</h2>
        <span className="text-[11px] text-muted-foreground">{t.hint}</span>
      </div>
      <ol className="mt-3 space-y-1">
        {visible.map((row) => {
          const rank = ranking.indexOf(row) + 1;
          const selected = row.canton === state.canton;
          return (
            <li key={row.canton} className="flex items-center gap-3">
              <span className="num w-6 shrink-0 text-right text-[11px] text-muted-foreground">
                {rank}
              </span>
              <span
                className={`w-28 shrink-0 truncate text-xs sm:w-40 ${
                  selected ? "font-semibold" : ""
                }`}
              >
                {CANTON_DATA[row.canton].names[locale]}
                {selected && (
                  <Badge
                    variant="outline"
                    className="ml-1.5 h-4 border-primary/40 px-1.5 text-[9px] uppercase tracking-widest text-primary"
                  >
                    {t.yourCanton}
                  </Badge>
                )}
              </span>
              <div className="h-4 flex-1">
                <div
                  className={`h-full ${selected ? "bg-primary" : "bg-chart-5"}`}
                  style={{ width: `${(row.netAnnual / max) * 100}%` }}
                />
              </div>
              <span
                className={`num w-16 shrink-0 text-right text-xs sm:w-20 ${
                  selected ? "font-semibold" : "text-muted-foreground"
                }`}
              >
                <MoneyWhole value={row.netAnnual} />
              </span>
            </li>
          );
        })}
      </ol>
      <Button
        variant="ghost"
        size="sm"
        className="microlabel mt-2 h-7 px-2"
        onClick={() => setShowAll((v) => !v)}
      >
        {showAll ? t.showLess : t.showAll}
      </Button>
    </section>
  );
}
