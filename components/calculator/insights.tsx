"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Church,
  PiggyBank,
  Signpost,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { computeInsights, type Insight } from "@/lib/salary/insights";
import { CANTON_DATA } from "@/lib/salary/cantons";
import { CONST_2026 } from "@/lib/salary/constants";
import { chfWhole, pct } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { CalcState } from "./calculator";

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");

const ICONS: Record<Insight["kind"], Icon> = {
  pillar3a: PiggyBank,
  canton: Signpost,
  familyGap: UsersThree,
  church: Church,
  qst13: CalendarPlus,
};

const chfAmount = (n: number) => `CHF ${chfWhole(n)}`;

export function Insights({
  dict,
  state,
  locale,
}: {
  dict: Dict;
  state: CalcState;
  locale: Locale;
}) {
  const t = dict.insights;
  const list = React.useMemo(() => computeInsights(state), [state]);
  if (list.length === 0) return null;

  const render = (i: Insight): { text: string; anchor: string } => {
    switch (i.kind) {
      case "pillar3a":
        return {
          anchor: "pillar-3a",
          text: fill(t.pillar3a, {
            max: chfAmount(CONST_2026.pillar3aMax),
            savings: chfAmount(i.savings),
          }),
        };
      case "canton":
        return {
          anchor: "canton",
          text: fill(t.canton, {
            canton: CANTON_DATA[i.best].names[locale],
            gain: chfAmount(i.gain),
          }),
        };
      case "familyGap":
        return {
          anchor: "family",
          text: fill(i.userIsFamily ? t.familyGapFamily : t.familyGapSingle, {
            canton: CANTON_DATA[state.canton].names[locale],
            single: pct(i.singlePct),
            family: pct(i.familyPct),
          }),
        };
      case "church":
        return { anchor: "church", text: fill(t.church, { cost: chfAmount(i.cost) }) };
      case "qst13":
        return {
          anchor: "withholding",
          text: fill(t.qst13, {
            december: pct(i.decemberPct),
            normal: pct(i.normalPct),
          }),
        };
    }
  };

  return (
    <section>
      <div className="flex items-baseline justify-between border-b pb-3">
        <h2 className="microlabel">{t.title}</h2>
        <Link
          href={`/${locale}/guide`}
          className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t.more}
        </Link>
      </div>
      <ul>
        {list.map((insight) => {
          const { text, anchor } = render(insight);
          const InsightIcon = ICONS[insight.kind];
          return (
            <li
              key={insight.kind}
              className="flex items-start gap-3 border-b py-3 text-sm"
            >
              <InsightIcon
                aria-hidden
                size={15}
                weight="bold"
                className="mt-0.5 shrink-0 text-primary"
              />
              <span className="flex-1">{text}</span>
              <Link
                href={`/${locale}/guide#${anchor}`}
                aria-label={t.more}
                className="num shrink-0 text-muted-foreground transition-colors hover:text-primary"
              >
                →
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">{t.disclaimer}</p>
    </section>
  );
}
